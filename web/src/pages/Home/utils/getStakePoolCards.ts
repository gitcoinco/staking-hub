import { getTokensByChainId } from "@gitcoin/gitcoin-chain-data";
import { StakePoolDataCardProps } from "@gitcoin/ui/pool";
import { StakeProjectCardProps } from "@gitcoin/ui/project";
import { StakerOverview } from "@/types/backend";

export const getStakePoolCards = (stakeOverview: StakerOverview): StakePoolDataCardProps[] => {
  const stakePoolCards = stakeOverview.poolsOverview.map((pool): StakePoolDataCardProps => {
    // Find stakes for this pool
    const poolStakes = stakeOverview.stakes.filter(
      (stake) => BigInt(stake.chainId) === BigInt(pool.chainId) && stake.poolId === pool.id,
    );

    // Find claims for this pool
    const poolClaims = stakeOverview.claims.filter(
      (claim) => BigInt(claim.chainId) === BigInt(pool.chainId) && claim.poolId === pool.id,
    );

    const isClaimed = poolClaims.length > 0;

    const isClaimable = pool.isClaimable && !isClaimed;

    const variant = isClaimed ? "claimed" : "staked";

    // Map applications to staked projects
    const stakedProjects = pool.applications
      ?.map((application) => {
        // Check if this application has stakes
        const applicationStakes = poolStakes.filter(
          (stake) => stake.recipient.toLowerCase() === application.anchorAddress.toLowerCase(),
        );

        // Calculate total staked amount for this application
        const amount =
          applicationStakes.reduce((acc, stake) => acc + Number(stake.amount), 0) / 1e18;

        // Get the latest stake timestamp
        const latestStakeTimestamp = Math.max(
          ...applicationStakes.map((stake) => Number(stake.blockTimestamp) * 1000),
          0,
        );

        return {
          name: application.project.metadata.title,
          description: application.project.metadata.description,
          image: application.project.metadata.logoImg
            ? `https://d16c97c2np8a2o.cloudfront.net/ipfs/${application.project.metadata.logoImg}`
            : "https://picsum.photos/200",
          variant: variant as Omit<StakeProjectCardProps["variant"], "stake" | "leaderboard">,
          id: application.id,
          chainId: pool.chainId,
          roundId: pool.id,
          stakedAmount: amount,
          stakedAt: latestStakeTimestamp ? new Date(latestStakeTimestamp) : new Date(),
          unlockAt: new Date(pool.donationsEndTime),
          isClaimable,
          // TODO: add claimedAt
          claimedAt: new Date(),
          // TODO: add txHash of the claim of the reward
          txHash: undefined,
        };
      })
      .sort((a, b) => b.stakedAmount - a.stakedAmount);

    const matchingPoolTokenTicker = getTokensByChainId(pool.chainId).find(
      (token) => token.address === pool.matchTokenAddress,
    )?.code;

    return {
      roundName: pool.roundMetadata.name,
      roundDescription: pool.roundMetadata.eligibility.description,
      chainId: pool.chainId,
      roundId: pool.id,
      votingStartDate: new Date(pool.donationsStartTime),
      votingEndDate: new Date(pool.donationsEndTime),
      totalProjects: pool.approvedProjectCount,
      totalStaked: Number(pool.totalStaked) / 1e18,
      matchingPoolAmount: pool.roundMetadata.quadraticFundingConfig.matchingFundsAvailable,
      stakedAmount:
        stakeOverview.stakes
          .filter(
            (stake) => BigInt(stake.chainId) === BigInt(pool.chainId) && stake.poolId === pool.id,
          )
          .reduce((acc, stake) => acc + Number(stake.amount), 0) / 1e18,
      lastStakeDate: new Date(
        Math.max(
          ...stakeOverview.stakes
            .filter(
              (stake) => BigInt(stake.chainId) === BigInt(pool.chainId) && stake.poolId === pool.id,
            )
            .map((stake) => Number(stake.blockTimestamp) * 1000),
        ),
      ),
      claimed: isClaimed,
      isClaimable,
      stakedProjects: stakedProjects as unknown as StakeProjectCardProps[],
      matchingPoolTokenTicker: matchingPoolTokenTicker || "ETH",
    };
  });

  return stakePoolCards;
};

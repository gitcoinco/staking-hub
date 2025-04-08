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

    const latestClaimTimestamp =
      poolClaims.length > 0
        ? Math.max(
            ...poolClaims.map((claim) => {
              return Number(claim.blockTimestamp) * 1000;
            }),
          )
        : undefined;
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
          name: application.metadata.application.project.title,
          description: application.metadata.application.project.description,
          image: application.metadata.application.project.logoImg
            ? `https://d16c97c2np8a2o.cloudfront.net/ipfs/${application.metadata.application.project.logoImg}`
            : "https://d16c97c2np8a2o.cloudfront.net/ipfs/bafkreihbauobycfxsvr5gm5kad7r74vequsz3dcuozvqori3aukm7hnsju",
          variant: variant as Omit<StakeProjectCardProps["variant"], "stake" | "leaderboard">,
          id: application.id,
          chainId: pool.chainId,
          roundId: pool.id,
          stakedAmount: Number(amount.toFixed(17)),
          stakedAt: latestStakeTimestamp ? new Date(latestStakeTimestamp) : new Date(),
          unlockAt: new Date(pool.donationsEndTime),
          isClaimable,
          claimedAt: latestClaimTimestamp ? new Date(latestClaimTimestamp) : undefined,
          txHash: poolClaims.length > 0 ? poolClaims[0].transactionHash : undefined,
        };
      })
      .filter((project) => !!project.stakedAmount)
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
      totalStaked: Number((Number(pool.totalStaked) / 1e18).toFixed(2)),
      matchingPoolAmount: pool.roundMetadata.quadraticFundingConfig.matchingFundsAvailable,
      stakedAmount: Number(
        (
          stakeOverview.stakes
            .filter(
              (stake) => BigInt(stake.chainId) === BigInt(pool.chainId) && stake.poolId === pool.id,
            )
            .reduce((acc, stake) => acc + Number(stake.amount), 0) / 1e18
        ).toFixed(17),
      ),
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

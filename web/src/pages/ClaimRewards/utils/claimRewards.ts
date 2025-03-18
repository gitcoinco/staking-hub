import { getTokensByChainId } from "@gitcoin/gitcoin-chain-data";
import { StakePoolDataCardProps } from "@gitcoin/ui/pool";
import { StakeProjectCardProps } from "@gitcoin/ui/project";
import { zeroAddress, Address } from "viem";
import { Hex } from "viem";
import { PoolOverview, StakerOverview, Application, Reward } from "@/types/backend";

export type RewardsData = {
  totalRewards: number;
  totalClaimed: number;
  totalUnstaked: bigint;
  allPoolCards: StakePoolDataCardProps[];
  claimablePools: StakePoolDataCardProps[];
  pendingPools: StakePoolDataCardProps[];
  claimedPools: StakePoolDataCardProps[];
  RewardsByPool: Record<string, Reward>;
};

/**
 * Process a pool and its related data to create a structured object
 * @param pool The pool to process
 * @param stakeOverview The stake overview containing stakes, claims, and rewards
 * @param onPoolClick Optional callback for when a pool is clicked
 * @returns Processed pool data with all necessary information
 */
export const processPoolData = (
  pool: PoolOverview,
  stakeOverview: StakerOverview,
  onPoolClick?: (chainId: number, roundId: string) => void,
): StakePoolDataCardProps => {
  // Find stakes for this pool
  const poolStakes = stakeOverview.stakes.filter(
    (stake) => BigInt(stake.chainId) === BigInt(pool.chainId) && stake.poolId === pool.id,
  );

  // Find claims for this pool
  const poolClaims = stakeOverview.claims.filter(
    (claim) => BigInt(claim.chainId) === BigInt(pool.chainId) && claim.poolId === pool.id,
  );

  // Check if pool is claimed
  const isClaimed = poolClaims.length > 0;

  // Check if pool is claimable (voting ended and has rewards but not claimed)
  const now = new Date();
  const votingEnded = new Date(pool.donationsEndTime) < now;
  const isClaimable = votingEnded && pool.isClaimable && !isClaimed;

  // Map applications to staked projects
  const stakedProjects = pool.applications
    ?.map((application: Application) => {
      // Check if this application has stakes
      const applicationStakes = poolStakes.filter(
        (stake) => stake.recipient?.toLowerCase() === application.anchorAddress?.toLowerCase(),
      );

      // Determine variant based on claims/stakes
      let variant: Omit<StakeProjectCardProps["variant"], "leaderboard" | "stake"> = "staked";
      if (poolClaims.length > 0) {
        variant = "claimed";
      } else if (isClaimable) {
        variant = "staked"; // For claimable projects
      }

      // Calculate total staked amount for this application
      const stakedAmount =
        applicationStakes.reduce((acc, stake) => acc + Number(stake.amount), 0) / 1e18;

      // Calculate reward amount if available
      //   const rewardAmount =
      //     applicationRewards.reduce((acc, reward) => acc + Number(reward.amount), 0) / 1e18;

      // Get the latest stake timestamp
      const latestStakeTimestamp =
        applicationStakes.length > 0
          ? Math.max(...applicationStakes.map((stake) => Number(stake.blockTimestamp) * 1000))
          : 0;

      // TODO: Make it possible to add a claim timestamp
      // const latestClaimTimestamp =
      //   applicationClaims.length > 0
      //     ? Math.max(
      //         ...applicationClaims.map((claim) => {
      //           return Number(claim.timestamp) * 1000;
      //         }),
      //       )
      //     : undefined;
      // const claimableAt = latestClaimTimestamp ? new Date(latestClaimTimestamp) : undefined;

      const claimedAt = poolClaims.length > 0 ? new Date() : undefined;

      return {
        name: application.project.metadata.title || "Project Name",
        description: application.project.metadata.description || "Project Description",
        image: application.project.metadata.logoImg
          ? `https://d16c97c2np8a2o.cloudfront.net/ipfs/${application.project.metadata.logoImg}`
          : "https://picsum.photos/200",
        variant,
        id: application.id,
        chainId: Number(pool.chainId),
        roundId: pool.id,
        stakedAmount,
        // rewardAmount: rewardAmount || undefined,
        stakedAt: latestStakeTimestamp ? new Date(latestStakeTimestamp) : new Date(),
        unlockAt: new Date(pool.donationsEndTime),
        claimedAt,
        isClaimable: isClaimable,
        // TODO: Make it possible to add a txHash to the claim
        txHash: undefined,
      };
    })
    ?.sort((a, b) => {
      if (a.stakedAmount && b.stakedAmount) {
        return b.stakedAmount - a.stakedAmount;
      }
      return 0;
    });

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
    stakedAmount: poolStakes.reduce((acc, stake) => acc + Number(stake.amount), 0) / 1e18,
    lastStakeDate:
      poolStakes.length > 0
        ? new Date(Math.max(...poolStakes.map((stake) => Number(stake.blockTimestamp) * 1000)))
        : new Date(),
    claimed: isClaimed,
    isClaimable,
    stakedProjects: stakedProjects as unknown as StakeProjectCardProps[],
    onClick: onPoolClick ? () => onPoolClick(pool.chainId, pool.id) : undefined,
    matchingPoolTokenTicker: matchingPoolTokenTicker || "ETH",
  };
};

/**
 * Process stake overview data to calculate rewards and categorize pools
 * @param stakeOverview The stake overview data
 * @param onPoolClick Optional callback for when a pool is clicked
 * @returns Processed rewards data with totals and categorized pools
 */
export const processRewardsData = (
  stakeOverview: StakerOverview,
  onPoolClick?: (chainId: number, roundId: string) => void,
): RewardsData => {
  // Calculate total rewards
  const totalRewards = stakeOverview.rewards.reduce((total, reward) => {
    return total + Number(reward.amount) / 1e18;
  }, 0);

  // Calculate total claimed
  const totalClaimed = stakeOverview.claims.reduce((total, claim) => {
    return total + Number(claim.amount) / 1e18;
  }, 0);

  // TODO: This needs to be handled differently in the Server in the next GG rounds or if we want to support multiple chains
  const totalUnstaked = BigInt(stakeOverview.currentlyStaked);

  // Process all pools
  const allPoolCards = stakeOverview.poolsOverview.map((pool) =>
    processPoolData(pool, stakeOverview, onPoolClick),
  );

  const claimedPoolsMap = new Map<
    string,
    {
      chainId: number;
      roundId: string;
    }
  >();

  stakeOverview.claims.forEach((claim) => {
    claimedPoolsMap.set(claim.poolId, {
      chainId: claim.chainId,
      roundId: claim.poolId,
    });
  });

  // Categorize pools
  const claimablePools = allPoolCards.filter((pool) => pool.isClaimable);
  const pendingPools = allPoolCards.filter(
    (pool) => !pool.isClaimable && !claimedPoolsMap.has(pool.roundId),
  );
  const claimedPools = allPoolCards.filter((pool) => pool.claimed);

  const RewardsByPool = stakeOverview.rewards.reduce<Record<string, Reward>>(
    (acc, reward) => {
      const poolId = reward.poolId;
      if (!acc[poolId]) {
        acc[poolId] = reward;
      }
      return acc;
    },
    {} as Record<string, Reward>,
  );

  return {
    totalRewards,
    totalClaimed,
    totalUnstaked,
    allPoolCards,
    claimablePools,
    pendingPools,
    claimedPools,
    RewardsByPool,
  };
};

/**
 * Get the claimable rewards in USD params
 * @param stakeOverview The stake overview data
 * @returns The claimable rewards in USD params
 */
export const getClaimableRewardsInUSDParams = (stakeOverview?: StakerOverview) => {
  return stakeOverview?.poolsOverview
    .map((pool) => ({
      rewardsAmount: Number(stakeOverview?.rewards.find((r) => r.poolId === pool.id)?.amount ?? 0n),
      tokenAddress: pool.matchTokenAddress,
      chainId: pool.chainId,
      roundId: pool.id,
    }))
    .filter((r) => !stakeOverview.claims.find((c) => c.poolId === r.roundId));
};

export interface ClaimData {
  chainId: number;
  poolId: string;
  recipient: Address;
  amount: bigint;
  merkleProof: Hex[];
  returnToMatchingPool: boolean;
  merkleAirdropAddress: string;
}

/**
 * Prepares claim data for batch claiming
 * @param claimablePools Array of pools that are claimable
 * @param rewardsByPool Record of rewards indexed by pool ID
 * @param userAddress User's address (defaults to zero address if not provided)
 * @param returnToMatchingPool Whether to return unclaimed rewards to matching pool
 * @returns Array of claim data objects ready for batch claiming
 */
export const prepareClaimData = (
  claimablePools: StakePoolDataCardProps[],
  rewardsByPool: Record<string, Reward>,
  userAddress?: Address | null,
  returnToMatchingPool: boolean = false,
): ClaimData[] => {
  try {
    // Map pools to claim data
    const claims = claimablePools
      .map((pool) => {
        // Get reward data for this pool
        const poolReward = rewardsByPool[pool.roundId];

        // Skip if no reward data found
        if (!poolReward) {
          console.warn(`No reward data found for pool ${pool.roundId}`);
          return null;
        }

        return {
          chainId: pool.chainId,
          poolId: pool.roundId,
          recipient: userAddress ?? zeroAddress,
          amount: BigInt(poolReward.amount || 0),
          merkleProof: poolReward.proof ?? [],
          returnToMatchingPool,
          merkleAirdropAddress: poolReward.merkleAirdropAddress ?? "",
        };
      })
      // Filter out null values and empty merkleAirdropAddress
      .filter(
        (claim): claim is ClaimData =>
          claim !== null && claim.merkleAirdropAddress !== "" && claim.amount > BigInt(0),
      );

    return claims;
  } catch (error) {
    console.error("Error preparing claim data:", error);
    return [];
  }
};

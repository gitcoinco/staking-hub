import { StakerOverview } from "@/types/backend";

export const getClaimedRewardsInUSDParams = (stakeOverview?: StakerOverview) => {
  return stakeOverview?.poolsOverview.map((pool) => ({
    rewardsAmount: Number(stakeOverview?.rewards.find((r) => r.poolId === pool.id)?.amount ?? 0n),
    tokenAddress: pool.matchTokenAddress,
    chainId: pool.chainId,
    roundId: pool.id,
  }));
};

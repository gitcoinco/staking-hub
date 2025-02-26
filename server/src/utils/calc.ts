import type { Project, Stake, RewardCalculation } from '@/types';

function calculateRewards(
  totalRewardPool: bigint,
  totalMatchAmount: bigint,
  totalDuration: bigint,
  projects: Project[],
  stakes: Stake[]
): RewardCalculation[] {
  const rewards: RewardCalculation[] = [];
  const projectWeights: Record<string, bigint> = {};
  const userWeights: Record<string, bigint> = {};

  // Calculate weights for each stake
  for (const stake of stakes) {
    const timeLeft = totalDuration - BigInt(stake.timestamp);
    const stakeWeight = BigInt(stake.amount) * timeLeft;

    projectWeights[stake.project] = (projectWeights[stake.project] ?? BigInt(0)) + stakeWeight;
    userWeights[`${stake.user}:${stake.project}`] = (userWeights[`${stake.user}:${stake.project}`] ?? BigInt(0)) + stakeWeight;
  }

  // Calculate rewards for each project and user
  for (const project of projects) {
    const projectRewardPool = (project.matchAmount / totalMatchAmount) * totalRewardPool;

    for (const stake of stakes.filter((s) => s.project === project.id)) {
      const userWeight = userWeights[`${stake.user}:${project.id}`];
      const projectWeight = projectWeights[project.id];
      const userReward = (userWeight / projectWeight) * projectRewardPool;

      rewards.push({
        user: stake.user,
        project: project.id,
        reward: userReward
      });
    }
  }

  return rewards;
}

export default calculateRewards;
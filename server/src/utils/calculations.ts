import type {
  RewardCalculation,
  CalculatedReward,
  MerkleData,
} from '@/types';
import { keccak256, encodePacked, type Hex } from 'viem';
import { MerkleTree } from 'merkletreejs';
import { type MatchingDistribution, type Stake } from '@/ext/indexer';

export function calculateRewards(
  totalRewardPool: bigint,
  totalMatchAmount: bigint,
  totalDuration: bigint,
  matchingDistribution: MatchingDistribution[],
  stakes: Stake[]
): RewardCalculation[] {
  console.log('==> 1. Initial inputs:', {
    totalRewardPool: totalRewardPool.toString(),
    totalMatchAmount: totalMatchAmount.toString(),
    totalDuration: totalDuration.toString(),
    matchingDistributionCount: matchingDistribution.length,
    stakesCount: stakes.length
  });

  const rewards: RewardCalculation[] = [];
  const projectWeights: Record<string, bigint> = {};
  const userWeights: Record<string, bigint> = {};

  // Calculate weights for each stake
  for (const stake of stakes) {
    const timestampSeconds = BigInt(stake.blockTimestamp.toString());
    const timeLeft = totalDuration - timestampSeconds;
    const stakeWeight = BigInt(stake.amount) * timeLeft;

    console.log('==> 2. Processing stake:', {
      sender: stake.sender,
      recipient: stake.recipient,
      amount: stake.amount,
      timestamp: stake.blockTimestamp,
      timestampSeconds: timestampSeconds.toString(),
      timeLeft: timeLeft.toString(),
      stakeWeight: stakeWeight.toString()
    });

    projectWeights[stake.recipient] =
      (projectWeights[stake.recipient] ?? BigInt(0)) + stakeWeight;
    userWeights[`${stake.sender}:${stake.recipient}`] =
      (userWeights[`${stake.sender}:${stake.recipient}`] ?? BigInt(0)) +
      stakeWeight;
    
    console.log('==> 3. Updated weights:', {
      projectWeight: projectWeights[stake.recipient].toString(),
      userWeight: userWeights[`${stake.sender}:${stake.recipient}`].toString()
    });
  }

  console.log('==> 4. Final weights:', {
    projectWeights: Object.fromEntries(
      Object.entries(projectWeights).map(([k, v]) => [k, v.toString()])
    ),
    userWeights: Object.fromEntries(
      Object.entries(userWeights).map(([k, v]) => [k, v.toString()])
    )
  });

  // Calculate rewards for each project and user
  for (const project of matchingDistribution) {

    const matchAmountInToken = BigInt(project.matchAmountInToken);

    const projectRewardPool = (matchAmountInToken / totalMatchAmount) * totalRewardPool;

    console.log('==> 5. Processing project:', {
      projectId: project.projectId,
      matchAmount: matchAmountInToken,
      projectRewardPool: projectRewardPool.toString()
    });

    for (const stake of stakes.filter(s => s.recipient === project.projectId)) {
      const userWeight = userWeights[`${stake.sender}:${project.projectId}`];
      const projectWeight = projectWeights[project.projectId];
      const userReward = (userWeight / projectWeight) * projectRewardPool;

      console.log('==> 6. Calculating user reward:', {
        user: stake.sender,
        projectId: project.projectId,
        userWeight: userWeight.toString(),
        projectWeight: projectWeight.toString(),
        userReward: userReward.toString()
      });

      rewards.push({
        user: stake.sender,
        project: project.projectId,
        reward: userReward,
      });
    }
  }

  console.log('==> 7. Final rewards:', rewards.map(r => ({
    ...r,
    reward: r.reward.toString()
  })));

  return rewards;
}

export const generateMerkleData = (
  calculatedRewards: CalculatedReward[]
): MerkleData => {
  // Create leaves for Merkle Tree
  const leaves = calculatedRewards.map((reward: CalculatedReward) => {
    return keccak256(
      encodePacked(['address', 'uint256'], [reward.user as Hex, reward.reward])
    );
  });

  // Create Merkle Tree
  const merkleTree = new MerkleTree(leaves, keccak256, {
    sortPairs: true,
  });

  // Get Merkle Root
  const merkleRoot = merkleTree.getHexRoot();

  // Transform rewards and include Merkle proofs
  const rewards = calculatedRewards.map((reward, index) => {
    const leaf = leaves[index];
    const proof = merkleTree.getHexProof(leaf);

    return {
      recipientId: reward.user,
      amount: reward.reward.toString(),
      proof,
    };
  });

  return { merkleRoot, rewards };
};

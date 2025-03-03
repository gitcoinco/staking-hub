import type {
  Project,
  RewardCalculation,
  CalculatedReward,
  MerkleData,
} from '@/types';
import { keccak256, encodePacked, type Hex } from 'viem';
import { MerkleTree } from 'merkletreejs';
import { Stake } from '@/ext/indexer';

export function calculateRewards(
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
    const timeLeft = totalDuration - BigInt(stake.db_write_timestamp);
    const stakeWeight = BigInt(stake.amount) * timeLeft;

    projectWeights[stake.recipient] =
      (projectWeights[stake.recipient] ?? BigInt(0)) + stakeWeight;
    userWeights[`${stake.sender}:${stake.recipient}`] =
      (userWeights[`${stake.sender}:${stake.recipient}`] ?? BigInt(0)) +
      stakeWeight;
  }

  // Calculate rewards for each project and user
  for (const project of projects) {
    const projectRewardPool =
      (project.matchAmount / totalMatchAmount) * totalRewardPool;

    for (const stake of stakes.filter(s => s.recipient === project.id)) {
      const userWeight = userWeights[`${stake.sender}:${project.id}`];
      const projectWeight = projectWeights[project.id];
      const userReward = (userWeight / projectWeight) * projectRewardPool;

      rewards.push({
        user: stake.sender,
        project: project.id,
        reward: userReward,
      });
    }
  }

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

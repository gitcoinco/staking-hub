import type {
  RewardCalculation,
  CalculatedReward,
  MerkleData,
} from '@/types';
import { keccak256, encodePacked, type Hex } from 'viem';
import { MerkleTree } from 'merkletreejs';
import { type MatchingDistributionWithAnchorAddress, type Stake } from '@/ext/indexer';

export function calculateRewards(
  totalRewardPool: bigint,
  totalMatchAmount: bigint,
  totalDuration: bigint,
  matchingDistribution: MatchingDistributionWithAnchorAddress[],
  stakes: Stake[]
): RewardCalculation[] {
  // Get set of projects that have stakes
  const projectsWithStakes = new Set(stakes.map(s => s.recipient.toLowerCase()));

  // log sum of stakes by user
  const stakesByUser = stakes.reduce<Record<string, bigint>>((acc, stake) => {
    const userId = stake.sender.toLowerCase();
    const amount = BigInt(stake.amount);
    acc[userId] = (acc[userId] ?? BigInt(0)) + amount;
    return acc;
  }, {});

  console.log('==> Stakes by user:', stakesByUser);
  

  // Calculate total match amount for ONLY projects with stakes
  const stakedProjectsMatchAmount = matchingDistribution
    .filter(p => projectsWithStakes.has(p.anchorAddress.toLowerCase()))
    .reduce((sum, p) => sum + BigInt(p.matchAmountInToken), BigInt(0));

  console.log('==> Initial values:', {
    totalRewardPool: totalRewardPool.toString(),
    totalMatchAmount: totalMatchAmount.toString(),
    stakedProjectsMatchAmount: stakedProjectsMatchAmount.toString(),
    numProjectsWithStakes: projectsWithStakes.size
  });

  // Calculate weights for stakes
  const projectWeights: Record<string, bigint> = {};
  const userWeights: Record<string, bigint> = {};

  // Step 1: Calculate stake weights
  for (const stake of stakes) {
    const timestampSeconds = BigInt(stake.blockTimestamp.toString());
    const timeLeft = totalDuration - timestampSeconds;
    const stakeWeight = BigInt(stake.amount) * timeLeft;

    const projectId = stake.recipient.toLowerCase();
    const userId = stake.sender.toLowerCase();

    projectWeights[projectId] = (projectWeights[projectId] ?? BigInt(0)) + stakeWeight;
    userWeights[`${userId}:${projectId}`] = (userWeights[`${userId}:${projectId}`] ?? BigInt(0)) + stakeWeight;

    console.log('==> Stake weight calculation:', {
      userId,
      projectId,
      amount: stake.amount.toString(),
      timeLeft: timeLeft.toString(),
      stakeWeight: stakeWeight.toString()
    });
  }

  // Step 2: Calculate and distribute rewards
  const userRewards: Record<string, bigint> = {};
  let totalDistributed = BigInt(0);

  for (const projectId of Object.keys(projectWeights)) {
    const project = matchingDistribution.find(p => p.anchorAddress.toLowerCase() === projectId);
    if (project === null || project === undefined) continue;

    const matchAmount = BigInt(project.matchAmountInToken);
    const projectReward = (matchAmount * totalRewardPool) / stakedProjectsMatchAmount;
    const totalProjectWeight = projectWeights[projectId];
    
    if (totalProjectWeight > 0) {
      for (const [key, userWeight] of Object.entries(userWeights)) {
        const [userIdKey, projectIdKey] = key.split(':');
    
        if (projectIdKey !== '' && projectIdKey === projectId) {  // Add explicit empty string check
          const userReward = (userWeight * projectReward) / totalProjectWeight;
          userRewards[userIdKey] = (userRewards[userIdKey] ?? BigInt(0)) + userReward;
          totalDistributed += userReward;
    
          console.log('==> Reward calculation:', {
            userId: userIdKey,
            projectId,
            matchAmount: matchAmount.toString(),
            projectReward: projectReward.toString(),
            userWeight: userWeight.toString(),
            totalProjectWeight: totalProjectWeight.toString(),
            userReward: userReward.toString()
          });
        }
      }
    }
    
  }

  console.log('==> Final distribution:', {
    totalRewardPool: totalRewardPool.toString(),
    totalDistributed: totalDistributed.toString(),
    difference: (totalRewardPool - totalDistributed).toString()
  });

  // Normalize if there's any rounding difference
  const difference = totalRewardPool - totalDistributed;
  if (difference !== BigInt(0)) {
    const firstUser = Object.keys(userRewards)[0];
    if (firstUser !== '') userRewards[firstUser] += difference;
  }

  return Object.entries(userRewards).map(([user, reward]) => ({
    user,
    reward,
  }));
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

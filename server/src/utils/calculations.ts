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

    projectWeights[stake.recipient.toLowerCase()] =
      (projectWeights[stake.recipient.toLowerCase()] ?? BigInt(0)) + stakeWeight;
    userWeights[`${stake.sender.toLowerCase()}:${stake.recipient.toLowerCase()}`] =
      (userWeights[`${stake.sender.toLowerCase()}:${stake.recipient.toLowerCase()}`] ?? BigInt(0)) +
      stakeWeight;
    
    console.log('==> 3. Updated weights:', {
      projectWeight: projectWeights[stake.recipient.toLowerCase()]?.toString() ?? '0',
      userWeight: userWeights[`${stake.sender.toLowerCase()}:${stake.recipient.toLowerCase()}`]?.toString() ?? '0'
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

    // console.log(project)
    // console.log("==> 5. matchAmountInToken: ", matchAmountInToken.toString());
    // console.log("==> 6. totalMatchAmount: ", totalMatchAmount.toString());
    // console.log("==> 7. totalRewardPool: ", totalRewardPool.toString());

    const projectRewardPool = (matchAmountInToken * totalRewardPool) / totalMatchAmount;

    // console.log("==> 8. projectRewardPool: ", projectRewardPool.toString());

    // console.log('==> 9. Processing project:', {
    //   projectId: project.projectId,
    //   matchAmount: matchAmountInToken,
    //   projectRewardPool: projectRewardPool.toString()
    // });

    // todo: that wont work, because the projectId is not the recipient. we would need the anchorAddress here. 
    // Does it make sense to update the staking contract, or should we fetch the anchor from somewhere?
    for (const stake of stakes.filter(s => s.recipient.toLowerCase() === project.anchorAddress.toLowerCase())) {
      console.log("====HUHU FUCKER");
      const userWeight = userWeights[`${stake.sender.toLowerCase()}:${project.anchorAddress.toLowerCase()}`] ?? BigInt(0);
      const projectWeight = projectWeights[project.anchorAddress.toLowerCase()] ?? BigInt(0);

      // Set reward to 0 if weights are 0, otherwise calculate normally
      console.log("==> 10. userWeight: ", userWeight.toString());
      console.log("==> 11. projectWeight: ", projectWeight.toString());
      console.log("==> 12. projectRewardPool: ", projectRewardPool.toString());
      const userReward = (userWeight === BigInt(0) || projectWeight === BigInt(0))
        ? BigInt(0)
        : (userWeight * BigInt(projectRewardPool)) / projectWeight;

      console.log('==> 10. Calculating user reward:', {
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

  console.log('==> 11. Final rewards:', rewards.map(r => ({
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

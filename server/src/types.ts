export interface RewardCalculation {
  user: string;
  reward: bigint;
}

export interface CalculatedReward {
  user: string;
  reward: bigint;
}

export interface MerkleData {
  merkleRoot: string;
  rewards: Array<{
    staker: string;
    amount: string;
    proof: string[];
  }>;
}

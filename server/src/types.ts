export interface Project {
  id: string;
  matchAmount: bigint;
}

export interface RewardCalculation {
  user: string;
  project: string;
  reward: bigint;
}

export interface CalculatedReward {
  user: string;
  reward: bigint;
}

export interface MerkleData {
  merkleRoot: string;
  rewards: Array<{
    recipientId: string;
    amount: string;
    proof: string[];
  }>;
}

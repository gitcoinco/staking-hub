export interface Stake {
    user: string;
    project: string;
    amount: bigint;
    timestamp: bigint;
  };
  
  export interface Project {
    id: string;
    matchAmount: bigint;
  };
  
  export interface RewardCalculation {
    user: string;
    project: string;
    reward: bigint;
  };
  
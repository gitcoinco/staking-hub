export type Address = `0x${string}`;

export enum Status {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ApplicationMetadata {
  signature: string;
  application: {
    round: string;
    answers: Array<{
      type: string;
      hidden: boolean;
      question: string;
      questionId: number;
      encryptedAnswer?: {
        ciphertext: string;
        encryptedSymmetricKey: string;
      };
    }>;
    project: ProjectMetadata;
    recipient: string;
  };
}

export interface Eligibility {
  description: string;
  requirements?: Array<{
    requirement?: string;
  }>;
}

export interface RoundMetadata {
  name: string;
  roundType: 'public' | 'private';
  eligibility: Eligibility;
  programContractAddress: string;
  support?: {
    info: string;
    type: string;
  };
}

export interface ProjectMetadata {
  title: string;
  description: string;
  website: string;
  bannerImg?: string;
  logoImg?: string;
  projectTwitter?: string;
  userGithub?: string;
  projectGithub?: string;
  // credentials: ProjectCredentials;
  owners: Array<{ address: string }>;
  createdAt: number;
  lastUpdated: number;
}

export interface Application {
  id: string;
  anchorAddress: string;
  metadata: ApplicationMetadata;
  metadataCid: string;
  status: Status;
  projectId: string;
  totalDonationsCount: number;
  totalAmountDonatedInUsd: number;
  project: {
    metadata: ProjectMetadata;
    metadataCid: string;
  };
}

export interface Round {
  chainId: number;
  id: string;
  roundMetadata: RoundMetadata;
  roundMetadataCid: string;
  donationsStartTime: string;
  donationsEndTime: string;
}

export interface RoundWithApplications extends Round {
  applications: Application[];
}

export interface RoundApplicationsQueryResponse {
  rounds: RoundWithApplications[];
}

export interface ApplicationWithRound {
  id: string;
  chainId: number;
  metadata: ApplicationMetadata;
  metadataCid: string;
  round: {
    id: string;
    roundMetadata: RoundMetadata;
  };
}

export interface RoundMatchingDistributionsQueryResponse {
  rounds: RoundMatchingDistributions[];
}

export interface RoundMatchingDistributions {
  matchAmount: string;
  donationsEndTime: string;
  matchingDistribution: {
    usdPrice: number;
    blockNumber: number;
    blockTimestamp: string;
    usdPriceTimestampAt: string;
    matchingDistribution: MatchingDistribution[];
  };
}

export interface MatchingDistribution {
  projectId: string;
  projectName: string;
  applicationId: string;
  contributionsCount: number;
  matchAmountInToken: string;
  matchPoolPercentage: number;
  projectPayoutAddress: string;
  originalMatchAmountInToken: string;
}

export interface MatchingDistributionWithAnchorAddress extends MatchingDistribution {
  anchorAddress: string;
}

export interface ApplicationRoundQueryResponse {
  application: ApplicationWithRound;
}

export interface GetRoundsQueryResponse {
  rounds: Round[];
}

export interface Stake {
  chainId: number;
  amount: string;
  poolId: string;
  recipient: string;
  sender: string;
  blockTimestamp: string;
}

export interface PoolStakesQueryResponse {
  TokenLock_Locked: Stake[];
}

export interface RoundWithStakes extends RoundWithApplications {
  stakes: Stake[];
  totalStakesByAnchorAddress: Record<string, string>;
}

export interface RewardWithoutProof {
  recipientId: string;
  amount: string;
}

export interface PoolOverview extends Round {
  totalStaked: number;
  approvedProjectCount: number;
}

export interface StakerOverview {
  currentlyStaked: number;
  poolsOverview: PoolOverview[];
  stakes: Stake[];
  rewards: RewardWithoutProof[];
}
import { gql } from 'graphql-request';

export const getRounds = gql`
  query Rounds($chainId: Int!, $roundIds: [String!]!) {
    rounds(where: { chainId: { _eq: $chainId }, id: { _in: $roundIds } }) {
      id
      chainId
      roundMetadata
      roundMetadataCid
      donationsStartTime
      donationsEndTime
    }
  }
`;

export const getRoundsWithApplications = gql`
  query RoundsApplications($chainId: Int!, $roundIds: [String!]!) {
    rounds(where: { chainId: { _eq: $chainId }, id: { _in: $roundIds } }) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      donationsStartTime
      donationsEndTime
      matchTokenAddress
      applications(where: { status: { _eq: APPROVED } }) {
        id
        anchorAddress
        metadata
        metadataCid
        status
        projectId
        totalDonationsCount
        totalAmountDonatedInUsd
        uniqueDonorsCount
        project {
          metadata
          metadataCid
        }
      }
    }
  }
`;

export const getRoundsWithApplicationsStatus = gql`
  query RoundsWithApplicationsStatus($chainId: Int!, $roundIds: [String!]!) {
    rounds(where: { chainId: { _eq: $chainId }, id: { _in: $roundIds } }) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      donationsStartTime
      donationsEndTime
      applications(where: { status: { _eq: APPROVED } }) {
        id
        anchorAddress
        metadata
        metadataCid
        status
        projectId
        totalDonationsCount
        uniqueDonorsCount
        totalAmountDonatedInUsd
        project {
          metadata
          metadataCid
        }
      }
    }
  }
`;

export const getRoundWithApplications = gql`
  query RoundApplications($chainId: Int!, $roundId: String!) {
    rounds(where: { chainId: { _eq: $chainId }, id: { _eq: $roundId } }) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      donationsStartTime
      donationsEndTime
      applications(where: { status: { _eq: APPROVED } }) {
        id
        metadata
        metadataCid
        status
        projectId
        project {
          metadata
          metadataCid
        }
      }
    }
  }
`;

export const getApplicationWithRound = gql`
  query RoundApplication(
    $chainId: Int!
    $roundId: String!
    $applicationId: String!
  ) {
    application(chainId: $chainId, roundId: $roundId, id: $applicationId) {
      metadata
      metadataCid
      round {
        roundMetadata
      }
    }
  }
`;

export const getRoundMatchingDistributions = gql`
  query RoundMatchingDistributions($chainId: Int!, $roundId: String!) {
    rounds(where: { chainId: { _eq: $chainId }, id: { _eq: $roundId } }) {
      matchAmount
      donationsEndTime
      matchingDistribution
    }
  }
`;

export const getPoolStakes = gql`
  query PoolStakes($chainId: numeric!, $poolId: numeric!) {
    TokenLock_Locked(
      where: { chainId: { _eq: $chainId }, poolId: { _eq: $poolId } }
      order_by: { amount: desc }
    ) {
      chainId
      amount
      poolId
      recipient
      sender
      blockTimestamp
    }
  }
`;

export const getPoolStakesAndClaimsByStaker = gql`
  query PoolStakesAndClaimsByStaker($staker: String!) {
    TokenLock_Locked(
      where: { sender: { _eq: $staker } }
      order_by: { amount: desc }
    ) {
      chainId
      amount
      poolId
      recipient
      sender
      blockTimestamp
    }

    TokenLock_Claimed(where: { owner: { _eq: $staker } }) {
      owner
      amount
    }

    MerkleAirdrop_Claim(where: { claimant: { _eq: $staker } }) {
      chainId
      poolId
      amount
      claimant
      transactionHash
      blockTimestamp
    }
  }
`;

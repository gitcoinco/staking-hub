import { gql } from 'graphql-request';

export const getRounds = gql`
  query Rounds($chainId: Int!, $roundIds: [String!]!) {
    rounds(filter: { chainId: { equalTo: $chainId }, id: { in: $roundIds } }) {
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
    rounds(
      filter: { chainId: { equalTo: $chainId }, id: { in: $roundIds } }
    ) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      donationsStartTime
      donationsEndTime
      applications(filter: { status: { equalTo: APPROVED } }) {
        id
        anchorAddress
        metadata
        metadataCid
        status
        projectId
        totalDonationsCount
        totalAmountDonatedInUsd
        project: canonicalProject {
          metadata
          metadataCid
        }
      }
    }
  }
`;

export const getRoundsWithApplicationsStatus = gql`
  query RoundsWithApplicationsStatus($chainId: Int!, $roundIds: [String!]!) {
    rounds(filter: { chainId: { equalTo: $chainId }, id: { in: $roundIds } }) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      donationsStartTime
      donationsEndTime
      applications(filter: { status: { equalTo: APPROVED } }) {
        status
      }
    }
  }
`;

export const getRoundWithApplications = gql`
  query RoundApplications($chainId: Int!, $roundId: String!) {
    rounds(
      filter: { chainId: { equalTo: $chainId }, id: { equalTo: $roundId } }
    ) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      donationsStartTime
      donationsEndTime
      applications(filter: { status: { equalTo: APPROVED } }) {
        id
        metadata
        metadataCid
        status
        projectId
        project: canonicalProject {
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
    rounds(
      filter: {
        chainId: { equalTo: $chainId }
        id: { equalTo: $roundId }
      }
    ) {
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
      order_by: {amount: desc}
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
      order_by: {amount: desc}
    ) {
      chainId
      amount
      poolId
      recipient
      sender
      blockTimestamp
    }

    TokenLock_Claimed(
      where: { owner: { _eq: $staker } }
    ) {
      owner
      amount
    }

    MerkleAirdrop_Claim(
      where: { claimant: { _eq: $staker } }
    ) {
      chainId
      poolId
      amount
      claimant
    }
  }
`;

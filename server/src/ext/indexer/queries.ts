import { gql } from 'graphql-request';

export const getRounds = gql`
  query Rounds($chainId: Int!, $roundIds: [String!]!) {
    rounds(filter: { chainId: { equalTo: $chainId }, id: { in: $roundIds } }) {
      id
      chainId
      roundMetadata
      roundMetadataCid
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
      applications {
        id
        anchorAddress
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

export const getRoundWithApplications = gql`
  query RoundApplications($chainId: Int!, $roundId: String!) {
    rounds(
      filter: { chainId: { equalTo: $chainId }, id: { equalTo: $roundId } }
    ) {
      chainId
      id
      roundMetadata
      roundMetadataCid
      applications {
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
      db_write_timestamp
    }
  }
`;

export const getPoolStakesForRecipient = gql`
  query PoolStakesForRecipient($recipientId: String!) {
    TokenLock_Locked(
      where: { recipient: { _eq: $recipientId } }
      order_by: {amount: desc}
    ) {
      chainId
      amount
      poolId
      recipient
      sender
      db_write_timestamp
    }
  }
`;
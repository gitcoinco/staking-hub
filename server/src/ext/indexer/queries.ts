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

export const getRoundDistributions = gql`
  query RoundDistributions($chainId: Int!, $roundId: String!) {
    rounds(
      where: {
        chainId: { _eq: $chainId }
        id: { _eq: $roundId }
        strategyName: { _eq: "allov2.EasyRetroFundingStrategy" }
      }
    ) {
      totalDistributed
      applications(where: { distributionTransaction: { _isNull: false } }) {  # Fix query
        id
        distributionTransaction
      }
    }
  }
`;

export const getPoolStakes = gql`
  query PoolStakes($chainId: numeric!, $poolId: numeric!) {
    TokenLock_Locked(where: { chainId: { _eq: $chainId }, poolId: { _eq: $poolId } }) {
      chainId
      amount
      poolId
      recipient
      sender
    }
  }
`;
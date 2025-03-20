import { GraphQLClient } from 'graphql-request';
import { IsNullError } from '@/errors';

export const createGraphQLClient = (
  graphqlEndpoint?: string,
  opts?: { envName: string }
) => {
  if (!graphqlEndpoint) {
    throw new IsNullError(
      `${opts?.envName ?? 'graphqlEndpoint variable'} is not set`
    );
  }

  if (graphqlEndpoint.endsWith('/')) {
    graphqlEndpoint = graphqlEndpoint.slice(0, -1);
  }

  if (!graphqlEndpoint.endsWith('/graphql')) {
    graphqlEndpoint += '/graphql';
  }

  return new GraphQLClient(graphqlEndpoint);
};

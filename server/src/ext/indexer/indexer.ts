import { createLogger } from '@/logger';
import type {
  RoundApplicationsQueryResponse,
  RoundWithApplications,
  RoundDistributionsQueryResponse,
  Round,
  GetRoundsQueryResponse,
  PoolStakesQueryResponse,
  Stake,
} from './types';
import request from 'graphql-request';
import {
  getRoundWithApplications,
  getRoundDistributions,
  getRounds,
  getPoolStakes,
  getPoolStakesForRecipient,
} from './queries';
import type { Logger } from 'winston';
import { IsNullError, NotFoundError } from '@/errors';
import { env } from '@/env';

class IndexerClient {
  private static instance: IndexerClient | null = null;
  private readonly indexerEndpoint: string;
  private readonly stakingIndexerEndpoint: string;
  private readonly logger: Logger;

  private constructor() {
    this.indexerEndpoint = env.INDEXER_URL ?? '';
    this.stakingIndexerEndpoint = env.STAKING_INDEXER_URL ?? '';

    if (this.indexerEndpoint === '') {
      throw new IsNullError('INDEXER_URL is not set');
    }

    if (this.stakingIndexerEndpoint === '') {
      throw new IsNullError('STAKING_INDEXER_URL is not set');
    }

    if (this.indexerEndpoint.endsWith('/')) {
      this.indexerEndpoint = this.indexerEndpoint.slice(0, -1);
    }

    if (this.stakingIndexerEndpoint.endsWith('/')) {
      this.stakingIndexerEndpoint = this.stakingIndexerEndpoint.slice(0, -1);
    }

    if (!this.indexerEndpoint.endsWith('/graphql')) {
      this.indexerEndpoint += '/graphql';
    }

    if (!this.stakingIndexerEndpoint.endsWith('/graphql')) {
      this.stakingIndexerEndpoint += '/graphql';
    }

    this.logger = createLogger('Indexer.ts');
  }

  public static getInstance(): IndexerClient {
    if (IndexerClient.instance === null) {
      IndexerClient.instance = new IndexerClient();
    }
    return IndexerClient.instance;
  }

  async getRoundWithApplications({
    chainId,
    roundId,
  }: {
    chainId: number;
    roundId: string;
  }): Promise<RoundWithApplications | null> {
    this.logger.debug(
      `Requesting round with applications for roundId: ${roundId}, chainId: ${chainId}`
    );

    const requestVariables = {
      chainId,
      roundId,
    };

    try {
      const response: RoundApplicationsQueryResponse = await request(
        this.indexerEndpoint,
        getRoundWithApplications,
        requestVariables
      );

      if (response.rounds.length === 0) {
        this.logger.warn(
          `No round found for roundId: ${roundId} on chainId: ${chainId}`
        );
        return null;
      }

      const round = response.rounds[0];

      this.logger.info(
        `Successfully fetched round with ID: ${round.id}, which includes ${round.applications.length} applications`
      );
      return round;
    } catch (error) {
      this.logger.error(
        `Failed to fetch round with applications: ${error.message}`,
        { error }
      );
      throw error;
    }
  }

  async getRoundDistributions({
    chainId,
    roundId,
  }: {
    chainId: number;
    roundId: string;
  }): Promise<RoundDistributionsQueryResponse> {
    const requestVariables = { chainId, roundId };

    try {
      const response: RoundDistributionsQueryResponse = await request(
        this.indexerEndpoint,
        getRoundDistributions,
        requestVariables
      );
 
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to fetch round distributions: ${error.message}`,
        {
          error,
        }
      );
      throw error;
    }
  }

  async getRounds({
    chainId,
    roundIds,
  }: {
    chainId: number;
    roundIds: string[];
  }): Promise<Round[]> {
    const requestVariables = { chainId, roundIds };
    try {
      const response: GetRoundsQueryResponse = await request(
        this.indexerEndpoint,
        getRounds,
        requestVariables
      );

      return response.rounds;
    } catch (error) {
      this.logger.error(`Failed to fetch rounds: ${error.message}`, { error });
      throw error;
    }
  }

  async getPoolStakes({
    chainId,
    poolId,
  }: {
    chainId: number;
    poolId: number;
  }): Promise<Stake[]> {
    const requestVariables = { chainId, poolId };
    try {
      const response: PoolStakesQueryResponse = await request(
        this.stakingIndexerEndpoint,
        getPoolStakes,
        requestVariables
      );

      return response.TokenLock_Locked;
    } catch (error) {
      this.logger.error(`Failed to fetch pool stakes: ${error.message}`, { error });
      throw error;
    }
  }

  async getPoolStakesForRecipient({
    recipientId
  }: {
    recipientId: string;
  }): Promise<Stake[]> {
    const requestVariables = { recipientId };
    try {
      const response: PoolStakesQueryResponse = await request(
        this.stakingIndexerEndpoint,
        getPoolStakesForRecipient,
        requestVariables
      );

      return response.TokenLock_Locked;
    } catch (error) {
      this.logger.error(`Failed to fetch pool stakes: ${error.message}`, { error });
      throw error;
    }
  }
}


export const indexerClient = IndexerClient.getInstance();

import { createLogger } from '@/logger';
import type {
  RoundApplicationsQueryResponse,
  RoundWithApplications,
  RoundMatchingDistributionsQueryResponse,
  Round,
  GetRoundsQueryResponse,
  PoolStakesAndClaimsQueryResponse,
  Stake,
  RoundMatchingDistributions,
  PoolOverview,
  UnStake,
  Claim,
  PoolStakesQueryResponse,
} from './types';
import request from 'graphql-request';
import {
  getRoundsWithApplications,
  getRoundMatchingDistributions,
  getRounds,
  getPoolStakes,
  getPoolStakesAndClaimsByStaker,
} from './queries';
import type { Logger } from 'winston';
import { IsNullError, NotFoundError } from '@/errors';
import { env } from '@/env';
import { claimableRounds } from '@/utils/getMerkleAirdrop';
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
    const response = await this.getRoundsWithApplications({
      chainId,
      roundIds: [roundId],
    });

    if (response === null) {
      throw new NotFoundError(
        `No round found for roundId: ${roundId} on chainId: ${chainId}`
      );
    }

    return response[0];
  }

  async getRoundsWithApplications({
    chainId,
    roundIds,
  }: {
    chainId: number;
    roundIds: string[];
  }): Promise<RoundWithApplications[] | null> {
    this.logger.debug(
      `Requesting round with applications for roundIds: ${roundIds.join(', ')}, chainId: ${chainId}`
    );

    const requestVariables = {
      chainId,
      roundIds,
    };

    try {
      const response: RoundApplicationsQueryResponse = await request(
        this.indexerEndpoint,
        getRoundsWithApplications,
        requestVariables
      );

      if (response.rounds.length === 0) {
        this.logger.warn(
          `No round found for roundIds: ${roundIds.toString()} on chainId: ${chainId}`
        );
        return null;
      }

      const rounds = response.rounds;

      this.logger.info(
        `Successfully fetched rounds with IDs: ${rounds.map(round => round.id).join(', ')}, which includes ${rounds.map(round => round.applications.length).join(', ')} applications`
      );
      return rounds;
    } catch (error) {
      this.logger.error(
        `Failed to fetch round with applications: ${error.message}`,
        { error }
      );
      throw error;
    }
  }

  async getRoundsWithApplicationsCountAndStakedAmount({
    chainId,
    roundIds,
  }: {
    chainId: number;
    roundIds: string[];
  }): Promise<PoolOverview[]> {
    const requestVariables = { chainId, roundIds };
    try {
      const response: RoundApplicationsQueryResponse = await request(
        this.indexerEndpoint,
        getRoundsWithApplications,
        requestVariables
      );

      const rounds = response.rounds;

      const poolOverview: PoolOverview[] = [];

      for (const round of rounds) {
        const stakes = await this.getPoolStakes({
          chainId,
          poolId: Number(round.id),
        });

        const totalStaked = stakes.reduce(
          (acc, stake) => acc + Number(stake.amount),
          0
        );

        poolOverview.push({
          chainId,
          id: round.id,
          roundMetadata: round.roundMetadata,
          roundMetadataCid: round.roundMetadataCid,
          donationsStartTime: round.donationsStartTime,
          donationsEndTime: round.donationsEndTime,
          matchTokenAddress: round.matchTokenAddress,
          totalStaked,
          approvedProjectCount: round.applications.length,
          applications: round.applications,
          isClaimable: claimableRounds.some(
            claimableRound =>
              claimableRound.roundId == round.id &&
              Number(claimableRound.chainId) == chainId
          ),
        });
      }

      return poolOverview;
    } catch (error) {
      this.logger.error(
        `Failed to fetch round with applications count: ${error.message}`,
        { error }
      );
      throw error;
    }
  }

  async getRoundMatchingDistributions({
    chainId,
    roundId,
  }: {
    chainId: number;
    roundId: string;
  }): Promise<RoundMatchingDistributions> {
    const requestVariables = { chainId, roundId };

    try {
      const response: RoundMatchingDistributionsQueryResponse = await request(
        this.indexerEndpoint,
        getRoundMatchingDistributions,
        requestVariables
      );

      if (response.rounds.length === 0) {
        this.logger.warn(
          `No round found for roundId: ${roundId} on chainId: ${chainId}`
        );
        throw new NotFoundError(
          `No round found for roundId: ${roundId} on chainId: ${chainId}`
        );
      }
      return response.rounds[0];
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
      this.logger.error(`Failed to fetch pool stakes: ${error.message}`, {
        error,
      });
      throw error;
    }
  }

  async getPoolStakesAndClaimsByStaker({
    staker,
  }: {
    staker: string;
  }): Promise<{ staked: Stake[]; unstaked: UnStake[]; claims: Claim[] }> {
    const requestVariables = { staker };
    try {
      const response: PoolStakesAndClaimsQueryResponse = await request(
        this.stakingIndexerEndpoint,
        getPoolStakesAndClaimsByStaker,
        requestVariables
      );

      return {
        staked: response.TokenLock_Locked,
        unstaked: response.TokenLock_Claimed,
        claims: response.MerkleAirdrop_Claim,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch pool stakes: ${error.message}`, {
        error,
      });
      throw error;
    }
  }
}

export const indexerClient = IndexerClient.getInstance();

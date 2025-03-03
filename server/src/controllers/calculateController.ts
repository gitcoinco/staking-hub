import type { Request, Response } from 'express';
import { IsNullError, NotFoundError, ServerError } from '@/errors';
import { createLogger } from '@/logger';
import { catchError, validateRequest } from '@/utils/utils';
import { Pool } from '@/entity/Pool';

import type { Project } from '@/types';
import { calculateRewards, generateMerkleData } from '@/utils/calculations';
import poolService from '@/service/PoolService';
import { indexerClient } from '@/ext/indexer';

const logger = createLogger();

interface CalculateRequestBody {
  chainId: number;
  alloPoolId: string;
  totalRewardPool: bigint;
  totalMatchAmount: bigint;
  totalDuration: bigint;
}

export const calculate = async (
  req: Request<Record<string, never>, unknown, CalculateRequestBody>,
  res: Response
): Promise<void> => {
  try {
    validateRequest(req, res);

    const {
      chainId,
      alloPoolId,
      totalRewardPool,
      totalMatchAmount,
      totalDuration,
    } = req.body;

    const [errorFetchingMatchingDistribution, matchingDistribution] =
      await catchError(fetchMatchingDistribution(chainId, alloPoolId));

    if (errorFetchingMatchingDistribution !== undefined) {
      logger.error(
        'Error fetching matching distribution:',
        errorFetchingMatchingDistribution
      );
      res
        .status(404)
        .json({
          error: `Matching distribution for pool ${alloPoolId} not found`,
        });
      throw new ServerError(
        `Matching distribution: ${errorFetchingMatchingDistribution?.message} `
      );
    }

    if (matchingDistribution === null || matchingDistribution === undefined) {
      throw new NotFoundError(
        `Matching distribution for pool ${alloPoolId} not found`
      );
    }

    const [errorFetchingStakes, stakes] = await catchError(
      indexerClient.getPoolStakes({
        chainId,
        poolId: Number(alloPoolId),
      })
    );

    if (errorFetchingStakes !== undefined) {
      logger.error('Error fetching stakes:', errorFetchingStakes);
      res.status(500).json({ error: 'Internal server error' });
      throw new ServerError(`Error fetching stakes for pool ${alloPoolId}`);
    }

    if (stakes === undefined || stakes.length === 0) {
      logger.error('No stakes found for pool:', alloPoolId);
      res.status(404).json({ error: 'No stakes found for pool' });
      throw new NotFoundError(`No stakes found for pool ${alloPoolId}`);
    }

    // Validate required parameters
    if (
      chainId === undefined ||
      alloPoolId === undefined ||
      !Array.isArray(matchingDistribution) ||
      !Array.isArray(stakes) ||
      typeof totalRewardPool !== 'string' ||
      typeof totalMatchAmount !== 'string' ||
      typeof totalDuration !== 'string'
    ) {
      throw new IsNullError('Missing required parameters');
    }

    const calculatedRewards = calculateRewards(
      BigInt(totalRewardPool),
      BigInt(totalMatchAmount),
      BigInt(totalDuration),
      matchingDistribution,
      stakes
    );

    console.log('==> 1 calculatedRewards: ', calculatedRewards);

    const { merkleRoot, rewards } = generateMerkleData(calculatedRewards);
    // Save to database using catchError
    const pool = new Pool();
    pool.chainId = chainId;
    pool.alloPoolId = alloPoolId;
    pool.rewards = rewards;
    pool.merkleRoot = merkleRoot;

    console.log(JSON.stringify(pool, null, 2));

    const [error] = await catchError(poolService.savePool(pool));

    if (error !== null) {
      logger.error('Error saving rewards to database:', error);
    }

    res.status(200).json({ success: true, rewards });
  } catch (error) {
    logger.error('Error in calculate controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchMatchingDistribution = async (
  chainId: number,
  alloPoolId: string
): Promise<Project[]> => {
  try {
    const [errorFetchingMatchingDistribution, pool] = await catchError(
      indexerClient.getRoundMatchingDistributions({
        chainId,
        roundId: alloPoolId,
      })
    );

    if (errorFetchingMatchingDistribution !== undefined) {
      logger.error(
        'Error fetching matching distribution:',
        errorFetchingMatchingDistribution
      );
      throw new ServerError(
        `Error fetching matching distribution for pool ${alloPoolId}`
      );
    }

    if (
      pool?.matchingDistribution?.matchingDistribution === undefined ||
      pool?.matchingDistribution?.matchingDistribution === null
    ) {
      throw new NotFoundError(
        `Matching distribution for pool ${alloPoolId} not found`
      );
    }

    const projects = pool.matchingDistribution.matchingDistribution.map(
      distribution => ({
        id: distribution.projectId,
        matchAmount: BigInt(distribution.matchAmountInToken),
      })
    );

    return projects;
  } catch (error) {
    logger.error('Error in fetchMatchingDistribution:', error);
    throw error;
  }
};

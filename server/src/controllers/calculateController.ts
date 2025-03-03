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
  validateRequest(req, res);

  const {
    chainId,
    alloPoolId,
    totalRewardPool,
    totalMatchAmount,
    totalDuration,
  } = req.body;

  const [errorFetchingProjects, projects] = await catchError(
    fetchProjects(chainId, alloPoolId)
  );

  if (errorFetchingProjects !== null) {
    logger.error('Error fetching projects:', errorFetchingProjects);
  }

  const [errorFetchingStakes, stakes] = await catchError(indexerClient.getPoolStakes({
    chainId,
    poolId: Number(alloPoolId),
  }));

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
    !Array.isArray(projects) ||
    !Array.isArray(stakes) ||
    typeof totalRewardPool !== 'bigint' ||
    typeof totalMatchAmount !== 'bigint' ||
    typeof totalDuration !== 'bigint'
  ) {
    throw new IsNullError('Missing required parameters');
  }

  const calculatedRewards = calculateRewards(
    totalRewardPool,
    totalMatchAmount,
    totalDuration,
    projects,
    stakes
  );

  const { merkleRoot, rewards } = generateMerkleData(calculatedRewards);

  // Save to database using catchError
  const pool = new Pool();
  pool.chainId = chainId;
  pool.alloPoolId = alloPoolId;
  pool.rewards = rewards;
  pool.merkleRoot = merkleRoot;

  const [error] = await catchError(poolService.savePool(pool));

  if (error !== null) {
    logger.error('Error saving rewards to database:', error);
  }

  res.status(200).json({ success: true, rewards });
};

const fetchProjects = async (
  chainId: number,
  alloPoolId: string
): Promise<Project[]> => {

  const pool = await indexerClient.getRoundMatchingDistributions({
    chainId,
    roundId: alloPoolId,
  });

  const projects = pool.matchingDistribution.matchingDistribution.map((distribution) => ({
    id: distribution.projectId,
    matchAmount: BigInt(distribution.matchAmountInToken),
  }));

  return projects;
};
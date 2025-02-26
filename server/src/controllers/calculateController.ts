import type { Request, Response } from 'express';
import { IsNullError } from '@/errors';
import { createLogger } from '@/logger';
import { catchError, validateRequest } from '@/utils/utils';
import { Pool } from '@/entity/Pool';
import { poolRepository } from '@/repository';

import type { Project, Stake } from '@/types';
import { calculateRewards, generateMerkleData } from '@/utils/calc';

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

  const [errorFetchingStakes, stakes] = await catchError(
    fetchStakes(chainId, alloPoolId)
  );

  if (errorFetchingStakes !== null) {
    logger.error('Error fetching stakes:', errorFetchingStakes);
  }

  // Validate required parameters
  if (
    chainId === undefined ||
    alloPoolId === undefined ||
    !Array.isArray(projects) ||
    !Array.isArray(stakes) ||
    typeof totalRewardPool !== 'number' ||
    typeof totalMatchAmount !== 'number' ||
    typeof totalDuration !== 'number'
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

  const [error] = await catchError(poolRepository.save(pool));

  if (error !== null) {
    logger.error('Error saving rewards to database:', error);
  }

  res.status(200).json({ success: true, rewards });
};

const fetchProjects = async (
  chainId: number,
  alloPoolId: string
): Promise<Project[]> => {
  // TODO: Implement actual fetching logic
  return [];
};

const fetchStakes = async (
  chainId: number,
  alloPoolId: string
): Promise<Stake[]> => {
  // TODO: Implement actual fetching logic
  return [];
};

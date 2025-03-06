import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, recoverSignerAddress, validateRequest } from '@/utils/utils';
import { createLogger } from '@/logger';
import { type PoolIdChainId, type Signature } from './types';
import { ServerError, UnauthorizedError } from '@/errors';
import { env } from '@/env';
import { getAddress, type Hex } from 'viem';
import { indexerClient } from '@/ext/indexer/indexer';
import { PoolOverview, StakerOverview } from '@/ext/indexer/types';

const logger = createLogger();

interface RewardsForStakerBody extends PoolIdChainId, Signature { }

/**
 * Check if the caller is the staker
 * @param obj - The object to check
 * @param signature - The signature of the caller
 * @param staker - The staker address
 * @returns True if the caller is the staker, false otherwise
 */
const isCallerTheStaker = async <T>(
  obj: T,
  signature: Hex,
  staker: string
): Promise<boolean> => {
  if (env.NODE_ENV === 'development' && signature === '0xdeadbeef') {
    logger.info('Skipping signature check in development mode');
  } else {
    const address = await recoverSignerAddress(obj, signature);
    if (address.toLowerCase() !== staker.toLowerCase()) {
      throw new UnauthorizedError('Unauthorized');
    }
  }

  return true;
};


/**
 * Get rewards for a given stakerId and signature
 * Optional chainId and alloPoolId to filter rewards for a specific pool
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const getRewardsForStaker = async (req: Request, res: Response): Promise<void> => {

  validateRequest(req, res);

  const { staker } = req.params;
  
  const { chainId, alloPoolId, signature } = req.body as RewardsForStakerBody;

  const [errorStaker, isStaker] = await catchError(
    isCallerTheStaker({staker: staker}, signature, staker)
  );

  if (errorStaker !== undefined || isStaker === false) {
    logger.error('Unauthorized');
    res.status(401).json({ error: 'Unauthorized' });
    throw new UnauthorizedError('Unauthorized');
  }

  const [error, rewards] = await catchError(poolService.getRewardsForStaker(staker.toLowerCase(), chainId, alloPoolId));

  if (error !== undefined || rewards === undefined) {
    logger.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
    throw new ServerError(`Error fetching rewards for staker ${staker}`);
  }

  res.status(200).json(rewards);
};

export const getStakerOverview = async (req: Request, res: Response): Promise<void> => {
  validateRequest(req, res);

  const { staker } = req.params;

  // get staked amount from contract
  const [error, stakedClaimedData] = await catchError(indexerClient.getPoolStakesAndClaimsByStaker({staker: getAddress(staker)}));

  if (error !== undefined || stakedClaimedData === undefined) {
    logger.error('Error fetching staked amount:', error);
    res.status(500).json({ error: 'Internal server error' });
    throw new ServerError(`Error fetching staked amount for staker ${staker}`);
  }

  const totalStaked = stakedClaimedData.staked.reduce((acc, stake) => acc + Number(stake.amount), 0);
  const unstakedAmount = stakedClaimedData.unstaked.reduce((acc, unstake) => acc + Number(unstake.amount), 0);
  const currentlyStaked = totalStaked - unstakedAmount;

  // Group pools by chainId to efficiently fetch metadata from grants-stack indexer
  const poolsByChainId = stakedClaimedData.staked.reduce<Record<number, string[]>>((acc, stake) => {
    const poolId = stake.poolId;
    const chainId = stake.chainId;
    if (!(chainId in acc)) {
      acc[chainId] = [];
    }
    acc[chainId].push(poolId);
    return acc;
  }, {});

  const poolsOverview: PoolOverview[] = [];

  // Fetch Pool Overview from indexer
  for (const chainId in poolsByChainId) {
    const [errorFetching, indexerPoolData] = await catchError(
      indexerClient.getRoundsWithApplicationsCountAndStakedAmount({
        chainId: Number(chainId),
        roundIds: poolsByChainId[chainId].map((poolId) => poolId),
      })
    );

    if (errorFetching !== undefined || indexerPoolData === undefined || indexerPoolData === null || indexerPoolData.length === 0) {
      logger.error('Error fetching indexer pool data:', errorFetching);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    poolsOverview.push(...indexerPoolData);
  }

  const [rewardsError, rewards] = await catchError(poolService.getRewardsForStaker(staker.toLowerCase())); 

  if (rewardsError !== undefined || rewards === undefined) {
    logger.error('Error fetching rewards:', rewardsError);
    res.status(500).json({ error: 'Internal server error' });
    throw new ServerError(`Error fetching rewards for staker ${staker}`);
  }

  const stakerOverview: StakerOverview = {
    currentlyStaked,
    stakes: stakedClaimedData.staked,
    rewards: rewards.map((reward) => ({
      staker: reward.staker,
      amount: reward.amount,
    })),
    claims: stakedClaimedData.claims,
    poolsOverview,
  };

  logger.info('Staker overview fetched successfully:', staker);
  res.status(200).json(stakerOverview);
}
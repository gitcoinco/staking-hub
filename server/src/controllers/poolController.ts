import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils/utils';
import { createLogger } from '@/logger';

import { IsNullError, NotFoundError, ServerError } from '@/errors';
import { type PoolIdChainId } from './types';
import { indexerClient, type Round, type Stake } from '@/ext/indexer';
import { type Pool } from '@/entity/Pool';

const logger = createLogger();

type RoundWithStakes = Round & {
  stakes: Stake[];
}

/**
 * Creates a new pool by fetching data from the indexer
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const createPool = async (req: Request, res: Response): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  // Extract chainId and alloPoolId from the request body
  const { chainId, alloPoolId } = req.body as PoolIdChainId;

  // Log the receipt of the update request
  logger.info(
    `Received update request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  // Fetch pool data from the indexer
  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId,
      roundId: alloPoolId,
    })
  );

  // Handle errors or missing data from the indexer
  if (errorFetching !== undefined || indexerPoolData == null) {
    logger.warn(
      `No pool found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
    );
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError(`Pool not found on indexer`);
  }

  // Handle errors during the create operation
  const [error] = await catchError(poolService.createNewPool(
    chainId,
    alloPoolId,
  ));

  if (error !== undefined) {
    logger.error(`Failed to create pool: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error creating pool', error: error?.message });
    throw new IsNullError(`Error creating pool`);
  }

  // Log success and respond to the request
  logger.info(
    `successfully created pool, alloPoolId: ${alloPoolId} chainId: ${chainId}`
  );
  res.status(200).json({ message: 'pool created successfully' });
};

/**
 * Get pool rewards for a given chainId and alloPoolId
 * Optional recipientId to filter rewards for a specific recipient
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const getPoolRewards = async (req: Request, res: Response): Promise<void> => {

  validateRequest(req, res);

  const { chainId, alloPoolId } = req.params as unknown as { chainId: number; alloPoolId: string };
  const { recipient } = req.query;

  const [error, rewards] = await catchError(
    poolService.getPoolRewards(chainId, alloPoolId, recipient as string)
  );

  if (error !== null || rewards === null) {
    logger.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
    throw new ServerError(`Error fetching rewards for pool ${chainId} ${alloPoolId}`);
  }

  res.status(200).json(rewards);
};

/**
 * Get pool stakes for a given chainId and alloPoolId
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const getPoolStakes = async (req: Request, res: Response): Promise<void> => {
  validateRequest(req, res);

  const { chainId, alloPoolId } = req.query as unknown as PoolIdChainId;

  let pools: Pool[];
  
  // Fetch pools from db
  if (chainId === undefined && alloPoolId === undefined) {
    const [errorFetchingPools, _pools] = await catchError(poolService.getAllPools());
    if (errorFetchingPools !== undefined || _pools === undefined) {
      logger.error('Error fetching all pools:', errorFetchingPools);
      res.status(500).json({ error: 'Internal server error' });
      throw new ServerError(`Error fetching pools`);
    }
    pools = _pools;
  } else {
    const [errorFetchingPools, _pool] = await catchError(poolService.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId));
    if (errorFetchingPools !== undefined || _pool === undefined || _pool === null) {  
      logger.error('Error fetching pool:', errorFetchingPools);
      res.status(500).json({ error: 'Internal server error' });
      throw new ServerError(`Error fetching pool ${chainId} ${alloPoolId}`);
    }
    pools = [_pool];
  }

  // group pools by chainId
  const poolsByChainId = pools.reduce<Record<number, Pool[]>>((acc, pool) => {
    acc[pool.chainId].push(pool);
    return acc;
  }, {});
  
  const _pools: RoundWithStakes[] = [];

  // Fetch metadata from grants-stack indexer for those pools
  for (const chainId in poolsByChainId) {
    const [errorFetching, indexerPoolData] = await catchError(
      indexerClient.getRounds({
        chainId: parseInt(chainId),
        roundIds: poolsByChainId[chainId].map((pool) => pool.alloPoolId),
      })
    );
    
    if (errorFetching !== undefined || indexerPoolData === undefined) {
      logger.error('Error fetching indexer pool data:', errorFetching);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    
    _pools.push(...indexerPoolData.map((pool) => ({
      ...pool,
      stakes: [],
    })));
  }
  
  // fetch stakes from staking-hub indexer for those pools
  for (const pool of _pools) {
    const [errorFetchingStakes, stakes] = await catchError(indexerClient.getPoolStakes({
      chainId: pool.chainId,
      poolId: Number(pool.id),
    }));

    if (errorFetchingStakes !== undefined || stakes === undefined) {
      logger.error('Error fetching stakes:', errorFetchingStakes);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    pool.stakes = stakes;
  }

  logger.info(`Fetched ${_pools.length} pool data from indexer`);
  res.status(200).json(_pools);  
}

import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, validateRequest } from '@/utils/utils';
import { createLogger } from '@/logger';

import { IsNullError, NotFoundError, ServerError } from '@/errors';
import { type PoolIdChainId } from './types';
import { indexerClient, PoolOverview, RoundWithStakes } from '@/ext/indexer';
import { type Pool } from '@/entity/Pool';
import { adminAuthMiddleware } from '@/controllers/adminAuthMiddleware';

const logger = createLogger();

/**
 * Creates a new pool by fetching data from the indexer
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const createPool = async (req: Request, res: Response): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);
  
  adminAuthMiddleware(req, res);

  // Extract chainId and alloPoolId from the request body
  const { chainId, alloPoolId } = req.body as PoolIdChainId;

  // Log the receipt of the update request
  logger.info(
    `Received update request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  // Fetch pool data from the indexer
  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundsWithApplications({
      chainId,
      roundIds: [alloPoolId],
    })
  );

  // Handle errors or missing data from the indexer
  if (errorFetching !== undefined || indexerPoolData === null || indexerPoolData === undefined || indexerPoolData.length === 0) {
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
 * Get pool summaries for a given chainId and alloPoolId
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const getPoolSummary = async (req: Request, res: Response): Promise<void> => {
  validateRequest(req, res);

  const { chainId, alloPoolId } = req.params;

  const [errorFetchingPools, pool] = await catchError(poolService.getPoolByChainIdAndAlloPoolId(Number(chainId), alloPoolId));
  if (errorFetchingPools !== undefined || pool === undefined || pool === null) {  
    logger.error('Error fetching pool:', errorFetchingPools);
    res.status(500).json({ error: 'Internal server error' });
    throw new ServerError(`Error fetching pool ${chainId} ${alloPoolId}`);
  }

  // Fetch metadata from grants-stack indexer for those pools
  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId: Number(chainId),
      roundId: alloPoolId,
    })
  );
  
  if (errorFetching !== undefined || indexerPoolData === undefined || indexerPoolData === null) {
    logger.error('Error fetching indexer pool data:', errorFetching);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
    
  // fetch stakes from staking-hub indexer for those pools
  const [errorFetchingStakes, stakes] = await catchError(indexerClient.getPoolStakes({
    chainId: Number(chainId),
    poolId: Number(alloPoolId),
  }));

  if (errorFetchingStakes !== undefined || stakes === undefined) {
    logger.error('Error fetching stakes:', errorFetchingStakes);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  let totalStakesByAnchorAddress: RoundWithStakes = {
    ...indexerPoolData,
    stakes,
    totalStakesByAnchorAddress: stakes.reduce<Record<string, string>>((acc, stake) => {
      if (!(stake.recipient in acc)) {
        acc[stake.recipient] = '0';
      }
      acc[stake.recipient] = (BigInt(acc[stake.recipient]) + BigInt(stake.amount)).toString();
      return acc;
    }, {}),
  };

  logger.info(`Fetched ${chainId} ${alloPoolId} pool data from indexer`);
  res.status(200).json(totalStakesByAnchorAddress);  
}

/**
 * Get all pools overview with total stakes per pool
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const getAllPoolsOverview = async (req: Request, res: Response): Promise<void> => {
  validateRequest(req, res);

  const [error, pools] = await catchError(poolService.getAllPools());
  if (error !== undefined || pools === undefined) {
    logger.error('Error fetching pools:', error);
    res.status(500).json({ error: 'Internal server error' });
    throw new ServerError(`Error fetching pools`);
  }

  const poolsOverview: PoolOverview[] = [];

  // Group pools by chainId to efficiently fetch metadata from grants-stack indexer
  const poolsByChainId = pools.reduce<Record<number, Pool[]>>((acc, pool) => {
    if (!(pool.chainId in acc)) {
      acc[pool.chainId] = [];
    }
    acc[pool.chainId].push(pool);
    return acc;
  }, {});

  for (const chainId in poolsByChainId) {
    const [errorFetching, indexerPoolData] = await catchError(
      indexerClient.getRoundsWithApplicationsCountAndStakedAmount({
        chainId: Number(chainId),
        roundIds: poolsByChainId[chainId].map((pool) => pool.alloPoolId),
      })
    );

    if (errorFetching !== undefined || indexerPoolData === undefined || indexerPoolData === null || indexerPoolData.length === 0) {
      logger.error('Error fetching indexer pool data:', errorFetching);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    poolsOverview.push(...indexerPoolData);
  }

  logger.info(`Fetched ${poolsOverview.length} pools overview`);
  res.status(200).json(poolsOverview);
}
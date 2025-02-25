import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import applicationService from '@/service/ApplicationService';
import { catchError, validateRequest } from '@/utils';
import { createLogger } from '@/logger';
import {
  indexerClient,
  type RoundWithApplications as IndexerRoundWithApplications,
  type RoundMetadata as IndexerRoundMetadata,
} from '@/ext/indexer';

import { type Pool } from '@/entity/Pool';
import { IsNullError, NotFoundError } from '@/errors';

const logger = createLogger();

interface PoolIdChainId {
  alloPoolId: string;
  chainId: number;
}

/**
 * Synchronizes a pool by fetching data from the indexer, updating the pool and it's applications
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const syncPool = async (req: Request, res: Response): Promise<void> => {
  // Validate the incoming request
  validateRequest(req, res);

  // Extract chainId and alloPoolId from the request body
  const { chainId, alloPoolId } = req.body as PoolIdChainId;

  // Log the receipt of the update request
  logger.info(
    `Received update request for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
  );

  // ---- Fetch pool data from the indexer ----
  const [errorFetching, indexerPoolData] = await catchError(
    indexerClient.getRoundWithApplications({
      chainId,
      roundId: alloPoolId,
    })
  );

  // Handle errors or missing data from the indexer
  if (errorFetching != null || indexerPoolData == null) {
    logger.warn(
      `No pool found for chainId: ${chainId}, alloPoolId: ${alloPoolId}`
    );
    res.status(404).json({ message: 'Pool not found on indexer' });
    throw new NotFoundError(`Pool not found on indexer`);
  }

  // ---- Get or create the pool ----
  // Upsert the pool with the fetched data
  const [error, pool] = await catchError(
    poolService.upsertPool(chainId, alloPoolId)
  );

  // Handle errors during the upsert operation
  if (error != null || pool == null) {
    logger.error(`Failed to upsert pool: ${error?.message}`);
    res
      .status(500)
      .json({ message: 'Error upserting pool', error: error?.message });
    throw new IsNullError(`Error upserting pool`);
  }

  // ---- Update Applications ----
  // Update the pool with the applications from the indexer
  await updateApplications(chainId, alloPoolId, indexerPoolData);

  // Log success and respond to the request
  logger.info('successfully synced pool', pool);
  res.status(200).json({ message: 'pool synced successfully' });
};


const updateApplications = async (
  chainId: number,
  alloPoolId: string,
  indexerPoolData: IndexerRoundWithApplications
): Promise<void> => {
  const applicationData = indexerPoolData.applications.map(application => ({
    alloApplicationId: application.id,
    profileId: application.projectId,
  }));

  await applicationService.upsertApplicationsForPool(
    alloPoolId,
    chainId,
    applicationData
  );
};
import type { Request, Response } from 'express';
import { IsNullError, NotFoundError, ServerError } from '@/errors';
import { createLogger } from '@/logger';
import { catchError, validateRequest } from '@/utils/utils';

import { calculateRewards, generateMerkleData } from '@/utils/calculations';
import poolService from '@/service/PoolService';
import { indexerClient } from '@/ext/indexer';

const logger = createLogger();

interface CalculateRequestBody {
  chainId: number;
  alloPoolId: string;
  totalRewardPool: bigint;
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
    } = req.body;

    const [errorFetchingMatchingDistribution, roundCalculationInfo] =
      await catchError(indexerClient.getRoundMatchingDistributions({
        chainId,
        roundId: alloPoolId,
      }));

    if (errorFetchingMatchingDistribution !== undefined || roundCalculationInfo === undefined) {
      logger.error('Error fetching matching distribution:', errorFetchingMatchingDistribution);
      res.status(500).json({ error: 'Internal server error' });
      throw new ServerError(`Error fetching matching distribution: ${errorFetchingMatchingDistribution?.message} `);
    }

    const [errorFetchingRoundWithApplications, roundWithApplications] =
      await catchError(indexerClient.getRoundsWithApplications({
        chainId,
        roundIds: [alloPoolId],
      }));

    if (errorFetchingRoundWithApplications !== undefined || roundWithApplications === undefined || roundWithApplications === null) {
      logger.error('Error fetching round with applications:', errorFetchingRoundWithApplications);
      res.status(500).json({ error: 'Internal server error' });
      throw new ServerError(`Error fetching round with applications: ${errorFetchingRoundWithApplications?.message} `);
    }
      
      

    const totalMatchAmount = roundCalculationInfo.matchAmount;
    const matchingDistribution = roundCalculationInfo.matchingDistribution.matchingDistribution;
    // todo: change the date string to the actual end time: matchingDistribution.donationsEndTime
    const totalDuration = BigInt(new Date("Mar-05-2025 08:39:24 AM UTC").getTime() / 1000);
    
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
      typeof totalRewardPool !== 'string'
    ) {
      throw new IsNullError('Missing required parameters');
    }

    const matchingDistributionWithAnchorAddress = matchingDistribution.map((distribution) => ({
      ...distribution,
      anchorAddress: roundWithApplications[0].applications.find((application) => application.projectId.toLowerCase() === distribution.projectId.toLowerCase())?.anchorAddress ?? '',
    }));

    const calculatedRewards = calculateRewards(
      BigInt(totalRewardPool),
      BigInt(totalMatchAmount),
      BigInt(totalDuration),
      matchingDistributionWithAnchorAddress,
      stakes
    );

    console.log('==> 1 calculatedRewards: ', calculatedRewards);

    const { merkleRoot, rewards } = generateMerkleData(calculatedRewards);
    // Save to database using catchError
    const pool = await poolService.getPoolByChainIdAndAlloPoolId(chainId, alloPoolId);
    if (pool === null) {
      throw new NotFoundError(`Pool ${alloPoolId} not found`);
    }

    pool.rewards = rewards;
    pool.merkleRoot = merkleRoot;

    console.log(JSON.stringify(pool, null, 2));

    const [error] = await catchError(poolService.savePool(pool));

    if (error !== undefined ) {
      logger.error('Error saving rewards to database:', error);
      console.log(JSON.stringify(error, null, 2));
    }

    res.status(200).json({ success: true, rewards });
  } catch (error) {
    logger.error('Error in calculate controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
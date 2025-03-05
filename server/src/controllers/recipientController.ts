import type { Request, Response } from 'express';
import poolService from '@/service/PoolService';
import { catchError, recoverSignerAddress, validateRequest } from '@/utils/utils';
import { createLogger } from '@/logger';
import { type PoolIdChainId, type Signature } from './types';
import { ServerError, UnauthorizedError } from '@/errors';
import { env } from '@/env';
import { type Hex } from 'viem';
import { indexerClient } from '@/ext/indexer/indexer';

const logger = createLogger();

interface RewardsForRecipientBody extends PoolIdChainId, Signature { }

/**
 * Check if the caller is the recipient
 * @param obj - The object to check
 * @param signature - The signature of the caller
 * @param recipient - The recipient address
 * @returns True if the caller is the recipient, false otherwise
 */
const isCallerTheRecipient = async <T>(
  obj: T,
  signature: Hex,
  recipient: string
): Promise<boolean> => {
  if (env.NODE_ENV === 'development' && signature === '0xdeadbeef') {
    logger.info('Skipping signature check in development mode');
  } else {
    const address = await recoverSignerAddress(obj, signature);
    if (address.toLowerCase() !== recipient.toLowerCase()) {
      throw new UnauthorizedError('Unauthorized');
    }
  }

  return true;
};


/**
 * Get rewards for a given recipientId and signature
 * Optional chainId and alloPoolId to filter rewards for a specific pool
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const getRewardsForRecipient = async (req: Request, res: Response): Promise<void> => {

  validateRequest(req, res);

  const { recipientId } = req.params;
  
  const { chainId, alloPoolId, signature } = req.body as RewardsForRecipientBody;

  const [errorRecipient, isRecipient] = await catchError(
    isCallerTheRecipient({recipient: recipientId}, signature, recipientId)
  );

  if (errorRecipient !== null || isRecipient === false) {
    logger.error('Unauthorized');
    res.status(401).json({ error: 'Unauthorized' });
    throw new UnauthorizedError('Unauthorized');
  }

  const [error, rewards] = await catchError(poolService.getRewardsForRecipient(recipientId, chainId, alloPoolId));

  if (error !== null || rewards === null) {
    logger.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Internal server error' });
    throw new ServerError(`Error fetching rewards for recipient ${recipientId}`);
  }

  res.status(200).json(rewards);
};
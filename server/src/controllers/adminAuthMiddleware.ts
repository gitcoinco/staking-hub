import { env } from '@/env';
import { UnauthorizedError } from '@/errors';
import { type Request, type Response } from 'express';

export const adminAuthMiddleware = (req: Request, res: Response): void => {
  const adminApiKey = req.headers['x-admin-api-key'];

  if (adminApiKey !== env.ADMIN_API_KEY) {
    res.status(401).json({ message: 'Unauthorized' });
    throw new UnauthorizedError('Unauthorized');
  }
};

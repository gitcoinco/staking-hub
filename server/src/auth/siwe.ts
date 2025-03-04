import { Router, type Request, type Response, type RequestHandler } from 'express';
import Session from 'express-session';
import { generateNonce, SiweMessage, SiweErrorType } from 'siwe';
import rateLimit from 'express-rate-limit';

declare module 'express-session' {
  interface SessionData {
    nonce: string;
    siwe: SiweMessage;
  }
}

export interface AddressLocation {
    param?: string;
    body?: string;
}

const router = Router();

export const configureSiweAuth = (): void => {
  // Configure rate limiters
  const nonceRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Too many nonce requests, please try again later' }
  });

  const verifyRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 verification attempts per windowMs
    message: { message: 'Too many verification attempts, please try again later' }
  });

  router.use(
    Session({
      name: 'siwe-session',
      secret: process.env.SESSION_SECRET ?? 'your-secret-key',
      resave: true,
      saveUninitialized: true,
      cookie: { 
        secure: process.env.NODE_ENV !== 'development', 
        sameSite: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );

  /**
   * @swagger
   * /auth/nonce:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Generate a nonce for SIWE authentication
   *     description: Generates and returns a new nonce for Sign-In with Ethereum
   *     responses:
   *       200:
   *         description: Nonce generated successfully
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *       429:
   *         description: Too many requests
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  router.get('/nonce', nonceRateLimiter as RequestHandler, async (req: Request, res: Response) => {
    req.session.nonce = generateNonce();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(req.session.nonce);
  });

  /**
   * @swagger
   * /auth/verify:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Verify SIWE message and signature
   *     description: Verifies the Sign-In with Ethereum message and signature
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - message
   *               - signature
   *             properties:
   *               message:
   *                 type: string
   *                 description: The SIWE message
   *               signature:
   *                 type: string
   *                 description: The ethereum signature
   *     responses:
   *       200:
   *         description: Verification successful
   *         content:
   *           application/json:
   *             schema:
   *               type: boolean
   *       422:
   *         description: Invalid input or signature
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       440:
   *         description: Message expired
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */
  router.post('/verify', verifyRateLimiter as RequestHandler, async (req: Request, res: Response) => {
    try {
      if (req.body.message === undefined || req.body.message === null) {
        res.status(422).json({ message: 'Expected prepareMessage object as body.' });
        return;
      }

      if (req.body.signature === undefined || req.body.signature === null) {
        res.status(422).json({ message: 'Expected signature string.' });
        return;
      }

      const siweMessage = new SiweMessage(req.body.message as string);
      const { data: message } = await siweMessage.verify({ 
        signature: req.body.signature,
        nonce: req.session.nonce
      });

      req.session.siwe = message;
      if (message.expirationTime !== undefined && message.expirationTime !== '' && message.expirationTime !== null) {
        req.session.cookie.expires = new Date(message.expirationTime);
      }
      req.session.save(() => res.status(200).send(true));
    } catch (e) {
      req.session.siwe = {} as const as SiweMessage;
      req.session.nonce = generateNonce();
      console.error(e);
      
      if (e === SiweErrorType.EXPIRED_MESSAGE) {
        req.session.save(() => res.status(440).json({ message: (e as Error).message }));
      } else if (e === SiweErrorType.INVALID_SIGNATURE) {
        req.session.save(() => res.status(422).json({ message: (e as Error).message }));
      } else {
        req.session.save(() => res.status(500).json({ message: (e as Error).message }));
      }
    }
  });
};

/**
 * Middleware to check if user is authenticated
 * @param req Express request
 * @param res Express response
 * @param next Next middleware function
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: () => void
): void => {
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  if (req.session.siwe?.address === undefined || req.session.siwe.address === null) {
    res.status(401).json({ message: 'You have to first sign in' });
  } else {
    next();
  }
}; 

/**
 * Middleware to check if authenticated user matches the target address
 * @param addressLocation Location of the address to check (in params or body)
 * @returns Middleware function
 */
export const requireAuthMatchAddress = (addressLocation: AddressLocation) => {
    return (req: Request, res: Response, next: () => void): void => {
      if (process.env.NODE_ENV === 'development') {
        next();
        return;
      }

      if (req.session.siwe?.address === undefined || req.session.siwe.address === null) {
        res.status(401).json({ message: 'You have to first sign in' });
        return;
      }
  
      let targetAddress: string | undefined;
  
      if (addressLocation.param !== undefined && addressLocation.param !== null) {
        targetAddress = req.params[addressLocation.param];
      } else if (addressLocation.body !== undefined && addressLocation.body !== null) {
        targetAddress = req.body[addressLocation.body];
      }
  
      if (targetAddress === undefined || targetAddress === null) {
        res.status(400).json({ message: 'Address not found in request' });
        return;
      }
  
      const siweAddress = req.session.siwe.address.toLowerCase();
      
      if (targetAddress.toLowerCase() !== siweAddress) {
        res.status(403).json({ message: 'Unauthorized: Address mismatch' });
        return;
      }
  
      next();
    };
};

/**
 * Checks if the authenticated user matches the target address
 * @param req Express request
 * @param res Express response
 * @param address Address to check against
 * @returns boolean indicating if check passed (true) or failed and error was sent (false)
 */
export const checkAuthMatchAddress = (
  req: Request,
  res: Response,
  address: string
): boolean => {
    if(process.env.NODE_ENV === 'development') {
        return true;
    }

  if (req.session.siwe?.address === undefined || req.session.siwe.address === null) {
    res.status(401).json({ message: 'You have to first sign in' });
    return false;
  }

  const siweAddress = req.session.siwe.address.toLowerCase();
  
  if (address.toLowerCase() !== siweAddress) {
    res.status(403).json({ message: 'Unauthorized: Address mismatch' });
    return false;
  }

  return true;
};

export default router;
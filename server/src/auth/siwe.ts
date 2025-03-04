import { type Request, type Response, type Express } from 'express';
import Session from 'express-session';
import { generateNonce, SiweMessage, SiweErrorType } from 'siwe';

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

export const configureSiweAuth = (app: Express): void => {
  app.use(
    Session({
      name: 'siwe-session',
      secret: process.env.SESSION_SECRET ?? 'your-secret-key',
      resave: true,
      saveUninitialized: true,
      cookie: { secure: process.env.NODE_ENV === 'production', sameSite: true }
    })
  );

  // SIWE routes
  app.get('/auth/nonce', async (req: Request, res: Response) => {
    req.session.nonce = generateNonce();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(req.session.nonce);
  });

  app.post('/auth/verify', async (req: Request, res: Response) => {
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


# SIWE Authentication

## Install required dependencies

```bash
npm install express-session siwe @types/express-session
```

## ENV Variables

```
SESSION_SECRET=your-super-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

If you are running in development mode, you can set the `NODE_ENV` to `development` to bypass the authentication check.

## Setup CORS

```javascript
app.use(cors({
  credentials: true, // Important for SIWE authentication
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000'
}));
```

## Configure SIWE Auth

```javascript
import { configureSiweAuth } from '@/auth/siwe';

configureSiweAuth(app);
```

## Available Endpoints

### GET `/auth/nonce`

Generates a new nonce for SIWE message signing.

- Returns: Plain text nonce

### POST `/auth/verify`

Verifies the signed SIWE message.

- Body:
  
  ```typescript
  {
    message: string;    // The SIWE message
    signature: string;  // The signature of the message
  }
  ```

- Returns: 
  - 200: `true` if verification successful
  - 422: Invalid signature or message
  - 440: Expired message
  - 500: Other errors

## Protecting Routes

Use the `requireAuth` middleware to protect routes:

```typescript
import { requireAuth } from './auth/siwe';
router.get('/protected-route', requireAuth, (req, res) => {
    // Only authenticated users can access this route
    const userAddress = req.session.siwe.address;
    res.json({ address: userAddress });
});
```

Use the `requireAuthMatchAddress` middleware to protect routes:

```typescript
import { requireAuthMatchAddress } from './auth/siwe';
// For route parameters
app.get('/api/users/:address/profile', 
  requireAuthMatchAddress({ param: 'address' }), 
  (req, res) => {
    // Handler code
});

// For body parameters
app.post('/api/update-profile',
  requireAuthMatchAddress({ body: 'walletAddress' }), 
  (req, res) => {
    // Handler code
});

```

## Frontend Integration Example

```typescript
async function signInWithEthereum() {
    // 1. Get nonce
    const nonceRes = await fetch('/auth/nonce', {
        credentials: 'include'
    });
    const nonce = await nonceRes.text();
    // 2. Create and sign SIWE message
    const message = new SiweMessage({
        domain: window.location.host,
        address: account, // User's wallet address
        statement: 'Sign in with Ethereum.',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: nonce
    });
    const signature = await signer.signMessage(message.prepareMessage());
    // 3. Verify signature
    const verifyRes = await fetch('/auth/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            message,
            signature
        })
    });
    if (!verifyRes.ok) throw new Error('Error verifying signature');
    return verifyRes.ok;
}
```


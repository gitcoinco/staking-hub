# SIWE Authentication

Sign-In with Ethereum (SIWE) allows users to authenticate using their Ethereum wallet. This implementation provides a secure way to verify wallet ownership and manage user sessions.

## Installation

Install the required dependencies:

```bash
npm install express-session siwe @types/express-session express-rate-limit
```

## Configuration

### Environment Variables

```env
SESSION_SECRET=your-super-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

> **Note**: Setting `NODE_ENV=development` bypasses authentication checks during development.

### CORS Setup

Enable Cross-Origin Resource Sharing (CORS) with credentials:

```javascript
app.use(cors({
  credentials: true,  // Required for SIWE authentication
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000'
}));
```

### Initialize SIWE Auth

```javascript
import { configureSiweAuth } from '@/auth/siwe';

configureSiweAuth();
```

## API Endpoints

### GET `/auth/nonce`
Generates a cryptographic nonce for SIWE message signing.

**Response**: Plain text nonce

### POST `/auth/verify`
Verifies the signed SIWE message.

**Request Body**:
```typescript
{
  message: string;    // The SIWE message
  signature: string;  // The signature of the message
}
```

**Response Codes**:
- `200`: Verification successful (`true`)
- `422`: Invalid signature or message
- `440`: Message expired
- `500`: Server error

## Route Protection

### Basic Authentication
Protect routes using the `requireAuth` middleware:

```typescript
import { requireAuth } from './auth/siwe';

router.get('/protected-route', requireAuth, (req, res) => {
    const userAddress = req.session.siwe.address;
    res.json({ address: userAddress });
});
```

### Address-Matched Authentication
Ensure the authenticated user matches a specific address:

```typescript
import { requireAuthMatchAddress } from './auth/siwe';

// Route parameter matching
app.get('/api/users/:address/profile', 
  requireAuthMatchAddress({ param: 'address' }), 
  (req, res) => {
    // Only accessible if authenticated address matches :address
});

// Request body matching
app.post('/api/update-profile',
  requireAuthMatchAddress({ body: 'walletAddress' }), 
  (req, res) => {
    // Only accessible if authenticated address matches body.walletAddress
});
```

## Frontend Implementation

Complete authentication flow example:

```typescript
async function signInWithEthereum() {
    // 1. Request nonce from server
    const nonceRes = await fetch('/auth/nonce', {
        credentials: 'include'
    });
    const nonce = await nonceRes.text();

    // 2. Create and sign SIWE message
    const message = new SiweMessage({
        domain: window.location.host,
        address: account,           // User's wallet address
        statement: 'Sign in with Ethereum.',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce: nonce
    });
    const signature = await signer.signMessage(message.prepareMessage());

    // 3. Verify signature with server
    const verifyRes = await fetch('/auth/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ message, signature })
    });

    if (!verifyRes.ok) throw new Error('Error verifying signature');
    return verifyRes.ok;
}
```

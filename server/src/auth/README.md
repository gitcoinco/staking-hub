# SIWE Authentication

## Table of Contents
- [SIWE Authentication](#siwe-authentication)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [Environment Variables](#environment-variables)
    - [CORS Setup](#cors-setup)
    - [Initialize SIWE Auth](#initialize-siwe-auth)
  - [API Endpoints](#api-endpoints)
    - [GET `/auth/nonce`](#get-authnonce)
    - [POST `/auth/verify`](#post-authverify)
  - [Route Protection](#route-protection)
    - [Basic Authentication](#basic-authentication)
    - [Address-Matched Authentication](#address-matched-authentication)
    - [Address Matching in Route Handlers](#address-matching-in-route-handlers)
  - [Frontend Implementation](#frontend-implementation)
  - [Frontend Implementation with RainbowKit](#frontend-implementation-with-rainbowkit)
    - [Setup with RainbowKit](#setup-with-rainbowkit)
    - [Customize SIWE Message](#customize-siwe-message)
    - [Server-Side Authentication Check](#server-side-authentication-check)
  - [Basic Frontend Implementation](#basic-frontend-implementation)

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

> **Note**: Setting `NODE_ENV=development` bypasses all authentication checks during development. This includes `requireAuth`, `requireAuthMatchAddress`, and `checkAuthMatchAddress` functions.

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
- `400`: Address not found in request
- `401`: Not authenticated
- `403`: Unauthorized - Address mismatch
- `422`: Invalid signature or message
- `429`: Rate limit exceeded
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

### Address Matching in Route Handlers
For direct address matching within route handlers, use `checkAuthMatchAddress`:

```typescript
import { checkAuthMatchAddress } from './auth/siwe';

app.post('/api/users/:address/update', async (req, res) => {
    if (!checkAuthMatchAddress(req, res, req.params.address)) {
        return; // Auth check failed and error 403 was sent
    }
    
    // Continue with handler logic
    // Only executes if authenticated address matches :address
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

## Frontend Implementation with RainbowKit

If you're using RainbowKit, you can integrate SIWE authentication using the `@rainbow-me/rainbowkit-siwe-next-auth` package:

```bash
npm install @rainbow-me/rainbowkit-siwe-next-auth
```

### Setup with RainbowKit

```typescript
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { SessionProvider } from 'next-auth/react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <WagmiProvider {...config}>
      <SessionProvider refetchInterval={0} session={session}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitSiweNextAuthProvider>
            <RainbowKitProvider {...config}>
              <Component {...pageProps} />
            </RainbowKitProvider>
          </RainbowKitSiweNextAuthProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}
```

### Customize SIWE Message

You can customize the SIWE message by configuring the message options:

```typescript
import { GetSiweMessageOptions } from '@rainbow-me/rainbowkit-siwe-next-auth';

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in to my application',
  // Other SIWE message options
});

<RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
  {/* ... */}
</RainbowKitSiweNextAuthProvider>
```

### Server-Side Authentication Check

You can verify authentication on the server side using NextAuth's utilities:

```typescript
import { getSession } from 'next-auth/react';
import { getToken } from 'next-auth/jwt';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const token = await getToken({ req: context.req });

  const address = token?.sub ?? null; // authenticated user's address

  return {
    props: {
      address,
      session,
    },
  };
};
```

For more details about RainbowKit authentication, refer to the [RainbowKit Authentication Documentation](https://www.rainbowkit.com/docs/authentication).

## Basic Frontend Implementation

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

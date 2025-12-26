# Storacha Network Setup Guide

This guide explains how to set up and use Storacha Network (formerly Web3.Storage) for decentralized storage in Lockdrop.

## What is Storacha?

Storacha Network is a decentralized hot storage layer built on IPFS and Filecoin, offering:

- **Email-based authentication** - No API keys needed
- **Space-based organization** - Content namespaced by DIDs
- **UCAN delegation** - User-controlled authorization
- **CDN-level speeds** - Optimized gateway performance
- **99.9% availability** - Redundant storage with cryptographic proofs
- **Browser-native** - Fully compatible with client-side JavaScript

## Prerequisites

- Node.js 18+ and npm 7+
- A valid email address for authentication
- Modern web browser with JavaScript enabled

## Installation

The Storacha client is already included in the project dependencies:

```bash
npm install
```

This installs `@storacha/client` which provides the JavaScript API for Storacha Network.

## Authentication Flow

Storacha uses email-based authentication instead of API keys. Here's how it works:

### 1. Login with Email

```typescript
import { storachaService } from '@/lib/storage';

// Send verification email
await storachaService.login('your-email@example.com');
// User receives email and clicks verification link
// After verification, they may need to select a payment plan
```

### 2. Create a Space

```typescript
// Create a space with optional name
const spaceDid = await storachaService.createSpace('my-lockdrop-space');
console.log('Space created:', spaceDid);
// The space is now ready for uploads
```

### 3. Check Authentication State

```typescript
const authState = storachaService.getAuthState();
console.log('Authenticated:', authState.isAuthenticated);
console.log('Email:', authState.email);
console.log('Space DID:', authState.spaceDid);
```

## Usage

### Upload a File

```typescript
const result = await storachaService.uploadEncryptedBlob(
  blob,
  'encrypted-message.bin',
  {
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`);
    }
  }
);

console.log('CID:', result.cid);
console.log('Size:', result.size);
console.log('Provider:', result.provider);
```

### Download by CID

```typescript
const blob = await storachaService.downloadEncryptedBlob(cid);
// blob contains the downloaded file
```

### Get Gateway URL

```typescript
const url = storachaService.getGatewayUrl(cid);
// Example: https://bafybeiabc123.ipfs.storacha.link
```

## Gateway Configuration

By default, Storacha uses the `storacha.link` gateway. You can configure a custom gateway:

```bash
# .env.local
NEXT_PUBLIC_STORACHA_GATEWAY=storacha.link
```

### Backward Compatibility

All existing IPFS CIDs remain accessible because:
- Storacha uses the standard IPFS protocol
- Content addressing is unchanged
- Multiple gateways can serve the same CID
- Old `w3s.link` URLs work with different gateways

## Pricing

Storacha offers tiered pricing:

- **Mild (Free)**: 5GB storage + 5GB egress
- **Medium ($10/mo)**: 100GB storage + 10GB egress
- **Extra Spicy ($100/mo)**: 2TB storage + 2TB egress

Additional storage/egress available at competitive rates.

## Troubleshooting

### Email Verification Timeout

If email verification times out:
- Check spam folder
- Ensure email address is correct
- Try again with a different email

### Upload Failures

If uploads fail:
- Check network connectivity
- Ensure space is created with `createSpace()`
- Check authentication state with `getAuthState()`
- The service automatically retries with exponential backoff

### CID Not Accessible

If a CID isn't accessible immediately:
- Wait a few seconds for propagation
- Try a different gateway
- Check the gateway URL is correct

## Integration in Lockdrop

### Current Implementation

The app currently uses StorachaService for all IPFS operations:

1. Update `lib/storage/index.ts`:
   ```typescript
   // Enable real Storacha uploads
   const USE_MOCK = false; // Set to false for real uploads
   ```

2. Implement authentication UI component

3. Test upload/download flows with real encrypted blobs

### Authentication UI Component

```typescript
'use client';

import { useState } from 'react';
import { storachaService } from '@/lib/storage';

export function StorachaAuth() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [authState, setAuthState] = useState(storachaService.getAuthState());

  const handleLogin = async () => {
    try {
      setStatus('Sending verification email...');
      await storachaService.login(email);
      
      setStatus('Creating space...');
      await storachaService.createSpace('lockdrop-space');
      
      setAuthState(storachaService.getAuthState());
      setStatus('Ready to upload!');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  if (authState.isAuthenticated) {
    return (
      <div>
        <p>✓ Authenticated as {authState.email}</p>
        <p>Space: {authState.spaceDid}</p>
      </div>
    );
  }

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your-email@example.com"
      />
      <button onClick={handleLogin}>Login with Storacha</button>
      {status && <p>{status}</p>}
    </div>
  );
}
```

## Resources

- [Storacha Documentation](https://docs.storacha.network/)
- [JavaScript Client Guide](https://docs.storacha.network/js-client/)
- [Quick Start Guide](https://docs.storacha.network/quickstart/)
- [Discord Community](https://discord.gg/8uza4ha73R)
- [GitHub Repository](https://github.com/storacha/upload-service)

## Support

For issues or questions:
- Check the [Storacha FAQ](https://docs.storacha.network/faq)
- Join the [Discord community](https://discord.gg/8uza4ha73R)
- Open an issue on [GitHub](https://github.com/storacha/upload-service/issues)

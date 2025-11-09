# Web3.Storage Migration Guide

## Overview

This document describes the migration from the legacy `web3.storage` package to the new `@web3-storage/w3up-client` package.

## What Changed

### Package Changes

- **Removed**: `web3.storage` (v4.5.5)
- **Added**: `@web3-storage/w3up-client` (v17.3.0)
- **Removed**: `types/web3-storage.d.ts` (no longer needed)

### API Changes

#### Authentication

**Old (web3.storage)**:
```typescript
const client = new Web3Storage({ 
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN 
});
```

**New (w3up-client)**:
```typescript
const client = await Client.create();
// Authentication is handled via email or delegation
// See: https://web3.storage/docs/w3up-client/
```

#### File Upload

**Old (web3.storage)**:
```typescript
const file = new Web3File([blob], filename, { type: blob.type });
const cid = await client.put([file], {
  onRootCidReady: () => { /* ... */ },
  onStoredChunk: (size: number) => { /* ... */ }
});
```

**New (w3up-client)**:
```typescript
const file = new File([blob], filename, { type: blob.type });
const cid = await client.uploadFile(file, {
  onShardStored: (meta: { size: number }) => { /* ... */ }
});
```

#### File Retrieval

**Old (web3.storage)**:
```typescript
const res = await client.get(cid);
const files = await res.files();
const blob = new Blob([await files[0].arrayBuffer()]);
```

**New (w3up-client)**:
```typescript
// Use public gateway for retrieval
const res = await fetch(`https://w3s.link/ipfs/${cid}`);
const blob = await res.blob();
```

### Progress Tracking

The progress callback signature changed:

**Old**: `onStoredChunk: (size: number) => void`
**New**: `onShardStored: (meta: { size: number }) => void`

The new API provides metadata objects instead of raw numbers.

### Environment Variables

- **Removed**: `NEXT_PUBLIC_WEB3_STORAGE_TOKEN` (no longer used)
- The new w3up-client uses email-based authentication or delegation tokens

## Migration Steps Completed

1. ✅ Uninstalled `web3.storage` package
2. ✅ Installed `@web3-storage/w3up-client` package
3. ✅ Updated `lib/storage/IPFSService.ts` to use new API
4. ✅ Removed `types/web3-storage.d.ts` type definitions
5. ✅ Updated `.env.local` with migration notes
6. ✅ Updated `.kiro/steering/tech.md` documentation

## Authentication Setup (Required for Production)

The new w3up-client requires authentication before uploading. There are two main approaches:

### Option 1: Email-based Authentication (Recommended for Development)

```typescript
const client = await Client.create();
await client.login('your-email@example.com');
// Check email for verification link
await client.setCurrentSpace('space-did');
```

### Option 2: Delegation Tokens (Recommended for Production)

```typescript
const client = await Client.create();
// Import delegation from environment or secure storage
const delegation = await client.addSpace(delegationProof);
await client.setCurrentSpace(delegation.did());
```

For more details, see: https://web3.storage/docs/w3up-client/

## Testing

The `MockIPFSService` remains unchanged and continues to work for testing without real uploads when `NEXT_PUBLIC_DEMO_MODE=true`.

## Breaking Changes

1. **Authentication Required**: The new client requires explicit authentication before uploads
2. **No Direct Retrieval**: File retrieval now uses public gateways instead of the client API
3. **Progress Callback**: The callback signature changed from `(size: number)` to `(meta: { size: number })`
4. **Async Client Creation**: Client creation is now async: `await Client.create()`

## Next Steps

1. Set up authentication for production use
2. Test uploads with the new client
3. Update any integration tests that mock the IPFS service
4. Consider implementing proper error handling for authentication failures

## Resources

- [w3up-client Documentation](https://web3.storage/docs/w3up-client/)
- [Migration Guide](https://web3.storage/docs/how-to/migrate/)
- [API Reference](https://web3-storage.github.io/w3up/modules/_web3_storage_w3up_client.html)

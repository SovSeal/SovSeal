# Timeout Implementation Guide

Quick reference for implementing timeout handling in FutureProof.

## Quick Start

1. Import the timeout utility:
```typescript
import { withTimeout, TIMEOUTS, TimeoutError } from '@/utils/timeout';
```

2. Wrap async operations:
```typescript
// Before
const result = await someAsyncOperation();

// After
const result = await withTimeout(
  someAsyncOperation(),
  TIMEOUTS.APPROPRIATE_TIMEOUT,
  'Operation description'
);
```

3. Handle timeout errors:
```typescript
try {
  const result = await withTimeout(...);
} catch (error) {
  if (error instanceof TimeoutError) {
    // Show user-friendly message
    console.error(`Operation timed out: ${error.operation}`);
  }
  throw error;
}
```

---

## File-by-File Implementation Checklist

### ✅ lib/storage/IPFSService.ts

**Lines to modify**: 
- Line ~210: `uploadToWeb3Storage()` - Add timeout to `client.put()`
- Line ~240: `verifyCIDAccessibility()` - Add timeout to `client.get()`
- Line ~320: `downloadEncryptedBlob()` - Add timeout to `client.get()`

**Import to add**:
```typescript
import { withTimeout, TIMEOUTS } from '@/utils/timeout';
```

**Changes**:
```typescript
// Line ~210 - Upload
const timeout = blob.size > 10_000_000 
  ? TIMEOUTS.IPFS_UPLOAD_LARGE 
  : TIMEOUTS.IPFS_UPLOAD_SMALL;

const cid = await withTimeout(
  client.put([file], { ... }),
  timeout,
  `IPFS upload (${(blob.size / 1024 / 1024).toFixed(2)} MB)`
);

// Line ~240 - Verification
const res = await withTimeout(
  client.get(cid),
  TIMEOUTS.IPFS_VERIFICATION,
  'IPFS CID verification'
);

// Line ~320 - Download
const res = await withTimeout(
  client.get(cid),
  TIMEOUTS.IPFS_DOWNLOAD,
  `IPFS download ${cid}`
);
```

---

### ✅ lib/contract/ContractService.ts

**Lines to modify**:
- Line ~120: `establishConnection()` - Add timeout to `ApiPromise.create()` and `api.isReady`
- Line ~220: `storeMessage()` - Add timeout to transaction finalization
- Line ~280: `getSentMessages()` - Add timeout to queries
- Line ~320: `getReceivedMessages()` - Add timeout to queries
- Line ~360: `queryMessagesFromRemarks()` - Add timeout to block queries

**Import to add**:
```typescript
import { withTimeout, TIMEOUTS } from '@/utils/timeout';
```

**Changes**:
```typescript
// Line ~120 - Connection
const provider = new WsProvider(config.rpcEndpoint);
const api = await withTimeout(
  ApiPromise.create({ provider }),
  TIMEOUTS.BLOCKCHAIN_CONNECT,
  `Polkadot RPC connection to ${config.rpcEndpoint}`
);

await withTimeout(
  api.isReady,
  TIMEOUTS.BLOCKCHAIN_CONNECT,
  'Polkadot API ready check'
);

// Line ~220 - Transaction
const { web3FromAddress } = await import("@polkadot/extension-dapp");
const injector = await withTimeout(
  web3FromAddress(account.address),
  TIMEOUTS.WALLET_ENABLE,
  'Get wallet injector'
);

return withTimeout(
  new Promise<TransactionResult>((resolve, reject) => {
    api.tx.system.remark(remarkData).signAndSend(
      account.address,
      { signer: injector.signer },
      ({ status, dispatchError }) => {
        // ... existing callback code
      }
    ).catch(reject);
  }),
  TIMEOUTS.BLOCKCHAIN_TX_FINALIZE,
  'Transaction finalization'
);

// Line ~360 - Block queries
const currentBlock = await withTimeout(
  api.rpc.chain.getBlock(),
  TIMEOUTS.BLOCKCHAIN_QUERY,
  'Get current block'
);

// Wrap entire loop
await withTimeout(
  (async () => {
    for (let i = currentBlockNumber; i >= startBlock; i--) {
      const blockHash = await withTimeout(
        api.rpc.chain.getBlockHash(i),
        TIMEOUTS.BLOCKCHAIN_QUERY,
        `Get block hash ${i}`
      );
      
      const block = await withTimeout(
        api.rpc.chain.getBlock(blockHash),
        TIMEOUTS.BLOCKCHAIN_QUERY,
        `Get block ${i}`
      );
      
      // ... process block
    }
  })(),
  TIMEOUTS.BLOCKCHAIN_QUERY_BATCH,
  'Query message history (100 blocks)'
);
```

---

### ✅ lib/wallet/WalletProvider.tsx

**Lines to modify**:
- Line ~50: `connect()` - Add timeout to `web3Enable()` and `web3Accounts()`
- Line ~110: `signMessage()` - Add timeout to `web3FromAddress()` and signing

**Import to add**:
```typescript
import { withTimeout, TIMEOUTS, TimeoutError } from '@/utils/timeout';
```

**Changes**:
```typescript
// Line ~50 - Connect
const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');

const extensions = await withTimeout(
  web3Enable(APP_NAME),
  TIMEOUTS.WALLET_ENABLE,
  'Enable Talisman extension'
);

const allAccounts = await withTimeout(
  web3Accounts(),
  TIMEOUTS.WALLET_ACCOUNTS,
  'Fetch wallet accounts'
);

// Add error handling
} catch (error) {
  if (error instanceof TimeoutError) {
    throw new Error(
      'Wallet connection timed out. Please ensure Talisman extension is unlocked and responsive.'
    );
  }
  throw error;
}

// Line ~110 - Sign message
const { web3FromAddress } = await import('@polkadot/extension-dapp');
const { stringToHex } = await import('@polkadot/util');

const injector = await withTimeout(
  web3FromAddress(state.selectedAccount.address),
  TIMEOUTS.WALLET_ENABLE,
  'Get wallet injector for signing'
);

const messageHex = stringToHex(message);
const { signature } = await withTimeout(
  injector.signer.signRaw!({
    address: state.selectedAccount.address,
    data: messageHex,
    type: 'bytes',
  }),
  TIMEOUTS.WALLET_SIGN,
  'Sign message'
);
```

---

### ✅ lib/crypto/AsymmetricCrypto.ts

**Lines to modify**:
- Line ~40: `getPublicKeyFromTalisman()` - Add timeout to `web3Accounts()`

**Import to add**:
```typescript
import { withTimeout, TIMEOUTS } from '@/utils/timeout';
```

**Changes**:
```typescript
// Line ~40
const { web3Accounts } = await import('@polkadot/extension-dapp');

const accounts = await withTimeout(
  web3Accounts(),
  TIMEOUTS.WALLET_ACCOUNTS,
  'Fetch accounts for public key'
);
```

---

### ✅ lib/message/MessageCreationService.ts

**Lines to modify**:
- Line ~80: `createMessage()` - Add timeout to `getPublicKeyFromTalisman()`
- Line ~120: Add timeout to IPFS uploads
- Line ~150: Add timeout to contract submission

**Import to add**:
```typescript
import { withTimeout, TIMEOUTS } from '@/utils/timeout';
```

**Changes**:
```typescript
// Line ~80 - Get public key
const recipientPublicKey = await withTimeout(
  AsymmetricCrypto.getPublicKeyFromTalisman(params.recipientAddress),
  TIMEOUTS.WALLET_ACCOUNTS,
  'Retrieve recipient public key'
);

// Line ~120 - IPFS uploads (already have timeout in IPFSService, but add safety)
const keyUploadResult = await withTimeout(
  ipfsService.uploadEncryptedBlob(encryptedKeyBlob, `key-${Date.now()}.json`),
  TIMEOUTS.IPFS_UPLOAD_SMALL,
  'Upload encrypted key'
);

const mediaUploadResult = await withTimeout(
  ipfsService.uploadEncryptedBlob(encryptedBlob, `message-${Date.now()}.enc`, { onProgress }),
  TIMEOUTS.IPFS_UPLOAD_LARGE,
  'Upload encrypted media'
);

// Line ~150 - Contract submission (already has timeout in ContractService)
const transactionResult = await withTimeout(
  ContractService.storeMessage({ ... }, params.senderAccount),
  TIMEOUTS.BLOCKCHAIN_TX_FINALIZE + 10_000, // Extra buffer
  'Store message on blockchain'
);
```

---

## Testing Checklist

After implementing timeouts, test each scenario:

### IPFS Operations
- [ ] Upload small file (< 10MB) - should use 30s timeout
- [ ] Upload large file (> 10MB) - should use 60s timeout
- [ ] Simulate slow network (DevTools throttling) - should timeout gracefully
- [ ] Verify CID after upload - should timeout if gateway is slow

### Blockchain Operations
- [ ] Connect to RPC endpoint - should timeout after 15s if unreachable
- [ ] Submit transaction - should timeout after 2 minutes if not finalized
- [ ] Query messages - should timeout after 60s for batch queries
- [ ] Test with invalid RPC endpoint - should fail fast

### Wallet Operations
- [ ] Connect wallet - should timeout after 30s if extension unresponsive
- [ ] Fetch accounts - should timeout after 10s
- [ ] Sign message - should timeout after 2 minutes (user has time to review)
- [ ] Test with extension closed - should show helpful error

### Error Handling
- [ ] Timeout errors show user-friendly messages
- [ ] Users can retry after timeout
- [ ] Progress indicators show time remaining
- [ ] Logs capture timeout events for monitoring

---

## Common Patterns

### Pattern 1: Simple Timeout
```typescript
const result = await withTimeout(
  operation(),
  TIMEOUTS.APPROPRIATE_TIMEOUT,
  'Operation name'
);
```

### Pattern 2: Conditional Timeout
```typescript
const timeout = condition 
  ? TIMEOUTS.LONG_TIMEOUT 
  : TIMEOUTS.SHORT_TIMEOUT;

const result = await withTimeout(
  operation(),
  timeout,
  'Operation name'
);
```

### Pattern 3: Timeout with Error Handling
```typescript
try {
  const result = await withTimeout(
    operation(),
    TIMEOUTS.APPROPRIATE_TIMEOUT,
    'Operation name'
  );
  return result;
} catch (error) {
  if (error instanceof TimeoutError) {
    // User-friendly message
    throw new Error('Operation timed out. Please try again.');
  }
  throw error;
}
```

### Pattern 4: Nested Timeouts
```typescript
// Outer timeout for entire operation
await withTimeout(
  (async () => {
    // Inner timeouts for individual steps
    const step1 = await withTimeout(
      operation1(),
      TIMEOUTS.STEP_TIMEOUT,
      'Step 1'
    );
    
    const step2 = await withTimeout(
      operation2(),
      TIMEOUTS.STEP_TIMEOUT,
      'Step 2'
    );
    
    return { step1, step2 };
  })(),
  TIMEOUTS.TOTAL_TIMEOUT,
  'Complete operation'
);
```

---

## Troubleshooting

### Issue: Timeout too short
**Symptom**: Operations fail frequently with timeout errors  
**Solution**: Increase timeout value or add retry logic

### Issue: Timeout too long
**Symptom**: Users wait too long before seeing error  
**Solution**: Decrease timeout value based on real-world metrics

### Issue: Timeout not working
**Symptom**: Operation still hangs indefinitely  
**Solution**: Check that promise is properly wrapped and not caught elsewhere

### Issue: Multiple timeout errors
**Symptom**: Same operation times out repeatedly  
**Solution**: Check network connectivity, service availability, or increase timeout

---

## Performance Monitoring

Add logging to track timeout effectiveness:

```typescript
const startTime = Date.now();
try {
  const result = await withTimeout(operation(), timeout, name);
  const duration = Date.now() - startTime;
  
  // Log success with duration
  console.log(`✅ ${name} completed in ${duration}ms (timeout: ${timeout}ms)`);
  
  // Alert if operation took > 80% of timeout
  if (duration > timeout * 0.8) {
    console.warn(`⚠️ ${name} took ${duration}ms, close to timeout of ${timeout}ms`);
  }
  
  return result;
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error(`❌ ${name} timed out after ${timeout}ms`);
  }
  throw error;
}
```

---

## Completion Checklist

- [ ] `utils/timeout.ts` created and tested
- [ ] All IPFS operations have timeouts
- [ ] All blockchain operations have timeouts
- [ ] All wallet operations have timeouts
- [ ] Error messages are user-friendly
- [ ] Timeout values are configurable
- [ ] Logging added for monitoring
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] README updated with timeout information

---

**Estimated Implementation Time**: 4-6 hours  
**Priority**: HIGH - Critical for production reliability  
**Status**: Ready to implement

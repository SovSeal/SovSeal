# Timeout Architecture

Visual guide to timeout handling in Lockdrop.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FutureProof Application                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   UI Layer   │─────▶│ Service Layer│─────▶│  External │ │
│  │  (React)     │      │  (Business   │      │  Services │ │
│  │              │      │   Logic)     │      │           │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         │                      │                     │       │
│         │                      │                     │       │
│         ▼                      ▼                     ▼       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Timeout Wrapper (utils/timeout.ts)         │  │
│  │  • withTimeout()                                     │  │
│  │  • withAbortTimeout()                                │  │
│  │  • withRetry()                                       │  │
│  │  • TIMEOUTS constants                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         External Services                │
        ├─────────────────────────────────────────┤
        │  • IPFS (Web3.Storage)                  │
        │  • Polkadot Blockchain (Westend RPC)    │
        │  • Talisman Wallet Extension            │
        └─────────────────────────────────────────┘
```

## Timeout Flow

### Without Timeout (Current - ❌ BAD)

```
User Action
    │
    ▼
Service Call ──────────────────────────────────────▶ External Service
    │                                                      │
    │                                                      │
    │                                                      ▼
    │                                                  (Slow/Hung)
    │                                                      │
    │                                                      │
    └──────────────────── WAITING FOREVER ────────────────┘
                              ⏳
                         (User stuck)
```

### With Timeout (Proposed - ✅ GOOD)

```
User Action
    │
    ▼
Service Call ──────────────────────────────────────▶ External Service
    │                                                      │
    │                                                      │
    ▼                                                      ▼
Timeout Wrapper                                       (Slow/Hung)
    │                                                      │
    │  ⏱️  Start timer (e.g., 30s)                        │
    │                                                      │
    ├──────────────────── Race Condition ─────────────────┤
    │                                                      │
    │  ⏱️  Timer expires (30s)                            │
    │                                                      │
    ▼                                                      ▼
TimeoutError                                          (Still hung)
    │
    ▼
User sees error message
    │
    ▼
User can retry
```

## Message Creation Flow with Timeouts

```
┌─────────────────────────────────────────────────────────────┐
│                  Create Message Flow                         │
└─────────────────────────────────────────────────────────────┘

1. User submits form
   │
   ▼
2. Encrypt media blob (local - fast)
   │  ⏱️  Timeout: 30s (safety)
   │
   ▼
3. Get recipient public key
   │  ⏱️  Timeout: 10s (wallet extension)
   │
   ▼
4. Encrypt AES key (local - fast)
   │  ⏱️  Timeout: 10s (safety)
   │
   ▼
5. Upload encrypted key to IPFS
   │  ⏱️  Timeout: 30s (small file)
   │
   ▼
6. Upload encrypted media to IPFS
   │  ⏱️  Timeout: 60s (large file)
   │
   ▼
7. Submit transaction to blockchain
   │  ⏱️  Timeout: 120s (finalization)
   │
   ▼
8. Success! ✅

If ANY step times out:
   │
   ▼
Show error message
   │
   ▼
User can retry from failed step
```

## Dashboard Query Flow with Timeouts

```
┌─────────────────────────────────────────────────────────────┐
│                  Dashboard Query Flow                        │
└─────────────────────────────────────────────────────────────┘

1. User opens dashboard
   │
   ▼
2. Connect to blockchain RPC
   │  ⏱️  Timeout: 15s (connection)
   │
   ▼
3. Get current block number
   │  ⏱️  Timeout: 10s (single query)
   │
   ▼
4. Query last 100 blocks
   │  ⏱️  Timeout: 60s (batch query)
   │  │
   │  ├─▶ Block 1000 ⏱️  10s
   │  ├─▶ Block 999  ⏱️  10s
   │  ├─▶ Block 998  ⏱️  10s
   │  └─▶ ... (up to 60s total)
   │
   ▼
5. Parse and display messages ✅

If ANY step times out:
   │
   ▼
Show error message
   │
   ▼
User can refresh to retry
```

## Timeout Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Timeout Hierarchy                         │
└─────────────────────────────────────────────────────────────┘

Operation Level (Shortest)
    │
    ├─▶ Single RPC query: 10s
    ├─▶ Wallet account fetch: 10s
    ├─▶ IPFS small upload: 30s
    │
    ▼
Batch Level (Medium)
    │
    ├─▶ IPFS large upload: 60s
    ├─▶ Blockchain batch query: 60s
    ├─▶ Wallet enable: 30s
    │
    ▼
Transaction Level (Longest)
    │
    ├─▶ Transaction finalization: 120s
    ├─▶ Message signing: 120s
    │
    ▼
Total Flow Level (Sum of all)
    │
    └─▶ Complete message creation: ~5 minutes max
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Error Handling Flow                        │
└─────────────────────────────────────────────────────────────┘

Operation starts
    │
    ▼
withTimeout() wraps operation
    │
    ├─────────────────────────────────────┐
    │                                     │
    ▼                                     ▼
Operation completes                   Timer expires
    │                                     │
    ▼                                     ▼
Return result ✅                      Throw TimeoutError ❌
                                          │
                                          ▼
                                    Catch in service layer
                                          │
                                          ├─▶ Log error
                                          ├─▶ Add context
                                          ├─▶ User-friendly message
                                          │
                                          ▼
                                    Show error to user
                                          │
                                          ├─▶ "Upload timed out"
                                          ├─▶ "Try again"
                                          ├─▶ "Check connection"
                                          │
                                          ▼
                                    User can retry
```

## Retry Logic with Exponential Backoff

```
┌─────────────────────────────────────────────────────────────┐
│              Retry with Exponential Backoff                  │
└─────────────────────────────────────────────────────────────┘

Attempt 1
    │  ⏱️  Timeout: 30s
    ▼
  Failed ❌
    │
    │  ⏳ Wait: 1s
    ▼
Attempt 2
    │  ⏱️  Timeout: 30s
    ▼
  Failed ❌
    │
    │  ⏳ Wait: 2s (exponential)
    ▼
Attempt 3
    │  ⏱️  Timeout: 30s
    ▼
  Failed ❌
    │
    │  ⏳ Wait: 4s (exponential)
    ▼
Final Attempt
    │  ⏱️  Timeout: 30s
    ▼
  Success ✅  OR  Give up ❌
```

## Timeout Constants Map

```
┌─────────────────────────────────────────────────────────────┐
│                  Timeout Constants                           │
└─────────────────────────────────────────────────────────────┘

IPFS Operations:
├─ IPFS_UPLOAD_SMALL      30,000ms (30s)
├─ IPFS_UPLOAD_LARGE      60,000ms (60s)
├─ IPFS_VERIFICATION      30,000ms (30s)
└─ IPFS_DOWNLOAD          45,000ms (45s)

Blockchain Operations:
├─ BLOCKCHAIN_CONNECT     15,000ms (15s)
├─ BLOCKCHAIN_QUERY       10,000ms (10s)
├─ BLOCKCHAIN_QUERY_BATCH 60,000ms (60s)
├─ BLOCKCHAIN_TX_SUBMIT   30,000ms (30s)
└─ BLOCKCHAIN_TX_FINALIZE 120,000ms (2min)

Wallet Operations:
├─ WALLET_ENABLE          30,000ms (30s)
├─ WALLET_ACCOUNTS        10,000ms (10s)
└─ WALLET_SIGN            120,000ms (2min)

Crypto Operations:
├─ CRYPTO_ENCRYPT         30,000ms (30s)
├─ CRYPTO_DECRYPT         30,000ms (30s)
└─ CRYPTO_HASH            10,000ms (10s)
```

## Implementation Pattern

```typescript
// ┌─────────────────────────────────────────────────────────┐
// │              Standard Implementation Pattern             │
// └─────────────────────────────────────────────────────────┘

import { withTimeout, TIMEOUTS, TimeoutError } from '@/utils/timeout';

async function someOperation() {
  try {
    // Wrap the async operation
    const result = await withTimeout(
      externalServiceCall(),
      TIMEOUTS.APPROPRIATE_TIMEOUT,
      'Operation description'
    );
    
    return result;
  } catch (error) {
    // Handle timeout specifically
    if (error instanceof TimeoutError) {
      console.error(`Timeout: ${error.operation} after ${error.timeoutMs}ms`);
      throw new Error(
        'Operation timed out. Please check your connection and try again.'
      );
    }
    
    // Re-throw other errors
    throw error;
  }
}
```

## Monitoring Dashboard (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                  Timeout Monitoring                          │
└─────────────────────────────────────────────────────────────┘

Metrics to Track:
├─ Total operations
├─ Successful operations
├─ Timed out operations
├─ Average duration
├─ P95 duration
└─ Timeout rate (%)

Alerts:
├─ Timeout rate > 5%
├─ Average duration > 80% of timeout
└─ Specific operation timing out repeatedly

Dashboard:
┌──────────────────────────────────────────────────┐
│  IPFS Uploads                                    │
│  ████████████████████░░░░ 85% success            │
│  Avg: 25s | P95: 45s | Timeout: 60s             │
├──────────────────────────────────────────────────┤
│  Blockchain Queries                              │
│  ████████████████████████ 95% success            │
│  Avg: 5s | P95: 8s | Timeout: 10s               │
├──────────────────────────────────────────────────┤
│  Wallet Operations                               │
│  ██████████████████████░░ 90% success            │
│  Avg: 15s | P95: 25s | Timeout: 30s             │
└──────────────────────────────────────────────────┘
```

## Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Strategy                          │
└─────────────────────────────────────────────────────────────┘

Unit Tests:
├─ Test withTimeout() utility
├─ Test TimeoutError thrown correctly
├─ Test timeout clears properly
└─ Test retry logic

Integration Tests:
├─ Test IPFS upload timeout
├─ Test blockchain connection timeout
├─ Test wallet operation timeout
└─ Test transaction timeout

Manual Tests:
├─ Network throttling (Slow 3G)
├─ Invalid RPC endpoint
├─ Closed wallet extension
└─ Large file upload

Load Tests:
├─ Multiple concurrent operations
├─ Timeout under load
└─ Resource cleanup
```

---

## Key Takeaways

1. **Every external service call needs a timeout**
2. **Timeouts prevent indefinite hangs**
3. **User-friendly error messages are critical**
4. **Retry logic helps with transient failures**
5. **Monitoring helps tune timeout values**

## References

- Implementation: `utils/timeout.ts`
- Analysis: `TIMEOUT_ANALYSIS.md`
- Guide: `TIMEOUT_IMPLEMENTATION_GUIDE.md`
- Summary: `TIMEOUT_SUMMARY.md`

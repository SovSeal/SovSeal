# Timeout Quick Reference Card

**Purpose**: Quick lookup for timeout values and expected behavior  
**Last Updated**: November 2, 2025

---

## Timeout Values at a Glance

| Operation | Timeout | File/Function | Notes |
|-----------|---------|---------------|-------|
| **IPFS Upload (Small)** | 30s | `IPFSService.uploadToWeb3Storage()` | Files < 10MB |
| **IPFS Upload (Large)** | 60s | `IPFSService.uploadToWeb3Storage()` | Files ≥ 10MB |
| **IPFS Verification** | 30s | `IPFSService.verifyCIDAccessibility()` | CID check |
| **IPFS Download** | 45s | `IPFSService.downloadEncryptedBlob()` | Blob retrieval |
| **RPC Connection** | 15s | `ContractService.establishConnection()` | Polkadot API |
| **Block Query** | 10s | `ContractService.queryMessagesFromRemarks()` | Per block |
| **Batch Query** | 60s | `ContractService.queryMessagesFromRemarks()` | 100 blocks |
| **Transaction** | 120s | `ContractService.storeMessage()` | Finalization |
| **Wallet Enable** | 30s | `WalletProvider.connect()` | Extension enable |
| **Wallet Accounts** | 10s | `WalletProvider.connect()` | Account fetch |
| **Wallet Sign** | 120s | `WalletProvider.signMessage()` | User signing |

---

## Expected Timing Under Different Conditions

### Normal Network (No Throttling)

| Operation | Typical Time | Timeout | Margin |
|-----------|-------------|---------|--------|
| IPFS Upload (10MB) | 5-10s | 30s | 3-6x |
| IPFS Upload (50MB) | 15-30s | 60s | 2-4x |
| RPC Connection | 1-2s | 15s | 7-15x |
| Block Query (100) | 5-10s | 60s | 6-12x |
| Transaction | 30-60s | 120s | 2-4x |
| Wallet Enable | 1-2s | 30s | 15-30x |
| Message Sign | 5-10s | 120s | 12-24x |

### Slow 3G (400ms RTT, 400kbps)

| Operation | Expected Time | Timeout | Margin |
|-----------|--------------|---------|--------|
| IPFS Upload (10MB) | 20-30s | 30s | 1-1.5x |
| IPFS Upload (50MB) | 50-60s | 60s | 1-1.2x |
| RPC Connection | 10-15s | 15s | 1-1.5x |
| Block Query (100) | 40-60s | 60s | 1-1.5x |
| Transaction | 90-120s | 120s | 1-1.3x |
| Wallet Enable | 5-10s | 30s | 3-6x |
| Message Sign | 10-20s | 120s | 6-12x |

### Fast 3G (562.5ms RTT, 1.6Mbps)

| Operation | Expected Time | Timeout | Margin |
|-----------|--------------|---------|--------|
| IPFS Upload (10MB) | 10-20s | 30s | 1.5-3x |
| IPFS Upload (50MB) | 30-45s | 60s | 1.3-2x |
| RPC Connection | 5-10s | 15s | 1.5-3x |
| Block Query (100) | 20-40s | 60s | 1.5-3x |
| Transaction | 60-90s | 120s | 1.3-2x |
| Wallet Enable | 3-8s | 30s | 3.75-10x |
| Message Sign | 8-15s | 120s | 8-15x |

---

## Error Messages

### IPFS Errors

```
Operation "IPFS upload (X.XX MB)" timed out after XXXXXms
```
**User Action**: Check internet connection, try smaller file, or retry

```
CID verification failed: [error]
```
**User Action**: Retry upload, check Web3.Storage status

```
IPFS download failed: [error]
```
**User Action**: Check internet connection, verify CID, or retry

### Blockchain Errors

```
Operation "Polkadot RPC connection to wss://..." timed out after 15000ms
Failed to connect to Polkadot RPC endpoint: [error].
Please check your network connection and ensure the RPC endpoint is accessible.
```
**User Action**: Check network, verify RPC endpoint, or try again

```
Transaction submission failed: [error]
You may need testnet tokens. Get free Westend tokens from the faucet:
- https://faucet.polkadot.io/westend
- https://matrix.to/#/#westend_faucet:matrix.org
```
**User Action**: Get testnet tokens or check wallet balance

```
Operation "Transaction finalization" timed out after 120000ms
```
**User Action**: Check network, verify transaction on block explorer, or retry

### Wallet Errors

```
Wallet connection timed out.
Please ensure Talisman extension is unlocked and responsive.
```
**User Action**: Unlock Talisman, check extension is installed, or refresh page

```
Message signing timed out.
Please check your wallet extension and try again.
```
**User Action**: Check Talisman is open, approve signing prompt, or retry

```
Talisman extension not found. Please install it to continue.
```
**User Action**: Install Talisman from https://talisman.xyz

---

## Retry Strategy

### IPFS Operations
- **Max Attempts**: 3
- **Backoff**: Exponential (1s, 2s, 4s)
- **Jitter**: ±30%
- **Fallback**: Pinata (if configured)

### Blockchain Operations
- **Max Attempts**: 3 (built into service)
- **Backoff**: Linear (1s between attempts)
- **Fallback**: None (user must retry)

### Wallet Operations
- **Max Attempts**: 1 (user-initiated)
- **Backoff**: None
- **Fallback**: User must retry manually

---

## When to Adjust Timeouts

### Increase Timeout If:
- ✅ P95 timing > 80% of timeout value
- ✅ Timeout rate > 5% in production
- ✅ User complaints about premature timeouts
- ✅ Network conditions consistently slower

### Decrease Timeout If:
- ✅ P95 timing < 30% of timeout value
- ✅ Users waiting too long for errors
- ✅ Faster alternatives available
- ✅ Network conditions improved

### Keep Timeout If:
- ✅ P95 timing 30-80% of timeout value
- ✅ Timeout rate < 5%
- ✅ No user complaints
- ✅ Good balance of patience vs responsiveness

---

## Testing Checklist

### Quick Smoke Test (5 minutes)
- [ ] Connect wallet (normal network)
- [ ] Upload small file (< 10MB)
- [ ] Submit transaction
- [ ] Query messages
- [ ] All operations complete without timeout

### Full Test (60 minutes)
- [ ] All 24 test cases in `MANUAL_TIMEOUT_TEST_GUIDE.md`
- [ ] Test under Slow 3G, Fast 3G, and Offline
- [ ] Verify all timeout scenarios
- [ ] Confirm error messages
- [ ] Test retry functionality

### Regression Test (15 minutes)
- [ ] Connect wallet
- [ ] Create message end-to-end
- [ ] View message on dashboard
- [ ] No timeouts or errors
- [ ] All features working

---

## Troubleshooting

### Operation Times Out Immediately
**Possible Causes**:
- Network offline
- Service unavailable
- Invalid configuration
- Extension not installed

**Solutions**:
1. Check internet connection
2. Verify service status
3. Check environment variables
4. Install required extensions

### Operation Times Out After Expected Duration
**Possible Causes**:
- Slow network
- Large file size
- High network latency
- Service degradation

**Solutions**:
1. Try faster network
2. Use smaller files
3. Wait and retry
4. Check service status

### Operation Never Times Out
**Possible Causes**:
- Timeout not implemented
- Timeout value too high
- Promise never resolves/rejects
- Code bug

**Solutions**:
1. Verify timeout implementation
2. Check timeout constant used
3. Review promise handling
4. Debug with console logs

---

## Code Examples

### Using withTimeout

```typescript
import { withTimeout, TIMEOUTS } from '@/utils/timeout';

// Simple timeout
const result = await withTimeout(
  someAsyncOperation(),
  TIMEOUTS.IPFS_UPLOAD_SMALL,
  'IPFS upload'
);

// Conditional timeout
const timeout = fileSize > 10_000_000 
  ? TIMEOUTS.IPFS_UPLOAD_LARGE 
  : TIMEOUTS.IPFS_UPLOAD_SMALL;

const result = await withTimeout(
  uploadFile(file),
  timeout,
  `File upload (${fileSize} bytes)`
);
```

### Using withAbortTimeout

```typescript
import { withAbortTimeout, TIMEOUTS } from '@/utils/timeout';

const result = await withAbortTimeout(
  (signal) => fetch(url, { signal }),
  TIMEOUTS.IPFS_DOWNLOAD,
  'IPFS download'
);
```

### Using withRetry

```typescript
import { withRetry, TIMEOUTS } from '@/utils/timeout';

const result = await withRetry(
  () => uploadToIPFS(blob),
  {
    maxAttempts: 3,
    timeoutMs: TIMEOUTS.IPFS_UPLOAD_SMALL,
    initialDelayMs: 1000,
    operation: 'IPFS upload',
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}: ${error.message}`);
    }
  }
);
```

### Handling TimeoutError

```typescript
import { TimeoutError } from '@/utils/timeout';

try {
  await withTimeout(operation(), 5000, 'My operation');
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error(`Timeout: ${error.operation} after ${error.timeoutMs}ms`);
    // Show user-friendly error message
    showError('Operation timed out. Please try again.');
  } else {
    // Handle other errors
    throw error;
  }
}
```

---

## Performance Targets

### Success Rates (Production)
- **Target**: > 95% operations complete without timeout
- **Warning**: 90-95% success rate
- **Critical**: < 90% success rate

### Operation Duration (P95)
- **Good**: < 50% of timeout value
- **Acceptable**: 50-80% of timeout value
- **Concerning**: > 80% of timeout value

### User Experience
- **Excellent**: Operations complete in < 10s
- **Good**: Operations complete in 10-30s
- **Acceptable**: Operations complete in 30-60s
- **Poor**: Operations take > 60s or timeout

---

## Related Documents

- **Implementation**: `TIMEOUT_IMPLEMENTATION_GUIDE.md`
- **Architecture**: `docs/TIMEOUT_ARCHITECTURE.md`
- **Analysis**: `TIMEOUT_ANALYSIS.md`
- **Verification**: `TIMEOUT_VERIFICATION_REPORT.md`
- **Automated Testing**: `TIMEOUT_AUTOTEST_REPORT.md`
- **Manual Testing**: `MANUAL_TIMEOUT_TEST_GUIDE.md`
- **Summary**: `TIMEOUT_TESTING_SUMMARY.md`
- **Checklist**: `.github/TIMEOUT_IMPLEMENTATION_CHECKLIST.md`
- **Code**: `utils/timeout.ts`

---

**Quick Reference Version**: 1.0  
**Last Updated**: November 2, 2025  
**Print this page for easy reference during testing!**


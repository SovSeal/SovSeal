# Retry Logic Quick Reference

Quick reference for retry logic implementation across all network operations.

---

## At a Glance

| Service | Operation | Max Attempts | Backoff | Jitter |
|---------|-----------|--------------|---------|--------|
| **IPFS** | Upload | 3 per provider | 1s, 2s, 4s | ±30% |
| **IPFS** | Download | 3 | 1s, 2s, 4s | ±30% |
| **IPFS** | Verification | 3 | 1s, 2s, 4s | ±30% |
| **Wallet** | Connect | 3 | 1s, 2s | No |
| **Blockchain** | RPC Connect | 3 | 1s, 2s, 4s | No |
| **Blockchain** | Query | 3 | 1s, 2s, 4s | No |

---

## Error Classification

### ✅ Retryable (Exponential Backoff)
- Network errors (timeout, connection refused, DNS)
- HTTP 429 (rate limiting)
- HTTP 503 (service unavailable)
- HTTP 504 (gateway timeout)
- WebSocket errors
- Unknown errors (conservative)

### ❌ Non-Retryable (Fail Fast)
- HTTP 401/403 (authentication)
- HTTP 400 (bad request)
- HTTP 404 (not found)
- HTTP 413 (payload too large)
- Invalid configuration
- Extension not found
- No accounts available

---

## Implementation Patterns

### Pattern 1: Simple Retry Loop
```typescript
const MAX_ATTEMPTS = 3;
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    if (attempt > 1) {
      const delay = 1000 * Math.pow(2, attempt - 2); // 1s, 2s, 4s
      await sleep(delay);
    }
    return await operation();
  } catch (error) {
    if (attempt === MAX_ATTEMPTS) throw error;
  }
}
```

### Pattern 2: Smart Retry with Error Detection
```typescript
for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    return await operation();
  } catch (error) {
    if (!isRetryableError(error) || attempt === MAX_ATTEMPTS) {
      throw error; // Fail fast
    }
    const delay = 1000 * Math.pow(2, attempt - 1);
    await sleep(delay);
  }
}
```

### Pattern 3: Retry with Jitter (IPFS)
```typescript
const baseDelay = 1000 * Math.pow(2, attempt - 1);
const jitter = Math.random() * 0.3 * baseDelay; // ±30%
const delay = baseDelay + jitter;
await sleep(delay);
```

---

## Console Messages

### Success After Retry
```
⚠️  Wallet connection attempt 1 failed: Network timeout
🔄 Retrying wallet connection (attempt 2/3) after 1000ms...
✅ Connected successfully
```

### Exhausted Retries
```
⚠️  RPC connection attempt 1 failed: Connection refused
🔄 Retrying RPC connection (attempt 2/3) after 1000ms...
⚠️  RPC connection attempt 2 failed: Connection refused
🔄 Retrying RPC connection (attempt 3/3) after 2000ms...
❌ Failed after 3 attempts: Connection refused
```

### Fail Fast
```
❌ Non-retryable error, failing fast: Invalid address format
```

---

## Testing Checklist

- [ ] Test with Slow 3G throttling
- [ ] Test offline → online transition
- [ ] Verify exponential backoff timing
- [ ] Confirm fail-fast on non-retryable errors
- [ ] Check error messages are user-friendly
- [ ] Verify operations succeed within timeout limits
- [ ] Test rate limiting scenarios (if possible)

---

## Files Modified

- ✅ `lib/storage/IPFSService.ts` - Already had excellent retry logic
- ✅ `lib/wallet/WalletProvider.tsx` - Added retry to connect()
- ✅ `lib/contract/ContractService.ts` - Improved retry with exponential backoff

---

## Related Docs

- `RETRY_LOGIC_IMPLEMENTATION.md` - Full implementation details
- `TIMEOUT_ARCHITECTURE.md` - Timeout configuration
- `utils/timeout.ts` - Timeout utilities

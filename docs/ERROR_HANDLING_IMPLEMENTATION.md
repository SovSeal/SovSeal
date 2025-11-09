# Error Handling Implementation

This document describes the comprehensive error handling system implemented in FutureProof.

## Overview

The error handling system provides:
- Centralized error classification and logging
- User-friendly error messages with recovery suggestions
- Automatic retry logic with exponential backoff
- Edge case validation and prevention
- Network resilience and offline handling
- Error boundaries for React components

## Components

### 1. Error Classification (`utils/errorHandling.ts`)

Classifies errors into categories and provides structured information:

```typescript
import { classifyError } from '@/utils/errorHandling';

const errorInfo = classifyError(error);
// Returns: category, severity, message, suggestions, retryable, etc.
```

**Error Categories:**
- `WALLET` - Wallet connection and authentication issues
- `MEDIA` - Media recording and upload issues
- `ENCRYPTION` - Encryption/decryption failures
- `STORAGE` - IPFS upload/download issues
- `BLOCKCHAIN` - Transaction and query failures
- `UNLOCK` - Timestamp and decryption issues
- `NETWORK` - Network connectivity problems
- `VALIDATION` - Input validation errors
- `UNKNOWN` - Unclassified errors

**Severity Levels:**
- `INFO` - Informational messages
- `WARNING` - Non-critical issues
- `ERROR` - Operation failures
- `CRITICAL` - System-level failures

### 2. Error Logger (`lib/monitoring/ErrorLogger.ts`)

Centralized error logging with context:

```typescript
import { ErrorLogger } from '@/lib/monitoring/ErrorLogger';

ErrorLogger.log(error, 'Message Creation', {
  messageId: '123',
  recipientAddress: '5Grw...',
});
```

**Features:**
- In-memory log storage (last 100 errors)
- Console logging based on severity
- Production monitoring integration points
- Error statistics and export

### 3. Retry Utilities (`utils/retry.ts`)

Automatic retry with exponential backoff:

```typescript
import { withRetry } from '@/utils/retry';

const result = await withRetry(
  async () => {
    // Operation that might fail
    return await ipfsService.upload(blob);
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    jitterFactor: 0.3,
  }
);
```

**Features:**
- Exponential backoff with jitter
- Configurable retry attempts
- Custom retry conditions
- Progress callbacks

### 4. Edge Case Validation (`utils/edgeCaseValidation.ts`)

Validation functions for common edge cases:

```typescript
import {
  isValidPolkadotAddress,
  isValidIPFSCID,
  isValidFutureTimestamp,
  checkBrowserSupport,
} from '@/utils/edgeCaseValidation';

if (!isValidPolkadotAddress(address)) {
  throw new Error('Invalid Polkadot address');
}
```

**Validators:**
- Polkadot address format
- IPFS CID format
- Future timestamps
- Media file types and sizes
- Browser feature support
- Network connectivity
- Data corruption detection
- Message metadata validation

### 5. Error Recovery Component (`components/ui/ErrorRecovery.tsx`)

User-friendly error display with recovery options:

```typescript
import { ErrorRecovery } from '@/components/ui';

<ErrorRecovery
  error={error}
  context="Creating message"
  onRetry={handleRetry}
  onDismiss={handleDismiss}
  showTechnicalDetails={true}
/>
```

**Features:**
- Color-coded severity indicators
- User-friendly error messages
- Actionable recovery suggestions
- Collapsible technical details
- Retry and dismiss buttons

### 6. Network Status Hook (`hooks/useNetworkStatus.ts`)

Monitor network connectivity:

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const { isOnline, isConnecting, lastChecked } = useNetworkStatus();

if (!isOnline) {
  // Show offline message
}
```

**Features:**
- Real-time online/offline detection
- Periodic connectivity checks
- Connection state tracking

## Error Boundaries

Error boundaries are implemented for all major pages:

- `app/error.tsx` - Root error boundary
- `app/create/error.tsx` - Message creation errors
- `app/dashboard/error.tsx` - Dashboard errors
- `app/unlock/[messageId]/error.tsx` - Unlock errors
- `app/claim/[packageCID]/error.tsx` - Claim errors

Each boundary provides:
- Context-specific error messages
- Recovery suggestions
- Retry functionality
- Navigation options

## Service-Level Error Handling

All service classes implement comprehensive error handling:

### CryptoService
- Key generation failures
- Encryption/decryption errors
- Memory cleanup failures

### IPFSService
- Upload failures with retry
- Download failures with retry
- CID verification
- Fallback to Pinata

### ContractService
- RPC connection failures
- Transaction submission errors
- Query failures with retry
- Insufficient funds detection

### UnlockService
- Timestamp verification
- Decryption failures
- Hash verification
- Data integrity checks

## Retry Strategies

### IPFS Operations
- Max 3 attempts
- Exponential backoff: 1s, 2s, 4s
- Jitter: ±30%
- Fallback to Pinata on failure

### Blockchain Operations
- Max 3 attempts per endpoint
- Multiple fallback RPC endpoints
- Exponential backoff: 1s, 2s, 4s
- Helpful error messages with faucet links

### Network Operations
- Automatic retry on transient failures
- Fail fast on non-retryable errors
- Timeout handling
- Offline detection

## Edge Cases Handled

### Wallet
- ✅ Extension not installed
- ✅ Wallet locked
- ✅ Connection rejected
- ✅ Account selection cancelled
- ✅ Transaction signing failed
- ✅ Wrong account selected

### Media
- ✅ Permission denied
- ✅ Unsupported format
- ✅ File too large
- ✅ Recording failed
- ✅ Corrupted file

### Network
- ✅ Offline mode
- ✅ Slow connection
- ✅ Timeout
- ✅ Connection refused
- ✅ DNS errors

### Blockchain
- ✅ Insufficient funds
- ✅ Transaction cancelled
- ✅ RPC unavailable
- ✅ Network congestion
- ✅ Contract not found

### IPFS
- ✅ Upload failure
- ✅ Download failure
- ✅ CID not found
- ✅ Corrupted data
- ✅ Gateway timeout

### Validation
- ✅ Invalid addresses
- ✅ Past timestamps
- ✅ Invalid CIDs
- ✅ Self-send prevention
- ✅ Empty inputs

## Testing

### Unit Tests
- `tests/edge-cases.test.ts` - Edge case validation
- `tests/network-resilience.test.ts` - Network error handling

### Integration Tests
- Error boundary rendering
- Retry logic execution
- Service error handling

### Manual Testing
- See `docs/EDGE_CASE_TESTING.md` for comprehensive checklist

## Best Practices

### 1. Always Use Try-Catch
```typescript
try {
  await riskyOperation();
} catch (error) {
  ErrorLogger.log(error, 'Operation Context');
  throw error; // Re-throw if needed
}
```

### 2. Provide Context
```typescript
ErrorLogger.log(error, 'Message Creation', {
  step: 'encryption',
  fileSize: blob.size,
  recipient: recipientAddress,
});
```

### 3. Use Retry for Transient Failures
```typescript
const result = await withRetry(
  () => ipfsService.upload(blob),
  { maxAttempts: 3 }
);
```

### 4. Validate Early
```typescript
if (!isValidPolkadotAddress(address)) {
  throw new Error('Invalid address');
}
// Proceed with operation
```

### 5. Provide Recovery Options
```typescript
<ErrorRecovery
  error={error}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

## Monitoring Integration

In production, integrate with monitoring services:

```typescript
// lib/monitoring/ErrorLogger.ts
private static sendToMonitoring(entry: ErrorLogEntry): void {
  // Sentry
  Sentry.captureException(entry);
  
  // LogRocket
  LogRocket.captureException(entry);
  
  // Custom endpoint
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}
```

## User Experience

### Error Messages
- Clear, non-technical language
- Specific to the error context
- Actionable suggestions
- Technical details available but hidden

### Recovery Options
- Retry button for retryable errors
- Dismiss button for non-blocking errors
- Navigation to relevant pages
- Help links and documentation

### Visual Feedback
- Color-coded severity (red, yellow, blue)
- Icons for error types
- Progress indicators during retry
- Loading states

## Future Enhancements

1. **Error Analytics**
   - Track error frequency
   - Identify patterns
   - User impact analysis

2. **Predictive Error Prevention**
   - Pre-flight checks
   - Proactive warnings
   - Resource availability checks

3. **Enhanced Recovery**
   - Automatic state recovery
   - Transaction queue for offline mode
   - Background retry

4. **User Feedback**
   - Error reporting form
   - Screenshot capture
   - Session replay

## References

- Design Document: `docs/NETWORK_RESILIENCE.md`
- Testing Guide: `docs/EDGE_CASE_TESTING.md`
- Timeout Architecture: `docs/TIMEOUT_ARCHITECTURE.md`

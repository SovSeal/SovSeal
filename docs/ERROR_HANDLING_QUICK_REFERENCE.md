# Error Handling Quick Reference

Quick reference guide for using the error handling system in Lockdrop.

## Basic Error Handling

### 1. Wrap Operations in Try-Catch

```typescript
import { ErrorLogger } from '@/lib/monitoring/ErrorLogger';

try {
  const result = await someOperation();
  return result;
} catch (error) {
  ErrorLogger.log(error, 'Operation Name', {
    userId: user.id,
    additionalContext: 'value',
  });
  throw error; // Re-throw if needed
}
```

### 2. Use Retry for Network Operations

```typescript
import { withRetry } from '@/utils/retry';

const result = await withRetry(
  async () => {
    return await ipfsService.upload(blob);
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    },
  }
);
```

### 3. Validate Input Early

```typescript
import {
  isValidPolkadotAddress,
  isValidFutureTimestamp,
} from '@/utils/edgeCaseValidation';

if (!isValidPolkadotAddress(recipientAddress)) {
  throw new Error('Invalid recipient address format');
}

if (!isValidFutureTimestamp(unlockTimestamp)) {
  throw new Error('Unlock time must be in the future');
}
```

### 4. Display Errors to Users

```typescript
import { ErrorRecovery } from '@/components/ui';

<ErrorRecovery
  error={error}
  context="Creating message"
  onRetry={handleRetry}
  onDismiss={() => setError(null)}
  showTechnicalDetails={true}
/>
```

## Common Patterns

### Pattern 1: Service Method with Retry

```typescript
async function uploadToIPFS(blob: Blob): Promise<string> {
  return withRetry(
    async () => {
      try {
        const result = await ipfsService.uploadEncryptedBlob(blob);
        return result.cid;
      } catch (error) {
        ErrorLogger.log(error, 'IPFS Upload', {
          blobSize: blob.size,
          blobType: blob.type,
        });
        throw error;
      }
    },
    { maxAttempts: 3 }
  );
}
```

### Pattern 2: Component with Error State

```typescript
'use client';

import { useState } from 'react';
import { ErrorRecovery } from '@/components/ui';

export function MyComponent() {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOperation = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await someOperation();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorRecovery
        error={error}
        onRetry={handleOperation}
        onDismiss={() => setError(null)}
      />
    );
  }

  return (
    <button onClick={handleOperation} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Start Operation'}
    </button>
  );
}
```

### Pattern 3: Validation Before Operation

```typescript
import { validateMessageMetadata } from '@/utils/edgeCaseValidation';

function createMessage(metadata: MessageMetadata) {
  // Validate first
  const validation = validateMessageMetadata(metadata);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Proceed with operation
  return withRetry(
    async () => {
      // ... create message
    },
    { maxAttempts: 3 }
  );
}
```

## Error Categories

| Category | Examples | Retryable |
|----------|----------|-----------|
| `WALLET` | Extension not found, wallet locked | Yes |
| `MEDIA` | Permission denied, unsupported format | Partial |
| `ENCRYPTION` | Key generation failed, decryption error | No |
| `STORAGE` | IPFS upload failed, CID not found | Yes |
| `BLOCKCHAIN` | Transaction failed, RPC unavailable | Yes |
| `UNLOCK` | Timestamp not reached, wrong key | No |
| `NETWORK` | Timeout, connection refused | Yes |
| `VALIDATION` | Invalid address, past timestamp | No |

## Validation Functions

```typescript
// Address validation
isValidPolkadotAddress(address: string): boolean

// CID validation
isValidIPFSCID(cid: string): boolean

// Timestamp validation
isValidFutureTimestamp(timestamp: number): boolean

// Media validation
isValidMediaType(mimeType: string): boolean
isValidFileSize(size: number, maxSize?: number): boolean

// Browser support
checkBrowserSupport(): { supported: boolean; missing: string[] }

// Network connectivity
checkNetworkConnectivity(): Promise<boolean>

// Data integrity
isDataCorrupted(data: ArrayBuffer | Uint8Array): boolean

// Message metadata
validateMessageMetadata(metadata: object): { valid: boolean; errors: string[] }
```

## Retry Configuration

```typescript
interface RetryOptions {
  maxAttempts?: number;        // Default: 3
  initialDelay?: number;        // Default: 1000ms
  maxDelay?: number;            // Default: 30000ms
  backoffMultiplier?: number;   // Default: 2
  jitterFactor?: number;        // Default: 0.3 (±30%)
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}
```

## Error Logger Methods

```typescript
// Log an error
ErrorLogger.log(error, 'Context', { additionalData });

// Get recent logs
const logs = ErrorLogger.getRecentLogs(10);

// Get logs by category
const walletErrors = ErrorLogger.getLogsByCategory(ErrorCategory.WALLET);

// Get statistics
const stats = ErrorLogger.getStatistics();

// Export logs
const json = ErrorLogger.exportLogs();

// Clear logs
ErrorLogger.clearLogs();
```

## Network Status Hook

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, isConnecting, lastChecked } = useNetworkStatus();

  if (!isOnline) {
    return <div>You are offline. Please check your connection.</div>;
  }

  return <div>Connected</div>;
}
```

## Error Classification

```typescript
import { classifyError } from '@/utils/errorHandling';

const errorInfo = classifyError(error);

console.log(errorInfo.category);        // ErrorCategory
console.log(errorInfo.severity);        // ErrorSeverity
console.log(errorInfo.message);         // User-friendly message
console.log(errorInfo.suggestions);     // Array of suggestions
console.log(errorInfo.retryable);       // boolean
console.log(errorInfo.requiresUserAction); // boolean
```

## Testing Edge Cases

See `docs/EDGE_CASE_TESTING.md` for comprehensive testing guide.

### Quick Test Checklist

- [ ] No wallet installed
- [ ] Wallet locked
- [ ] Network disconnection
- [ ] Invalid addresses
- [ ] Past timestamps
- [ ] Unsupported file formats
- [ ] Files too large
- [ ] Insufficient funds
- [ ] Transaction cancelled
- [ ] IPFS upload failure
- [ ] Corrupted data

## Best Practices

1. **Always validate input before operations**
2. **Use retry for network operations**
3. **Log errors with context**
4. **Provide user-friendly error messages**
5. **Offer recovery options**
6. **Test edge cases thoroughly**
7. **Monitor errors in production**

## Common Mistakes to Avoid

❌ **Don't swallow errors silently**
```typescript
try {
  await operation();
} catch (error) {
  // Silent failure - BAD!
}
```

✅ **Do log and handle errors**
```typescript
try {
  await operation();
} catch (error) {
  ErrorLogger.log(error, 'Context');
  setError(error);
}
```

❌ **Don't retry non-retryable errors**
```typescript
// Retrying validation errors - BAD!
await withRetry(() => validateAddress(address));
```

✅ **Do validate first, then retry network operations**
```typescript
validateAddress(address); // Throws if invalid
await withRetry(() => sendTransaction(address));
```

❌ **Don't show technical errors to users**
```typescript
<div>Error: TypeError: Cannot read property 'x' of undefined</div>
```

✅ **Do use ErrorRecovery component**
```typescript
<ErrorRecovery error={error} onRetry={handleRetry} />
```

## Resources

- Full Documentation: `docs/ERROR_HANDLING_IMPLEMENTATION.md`
- Testing Guide: `docs/EDGE_CASE_TESTING.md`
- Network Resilience: `docs/NETWORK_RESILIENCE.md`
- Timeout Architecture: `docs/TIMEOUT_ARCHITECTURE.md`

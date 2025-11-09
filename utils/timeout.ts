/**
 * Timeout Utilities
 * 
 * Provides timeout wrappers for async operations to prevent indefinite hangs
 * when interacting with external services (IPFS, blockchain, wallet extensions).
 */

/**
 * Error thrown when an operation times out
 */
export class TimeoutError extends Error {
  constructor(message: string, public readonly operation: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 * 
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Description of the operation (for error messages)
 * @returns Promise that rejects with TimeoutError if timeout is exceeded
 * 
 * @example
 * ```typescript
 * const result = await withTimeout(
 *   fetch('https://api.example.com/data'),
 *   5000,
 *   'API fetch'
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new TimeoutError(
          `Operation "${operation}" timed out after ${timeoutMs}ms`,
          operation,
          timeoutMs
        )
      );
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Wrap a promise with a timeout and AbortController
 * Useful for fetch requests and other abortable operations
 * 
 * @param promiseFn - Function that takes an AbortSignal and returns a promise
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Description of the operation
 * @returns Promise that rejects with TimeoutError if timeout is exceeded
 * 
 * @example
 * ```typescript
 * const result = await withAbortTimeout(
 *   (signal) => fetch('https://api.example.com/data', { signal }),
 *   5000,
 *   'API fetch'
 * );
 * ```
 */
export async function withAbortTimeout<T>(
  promiseFn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(
        new TimeoutError(
          `Operation "${operation}" timed out after ${timeoutMs}ms`,
          operation,
          timeoutMs
        )
      );
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      promiseFn(controller.signal),
      timeoutPromise,
    ]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Retry a promise with exponential backoff and timeout
 * 
 * @param promiseFn - Function that returns a promise
 * @param options - Retry options
 * @returns Promise that resolves with the result or rejects after all retries
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetch('https://api.example.com/data'),
 *   {
 *     maxAttempts: 3,
 *     timeoutMs: 5000,
 *     initialDelayMs: 1000,
 *     operation: 'API fetch'
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  promiseFn: () => Promise<T>,
  options: {
    maxAttempts: number;
    timeoutMs: number;
    initialDelayMs: number;
    operation: string;
    onRetry?: (attempt: number, error: Error) => void;
  }
): Promise<T> {
  const { maxAttempts, timeoutMs, initialDelayMs, operation, onRetry } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await withTimeout(promiseFn(), timeoutMs, operation);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxAttempts) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        if (onRetry) {
          onRetry(attempt, lastError);
        }
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `Operation "${operation}" failed after ${maxAttempts} attempts. Last error: ${lastError!.message}`
  );
}

/**
 * Sleep for a specified duration
 * 
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Recommended timeout values for different operation types
 */
export const TIMEOUTS = {
  // IPFS operations
  IPFS_UPLOAD_SMALL: 30_000, // 30s for files < 10MB
  IPFS_UPLOAD_LARGE: 60_000, // 60s for files up to 100MB
  IPFS_VERIFICATION: 30_000, // 30s for CID verification
  IPFS_DOWNLOAD: 45_000, // 45s for downloads

  // Blockchain operations
  BLOCKCHAIN_CONNECT: 15_000, // 15s for RPC connection
  BLOCKCHAIN_QUERY: 10_000, // 10s per query
  BLOCKCHAIN_QUERY_BATCH: 60_000, // 60s for batch queries
  BLOCKCHAIN_TX_SUBMIT: 30_000, // 30s for transaction submission
  BLOCKCHAIN_TX_FINALIZE: 120_000, // 2 minutes for finalization

  // Wallet operations
  WALLET_ENABLE: 30_000, // 30s for extension enable
  WALLET_ACCOUNTS: 10_000, // 10s for account fetch
  WALLET_SIGN: 120_000, // 2 minutes for user to sign

  // Crypto operations (should be fast, but add safety)
  CRYPTO_ENCRYPT: 30_000, // 30s for encryption
  CRYPTO_DECRYPT: 30_000, // 30s for decryption
  CRYPTO_HASH: 10_000, // 10s for hashing
} as const;

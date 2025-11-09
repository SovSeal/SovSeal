/**
 * Retry Utilities
 * 
 * Provides retry logic with exponential backoff for handling
 * transient failures in network operations.
 * 
 * Requirements: 12.1 - Add retry mechanisms for network errors
 */

import { isRetryableError } from './errorHandling';

/**
 * Retry options
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitterFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitterFactor: 0.3, // ±30% jitter
  onRetry: () => {},
  shouldRetry: isRetryableError,
};

/**
 * Execute a function with retry logic and exponential backoff
 * 
 * @param fn Function to execute
 * @param options Retry options
 * @returns Promise resolving to function result
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (!opts.shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't delay after last attempt
      if (attempt >= opts.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );
      const jitter = baseDelay * opts.jitterFactor * (Math.random() * 2 - 1);
      const delay = Math.max(0, baseDelay + jitter);

      // Notify retry callback
      opts.onRetry(attempt, lastError);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a retry wrapper for a function
 * 
 * @param fn Function to wrap
 * @param options Retry options
 * @returns Wrapped function with retry logic
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}

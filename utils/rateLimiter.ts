/**
 * Rate Limiter Utility
 *
 * Provides rate limiting for API calls to prevent abuse and RPC endpoint bans.
 * Uses a sliding window algorithm for accurate rate limiting.
 */

export interface RateLimiterOptions {
    /** Maximum number of requests allowed in the time window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
}

/**
 * RateLimiter implements a sliding window rate limiter.
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 });
 *
 * // In your API call
 * await limiter.acquire();
 * const result = await apiCall();
 * ```
 */
export class RateLimiter {
    private maxRequests: number;
    private windowMs: number;
    private timestamps: number[] = [];
    private waitQueue: Array<() => void> = [];

    constructor(options: RateLimiterOptions) {
        this.maxRequests = options.maxRequests;
        this.windowMs = options.windowMs;
    }

    /**
     * Clean up old timestamps outside the current window
     */
    private cleanup(): void {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        this.timestamps = this.timestamps.filter((ts) => ts > windowStart);
    }

    /**
     * Check if a request can be made immediately
     */
    canProceed(): boolean {
        this.cleanup();
        return this.timestamps.length < this.maxRequests;
    }

    /**
     * Get the time until the next available slot
     */
    getWaitTime(): number {
        this.cleanup();
        if (this.timestamps.length < this.maxRequests) {
            return 0;
        }
        // Wait until the oldest timestamp expires
        const oldestTimestamp = this.timestamps[0];
        return oldestTimestamp + this.windowMs - Date.now();
    }

    /**
     * Acquire a slot, waiting if necessary
     * This method blocks until a request slot is available
     */
    async acquire(): Promise<void> {
        // First, try to proceed immediately
        if (this.canProceed()) {
            this.timestamps.push(Date.now());
            return;
        }

        // Wait for a slot to become available
        const waitTime = this.getWaitTime();
        if (waitTime > 0) {
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    this.cleanup();
                    this.timestamps.push(Date.now());
                    resolve();
                }, waitTime);
            });
        } else {
            this.timestamps.push(Date.now());
        }
    }

    /**
     * Try to acquire a slot without waiting
     * Returns true if acquired, false if rate limited
     */
    tryAcquire(): boolean {
        if (this.canProceed()) {
            this.timestamps.push(Date.now());
            return true;
        }
        return false;
    }

    /**
     * Reset the rate limiter state
     */
    reset(): void {
        this.timestamps = [];
    }

    /**
     * Get current rate limiter stats
     */
    getStats(): { requestsInWindow: number; maxRequests: number; windowMs: number } {
        this.cleanup();
        return {
            requestsInWindow: this.timestamps.length,
            maxRequests: this.maxRequests,
            windowMs: this.windowMs,
        };
    }
}

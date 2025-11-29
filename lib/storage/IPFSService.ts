/**
 * IPFS Storage Service (Legacy)
 *
 * Legacy implementation for backward compatibility.
 * New code should use StorachaService instead.
 */

import { withTimeout, TIMEOUTS } from "@/utils/timeout";

/**
 * Result of an IPFS upload operation
 */
export interface IPFSUploadResult {
  cid: string;
  size: number;
  provider: "web3.storage";
}

/**
 * Options for IPFS upload operations
 */
export interface UploadOptions {
  onProgress?: (progress: number) => void;
  chunked?: boolean;
  chunkSize?: number;
}

/**
 * Maximum number of retry attempts for failed uploads
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Initial delay for exponential backoff (milliseconds)
 */
const INITIAL_RETRY_DELAY = 1000;

/**
 * IPFSService provides methods for uploading encrypted blobs to IPFS
 * via Web3.Storage w3up-client with progress tracking and verification.
 *
 * @deprecated Use StorachaService for new implementations
 */
export class IPFSService {
  /**
   * Legacy IPFS service - use StorachaService for new implementations
   * This class is kept for backward compatibility only
   */
  private async getClient(): Promise<any> {
    throw new Error(
      "Legacy IPFSService is deprecated. Please use StorachaService instead."
    );
  }

  /**
   * Sleep for a specified duration (used for retry backoff)
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Determine if an error is retryable
   *
   * Retryable errors:
   * - Network errors (connection refused, timeout, DNS)
   * - Rate limiting (429)
   * - Service unavailable (503)
   * - Gateway timeout (504)
   *
   * Non-retryable errors:
   * - Authentication errors (401, 403)
   * - Bad request (400)
   * - Not found (404)
   * - Payload too large (413)
   * - Other 4xx client errors
   *
   * @param error - The error to check
   * @returns true if error should be retried
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Network-level errors (always retryable)
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnrefused") ||
      message.includes("enotfound") ||
      message.includes("etimedout") ||
      message.includes("connection") ||
      message.includes("fetch failed")
    ) {
      return true;
    }

    // HTTP status codes
    if (message.includes("429") || message.includes("rate limit")) {
      return true; // Rate limiting - retry with backoff
    }

    if (message.includes("503") || message.includes("service unavailable")) {
      return true; // Service temporarily unavailable
    }

    if (message.includes("504") || message.includes("gateway timeout")) {
      return true; // Gateway timeout
    }

    // Non-retryable client errors
    if (
      message.includes("401") ||
      message.includes("unauthorized") ||
      message.includes("403") ||
      message.includes("forbidden") ||
      message.includes("400") ||
      message.includes("bad request") ||
      message.includes("404") ||
      message.includes("not found") ||
      message.includes("413") ||
      message.includes("payload too large")
    ) {
      return false; // Client error - don't retry
    }

    // Default: retry unknown errors (conservative approach)
    return true;
  }

  /**
   * Upload an encrypted blob to Web3.Storage (IPFS)
   *
   * Implements retry logic for transient failures and verifies
   * CID accessibility after upload.
   *
   * Retry Strategy:
   * - Retries transient failures (network errors, timeouts, 429, 503)
   * - Exponential backoff with jitter: 1s, 2s, 4s (±30% jitter)
   * - Fails fast on non-retryable errors (4xx except 429)
   * - Maximum 3 attempts
   *
   * @param blob - The encrypted blob to upload
   * @param filename - Optional filename for the uploaded file
   * @param options - Upload options including progress callback
   * @returns Promise resolving to upload result with CID and provider
   * @throws Error if upload fails
   */
  async uploadEncryptedBlob(
    blob: Blob,
    filename: string = "encrypted-media",
    options: UploadOptions = {}
  ): Promise<IPFSUploadResult> {
    let lastError: Error | null = null;

    // Try Web3.Storage first with retry logic
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff with jitter to prevent thundering herd
          const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 0.3 * baseDelay; // ±30% jitter
          const delay = baseDelay + jitter;
          await this.sleep(delay);
        }

        const result = await this.uploadToWeb3Storage(blob, filename, options);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          console.error(
            "Non-retryable error, failing fast:",
            lastError.message
          );
          throw lastError;
        }

        console.warn(
          `Web3.Storage upload attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS} failed:`,
          lastError.message
        );
      }
    }

    // All attempts failed
    throw new Error(
      `Upload failed after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Upload to Web3.Storage using w3up-client
   *
   * @param blob - The encrypted blob to upload
   * @param filename - Filename for the uploaded file
   * @param options - Upload options
   * @returns Promise resolving to upload result
   * @throws Error if upload fails
   */
  private async uploadToWeb3Storage(
    _blob: Blob,
    _filename: string,
    _options: UploadOptions
  ): Promise<IPFSUploadResult> {
    throw new Error(
      "Legacy Web3.Storage upload is deprecated. Please use StorachaService instead."
    );
  }

  /**
   * Validate CID format
   *
   * @param cid - The IPFS CID to validate
   * @returns true if CID format is valid
   */
  private isValidCID(cid: string): boolean {
    // CIDv0: Qm... (base58, 46 characters)
    // CIDv1: bafy... (base32) or other multibase prefixes
    return (
      /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) ||
      /^b[a-z2-7]{58,}/.test(cid) ||
      /^bafy[a-z2-7]{55,}/.test(cid)
    );
  }

  /**
   * Verify that a CID is accessible on IPFS
   *
   * Attempts to retrieve the CID from Web3.Storage gateway to ensure
   * the content was successfully pinned and is accessible.
   *
   * Retry Strategy:
   * - Retries transient failures (network errors, timeouts, 503)
   * - Exponential backoff with jitter: 1s, 2s, 4s (±30% jitter)
   * - Maximum 3 attempts
   *
   * Requirement 5.6: Verify CID accessibility after upload
   *
   * @param cid - The IPFS CID to verify
   * @throws Error if CID is not accessible
   */
  private async verifyCIDAccessibility(cid: string): Promise<void> {
    // Validate CID format first
    if (!this.isValidCID(cid)) {
      throw new Error(`Invalid CID format: ${cid}`);
    }

    let lastError: Error | null = null;

    // Retry verification with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff with jitter
          const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 0.3 * baseDelay; // ±30% jitter
          const delay = baseDelay + jitter;
          await this.sleep(delay);
        }

        // Use the public gateway to verify the CID is accessible
        const gatewayUrl = this.getGatewayUrl(cid);

        const res = await withTimeout(
          fetch(gatewayUrl, { method: "HEAD" }),
          TIMEOUTS.IPFS_VERIFICATION,
          "IPFS CID verification"
        );

        if (!res.ok) {
          throw new Error(
            `CID ${cid} is not accessible (status: ${res.status})`
          );
        }

        // Success - exit retry loop
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          console.error(
            "Non-retryable verification error, failing fast:",
            lastError.message
          );
          throw new Error(`CID verification failed: ${lastError.message}`);
        }

        console.warn(
          `CID verification attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS} failed:`,
          lastError.message
        );
      }
    }

    // All retries exhausted
    throw new Error(
      `CID verification failed after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Download an encrypted blob from IPFS using its CID
   *
   * Retry Strategy:
   * - Retries transient failures (network errors, timeouts, 429, 503)
   * - Exponential backoff with jitter: 1s, 2s, 4s (±30% jitter)
   * - Fails fast on non-retryable errors (4xx except 429)
   * - Maximum 3 attempts
   *
   * @param cid - The IPFS CID to retrieve
   * @returns Promise resolving to the encrypted blob
   * @throws Error if download fails
   */
  async downloadEncryptedBlob(cid: string): Promise<Blob> {
    // Validate CID format first
    if (!this.isValidCID(cid)) {
      throw new Error(`Invalid CID format: ${cid}`);
    }

    let lastError: Error | null = null;

    // Retry download with exponential backoff
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff with jitter
          const baseDelay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 0.3 * baseDelay; // ±30% jitter
          const delay = baseDelay + jitter;
          await this.sleep(delay);
        }

        const gatewayUrl = this.getGatewayUrl(cid);

        const res = await withTimeout(
          fetch(gatewayUrl),
          TIMEOUTS.IPFS_DOWNLOAD,
          `IPFS download ${cid}`
        );

        if (!res.ok) {
          throw new Error(
            `Failed to retrieve CID ${cid} (status: ${res.status})`
          );
        }

        const blob = await res.blob();
        return blob;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          console.error(
            "Non-retryable download error, failing fast:",
            lastError.message
          );
          throw lastError;
        }

        console.warn(
          `IPFS download attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS} failed:`,
          lastError.message
        );
      }
    }

    // All retries exhausted
    throw new Error(
      `IPFS download failed after ${MAX_RETRY_ATTEMPTS} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Get the IPFS gateway URL for a CID
   *
   * @param cid - The IPFS CID
   * @returns The gateway URL
   */
  getGatewayUrl(cid: string): string {
    return `https://w3s.link/ipfs/${cid}`;
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

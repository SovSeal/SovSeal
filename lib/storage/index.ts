/**
 * Storage module exports
 *
 * Provides IPFS storage services for encrypted blob uploads and downloads.
 * Uses Storacha Network for decentralized storage and Irys for permanent Arweave storage.
 */

import { storachaService } from "./StorachaService";
import { irysService, IrysService } from "./IrysService";

export type { StorachaUploadResult, AuthState } from "./StorachaService";
export type { IrysUploadResult, IrysUploadOptions, IrysToken, IrysConfig } from "./IrysService";

// Export Storacha service for all implementations
export { storachaService };

// Export Irys service for permanent Arweave storage
export { irysService, IrysService };

// Legacy IPFS service is deprecated - use Storacha instead
export const ipfsService = storachaService;

/**
 * Convenience wrapper for uploading and downloading files from IPFS
 * Uses legacy IPFSService for backward compatibility
 */
export const IPFSService = {
  uploadFile: async (blob: Blob, filename?: string) => {
    return ipfsService.uploadEncryptedBlob(blob, filename);
  },
  downloadFile: async (cid: string) => {
    return ipfsService.downloadEncryptedBlob(cid);
  },
  getGatewayUrl: (cid: string) => {
    return ipfsService.getGatewayUrl(cid);
  },
};

/**
 * Storacha Network service wrapper (recommended for new code)
 *
 * Provides email-based authentication and improved performance over legacy Web3.Storage.
 * Storacha uses UCAN delegation for user-controlled authorization without API keys.
 *
 * @example
 * ```typescript
 * // Authenticate with email
 * await StorachaService.login('user@example.com');
 *
 * // Create a space for organizing content
 * const space = await StorachaService.createSpace('my-messages');
 *
 * // Upload encrypted blob
 * const result = await StorachaService.uploadFile(encryptedBlob, 'message.enc');
 * console.log('Uploaded to:', result.cid);
 * ```
 *
 * @see https://docs.storacha.network/js-client/ for authentication details
 */
export const StorachaService = {
  /**
   * Authenticate with Storacha using email-based login
   *
   * Initiates email verification flow. User will receive an email with a verification link.
   *
   * @param email - User's email address for authentication
   * @returns Promise resolving when authentication is initiated
   * @throws Error if email is invalid or authentication fails
   */
  login: async (email: string) => {
    return storachaService.login(email);
  },

  /**
   * Create a new space for organizing content
   *
   * Spaces are DID-based namespaces for content organization.
   *
   * @param name - Optional human-readable name for the space
   * @returns Promise resolving to space details
   * @throws Error if space creation fails or user not authenticated
   */
  createSpace: async (name?: string) => {
    return storachaService.createSpace(name);
  },

  /**
   * Upload an encrypted blob to Storacha Network
   *
   * @param blob - The encrypted blob to upload
   * @param filename - Optional filename for the uploaded content
   * @returns Promise resolving to upload result with CID
   * @throws Error if upload fails or user not authenticated
   */
  uploadFile: async (blob: Blob, filename?: string) => {
    return storachaService.uploadEncryptedBlob(blob, filename);
  },

  /**
   * Download an encrypted blob from Storacha Network
   *
   * @param cid - IPFS Content Identifier of the blob to download
   * @returns Promise resolving to the encrypted blob
   * @throws Error if download fails or CID is invalid
   */
  downloadFile: async (cid: string) => {
    return storachaService.downloadEncryptedBlob(cid);
  },

  /**
   * Get the gateway URL for accessing content via HTTP
   *
   * @param cid - IPFS Content Identifier
   * @returns Gateway URL string (e.g., https://storacha.link/ipfs/...)
   */
  getGatewayUrl: (cid: string) => {
    return storachaService.getGatewayUrl(cid);
  },

  /**
   * Get current authentication state
   *
   * @returns Authentication state object with user details and space info
   */
  getAuthState: () => {
    return storachaService.getAuthState();
  },

  /**
   * Check if service is ready for uploads
   *
   * @returns true if authenticated and space is configured, false otherwise
   */
  isReady: () => {
    return storachaService.isReady();
  },
};

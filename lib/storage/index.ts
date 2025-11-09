/**
 * Storage module exports
 *
 * Provides IPFS storage services for encrypted blob uploads and downloads.
 * In demo mode, uses mock service for testing without real IPFS uploads.
 */

import { ipfsService as realIPFSService } from "./IPFSService";
import { mockIPFSService } from "./MockIPFSService";

export type { IPFSUploadResult, UploadOptions } from "./IPFSService";

// Export the appropriate service based on demo mode
// For now, always use mock service until Web3.Storage authentication is set up
// TODO: Implement proper w3up-client authentication flow
// See: https://web3.storage/docs/w3up-client/
const USE_MOCK = true; // Set to false once w3up authentication is configured

export const ipfsService = USE_MOCK
  ? (mockIPFSService as any)
  : realIPFSService;

/**
 * Convenience wrapper for uploading and downloading files from IPFS
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

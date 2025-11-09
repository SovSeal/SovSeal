/**
 * Mock IPFS Service for Testing
 * 
 * This service simulates IPFS uploads without requiring a real Web3.Storage token.
 * Use this for testing timeout behavior and UI flows.
 */

import { IPFSUploadResult, UploadOptions } from './IPFSService';

export class MockIPFSService {
  /**
   * Simulate an IPFS upload with configurable delay
   */
  async uploadEncryptedBlob(
    blob: Blob,
    filename: string = "encrypted-media",
    options: UploadOptions = {}
  ): Promise<IPFSUploadResult> {
    const { onProgress } = options;
    
    // Simulate upload progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await this.sleep(200); // 200ms per 10%
        onProgress(i);
      }
    } else {
      // Simulate upload time based on file size
      const uploadTime = Math.min(blob.size / 1000000 * 1000, 5000); // 1s per MB, max 5s
      await this.sleep(uploadTime);
    }
    
    // Generate a fake CID
    const fakeCID = `bafybei${this.generateRandomString(52)}`;
    
    return {
      cid: fakeCID,
      size: blob.size,
      provider: "web3.storage"
    };
  }
  
  /**
   * Simulate downloading from IPFS
   */
  async downloadEncryptedBlob(cid: string): Promise<Blob> {
    // Simulate download delay
    await this.sleep(1000);
    
    // Return a dummy blob
    return new Blob(['mock encrypted data'], { type: 'application/octet-stream' });
  }
  
  /**
   * Get gateway URL
   */
  getGatewayUrl(cid: string): string {
    return `https://w3s.link/ipfs/${cid}`;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz234567';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const mockIPFSService = new MockIPFSService();

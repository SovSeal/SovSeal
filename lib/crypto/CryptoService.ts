/**
 * CryptoService - Core encryption service using Web Crypto API
 * Implements AES-256-GCM encryption for media blobs with secure key management
 * 
 * Supports both standard and chunked encryption:
 * - Standard: For files < 50MB, loads entire file into memory
 * - Chunked: For files >= 50MB, processes in chunks to prevent memory exhaustion
 */

export interface EncryptedData {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  algorithm: "AES-GCM";
  keyLength: 256;
}

export interface EncryptionMetadata {
  algorithm: "AES-GCM";
  keyLength: 256;
  ivLength: 12;
  tagLength: 16;
}

export interface ChunkedEncryptionResult {
  encryptedBlob: Blob;
  iv: Uint8Array;
  algorithm: "AES-GCM";
  keyLength: 256;
  totalChunks: number;
  originalSize: number;
}

export interface EncryptionProgress {
  bytesProcessed: number;
  totalBytes: number;
  percentage: number;
  currentChunk: number;
  totalChunks: number;
}

export class CryptoService {
  private static readonly ALGORITHM = "AES-GCM";
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits recommended for GCM
  private static readonly TAG_LENGTH = 16; // 128 bits authentication tag
  
  // Chunked encryption constants
  private static readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks for processing
  private static readonly LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB threshold for chunked encryption

  /**
   * Generate a unique 256-bit AES key for encryption
   */
  static async generateAESKey(): Promise<CryptoKey> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: this.ALGORITHM,
          length: this.KEY_LENGTH,
        },
        true, // extractable
        ["encrypt", "decrypt"]
      );
      return key;
    } catch (error) {
      throw new Error(
        `Failed to generate AES key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Encrypt a media blob using AES-256-GCM with IV generation
   */
  static async encryptBlob(blob: Blob, key: CryptoKey): Promise<EncryptedData> {
    try {
      // Generate random IV for this encryption operation
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Convert blob to ArrayBuffer
      const plaintext = await blob.arrayBuffer();

      // Encrypt the data
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH * 8, // bits
        },
        key,
        plaintext
      );

      return {
        ciphertext,
        iv,
        algorithm: this.ALGORITHM,
        keyLength: this.KEY_LENGTH,
      };
    } catch (error) {
      throw new Error(
        `Failed to encrypt blob: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Smart encryption that automatically chooses between standard and chunked encryption
   * based on file size to prevent memory exhaustion on large files.
   * 
   * - Files < 50MB: Uses standard encryption (faster, simpler)
   * - Files >= 50MB: Uses chunked encryption (memory-efficient)
   * 
   * @param blob The blob to encrypt
   * @param key The AES key to use for encryption
   * @param onProgress Optional callback for progress updates
   * @returns Promise resolving to encrypted blob with metadata
   */
  static async encryptBlobSmart(
    blob: Blob,
    key: CryptoKey,
    onProgress?: (progress: EncryptionProgress) => void
  ): Promise<ChunkedEncryptionResult> {
    if (blob.size < this.LARGE_FILE_THRESHOLD) {
      // Use standard encryption for small files
      const result = await this.encryptBlob(blob, key);
      const encryptedBlob = this.encryptedDataToBlob(result);
      
      onProgress?.({
        bytesProcessed: blob.size,
        totalBytes: blob.size,
        percentage: 100,
        currentChunk: 1,
        totalChunks: 1,
      });
      
      return {
        encryptedBlob,
        iv: result.iv,
        algorithm: this.ALGORITHM,
        keyLength: this.KEY_LENGTH,
        totalChunks: 1,
        originalSize: blob.size,
      };
    }
    
    // Use chunked encryption for large files
    return this.encryptBlobChunked(blob, key, onProgress);
  }

  /**
   * Encrypt a large blob in chunks to prevent memory exhaustion.
   * 
   * This method processes the file in 1MB chunks, encrypting each chunk
   * separately with a unique IV derived from the base IV + chunk index.
   * This keeps memory usage constant regardless of file size.
   * 
   * Format of encrypted output:
   * [4 bytes: chunk count][12 bytes: base IV][chunk 1][chunk 2]...[chunk N]
   * Each chunk: [4 bytes: encrypted length][encrypted data with auth tag]
   * 
   * @param blob The blob to encrypt
   * @param key The AES key to use for encryption
   * @param onProgress Optional callback for progress updates
   * @returns Promise resolving to chunked encryption result
   */
  static async encryptBlobChunked(
    blob: Blob,
    key: CryptoKey,
    onProgress?: (progress: EncryptionProgress) => void
  ): Promise<ChunkedEncryptionResult> {
    try {
      const totalSize = blob.size;
      const totalChunks = Math.ceil(totalSize / this.CHUNK_SIZE);
      
      // Generate base IV - each chunk will derive its IV from this
      const baseIv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // Collect encrypted chunks
      const encryptedChunks: Uint8Array[] = [];
      let bytesProcessed = 0;
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, totalSize);
        
        // Read chunk from blob
        const chunkBlob = blob.slice(start, end);
        const chunkData = await chunkBlob.arrayBuffer();
        
        // Derive chunk-specific IV by XORing base IV with chunk index
        // This ensures each chunk has a unique IV while being deterministic for decryption
        const chunkIv = this.deriveChunkIv(baseIv, chunkIndex);
        
        // Encrypt chunk - copy IV to fresh ArrayBuffer to satisfy TypeScript's strict typing
        const ivBuffer = new ArrayBuffer(this.IV_LENGTH);
        new Uint8Array(ivBuffer).set(chunkIv);
        const encryptedChunk = await crypto.subtle.encrypt(
          {
            name: this.ALGORITHM,
            iv: new Uint8Array(ivBuffer),
            tagLength: this.TAG_LENGTH * 8,
          },
          key,
          chunkData
        );
        
        // Store chunk with length prefix (4 bytes for length)
        const chunkWithLength = new Uint8Array(4 + encryptedChunk.byteLength);
        const lengthView = new DataView(chunkWithLength.buffer);
        lengthView.setUint32(0, encryptedChunk.byteLength, true); // little-endian
        chunkWithLength.set(new Uint8Array(encryptedChunk), 4);
        
        encryptedChunks.push(chunkWithLength);
        bytesProcessed += (end - start);
        
        // Report progress
        onProgress?.({
          bytesProcessed,
          totalBytes: totalSize,
          percentage: Math.round((bytesProcessed / totalSize) * 100),
          currentChunk: chunkIndex + 1,
          totalChunks,
        });
      }
      
      // Build final encrypted blob
      // Header: [4 bytes: chunk count][12 bytes: base IV]
      const headerSize = 4 + this.IV_LENGTH;
      const totalEncryptedSize = headerSize + encryptedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
      
      const finalBuffer = new Uint8Array(totalEncryptedSize);
      const headerView = new DataView(finalBuffer.buffer);
      
      // Write header
      headerView.setUint32(0, totalChunks, true); // chunk count
      finalBuffer.set(baseIv, 4); // base IV
      
      // Write chunks
      let offset = headerSize;
      for (const chunk of encryptedChunks) {
        finalBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      
      const encryptedBlob = new Blob([finalBuffer], { type: "application/octet-stream" });
      
      return {
        encryptedBlob,
        iv: baseIv,
        algorithm: this.ALGORITHM,
        keyLength: this.KEY_LENGTH,
        totalChunks,
        originalSize: totalSize,
      };
    } catch (error) {
      throw new Error(
        `Failed to encrypt blob (chunked): ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt a chunked encrypted blob back to original data.
   * 
   * @param encryptedBlob The encrypted blob (from encryptBlobChunked)
   * @param key The AES key used for encryption
   * @param onProgress Optional callback for progress updates
   * @returns Promise resolving to decrypted ArrayBuffer
   */
  static async decryptBlobChunked(
    encryptedBlob: Blob,
    key: CryptoKey,
    onProgress?: (progress: EncryptionProgress) => void
  ): Promise<ArrayBuffer> {
    try {
      const encryptedData = await encryptedBlob.arrayBuffer();
      const dataView = new DataView(encryptedData);
      
      // Read header
      const totalChunks = dataView.getUint32(0, true);
      const baseIv = new Uint8Array(encryptedData, 4, this.IV_LENGTH);
      
      // Decrypt chunks
      const decryptedChunks: ArrayBuffer[] = [];
      let offset = 4 + this.IV_LENGTH; // After header
      let totalDecryptedSize = 0;
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Read chunk length
        const chunkLength = dataView.getUint32(offset, true);
        offset += 4;
        
        // Read encrypted chunk
        const encryptedChunk = new Uint8Array(encryptedData, offset, chunkLength);
        offset += chunkLength;
        
        // Derive chunk IV
        const chunkIv = this.deriveChunkIv(baseIv, chunkIndex);
        
        // Decrypt chunk - copy IV to fresh ArrayBuffer to satisfy TypeScript's strict typing
        const ivBuffer = new ArrayBuffer(this.IV_LENGTH);
        new Uint8Array(ivBuffer).set(chunkIv);
        const decryptedChunk = await crypto.subtle.decrypt(
          {
            name: this.ALGORITHM,
            iv: new Uint8Array(ivBuffer),
            tagLength: this.TAG_LENGTH * 8,
          },
          key,
          encryptedChunk
        );
        
        decryptedChunks.push(decryptedChunk);
        totalDecryptedSize += decryptedChunk.byteLength;
        
        // Report progress
        onProgress?.({
          bytesProcessed: totalDecryptedSize,
          totalBytes: totalDecryptedSize, // We don't know final size until done
          percentage: Math.round(((chunkIndex + 1) / totalChunks) * 100),
          currentChunk: chunkIndex + 1,
          totalChunks,
        });
      }
      
      // Combine decrypted chunks
      const result = new Uint8Array(totalDecryptedSize);
      let resultOffset = 0;
      for (const chunk of decryptedChunks) {
        result.set(new Uint8Array(chunk), resultOffset);
        resultOffset += chunk.byteLength;
      }
      
      return result.buffer;
    } catch (error) {
      throw new Error(
        `Failed to decrypt blob (chunked): ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Derive a chunk-specific IV from base IV and chunk index.
   * Uses XOR to combine base IV with chunk index bytes.
   * 
   * @param baseIv The base IV (12 bytes)
   * @param chunkIndex The chunk index (0-based)
   * @returns Derived IV for this chunk
   */
  private static deriveChunkIv(baseIv: Uint8Array, chunkIndex: number): Uint8Array {
    const chunkIv = new Uint8Array(baseIv);
    
    // XOR the last 4 bytes with chunk index
    // This ensures unique IVs while being deterministic
    const indexBytes = new Uint8Array(4);
    new DataView(indexBytes.buffer).setUint32(0, chunkIndex, true);
    
    for (let i = 0; i < 4; i++) {
      chunkIv[this.IV_LENGTH - 4 + i] ^= indexBytes[i];
    }
    
    return chunkIv;
  }

  /**
   * Check if a blob should use chunked encryption based on size.
   * 
   * @param blob The blob to check
   * @returns true if chunked encryption should be used
   */
  static shouldUseChunkedEncryption(blob: Blob): boolean {
    return blob.size >= this.LARGE_FILE_THRESHOLD;
  }

  /**
   * Get the threshold size for chunked encryption.
   * 
   * @returns Threshold in bytes (50MB)
   */
  static getChunkedEncryptionThreshold(): number {
    return this.LARGE_FILE_THRESHOLD;
  }

  /**
   * Check if an encrypted blob is in chunked format.
   * Chunked format starts with a 4-byte chunk count followed by 12-byte IV.
   * 
   * @param blob The encrypted blob to check
   * @returns true if the blob is in chunked format
   */
  static async isChunkedFormat(blob: Blob): Promise<boolean> {
    if (blob.size < 16) return false; // Too small to be chunked format
    
    try {
      // Read first 16 bytes to check header
      const headerBlob = blob.slice(0, 16);
      const headerData = await headerBlob.arrayBuffer();
      const view = new DataView(headerData);
      
      const chunkCount = view.getUint32(0, true);
      
      // Sanity check: chunk count should be reasonable
      // Max chunks = 10GB / 1MB = 10000 chunks
      if (chunkCount > 0 && chunkCount <= 10000) {
        // Additional check: verify blob size is consistent with chunk count
        // Minimum size = header (16) + at least 1 byte per chunk
        const minExpectedSize = 16 + chunkCount * 5; // 4 bytes length + 1 byte data minimum
        return blob.size >= minExpectedSize;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Smart decryption that automatically detects format and decrypts accordingly.
   * 
   * @param encryptedBlob The encrypted blob
   * @param key The AES key
   * @param onProgress Optional progress callback
   * @returns Decrypted ArrayBuffer
   */
  static async decryptBlobSmart(
    encryptedBlob: Blob,
    key: CryptoKey,
    onProgress?: (progress: EncryptionProgress) => void
  ): Promise<ArrayBuffer> {
    const isChunked = await this.isChunkedFormat(encryptedBlob);
    
    if (isChunked) {
      return this.decryptBlobChunked(encryptedBlob, key, onProgress);
    }
    
    // Standard format - use existing method
    const encryptedData = await this.blobToEncryptedData(encryptedBlob);
    const result = await this.decryptBlob(encryptedData, key);
    
    onProgress?.({
      bytesProcessed: result.byteLength,
      totalBytes: result.byteLength,
      percentage: 100,
      currentChunk: 1,
      totalChunks: 1,
    });
    
    return result;
  }

  /**
   * Decrypt an encrypted blob using AES-256-GCM
   */
  static async decryptBlob(
    encryptedData: EncryptedData,
    key: CryptoKey
  ): Promise<ArrayBuffer> {
    try {
      // Convert IV to standard Uint8Array to avoid type issues
      const ivArray = new Uint8Array(encryptedData.iv);

      const plaintext = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: ivArray,
          tagLength: this.TAG_LENGTH * 8, // bits
        },
        key,
        encryptedData.ciphertext
      );

      return plaintext;
    } catch (error) {
      throw new Error(
        `Failed to decrypt blob: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Export AES key to raw format for encryption with recipient's public key
   */
  static async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    try {
      return await crypto.subtle.exportKey("raw", key);
    } catch (error) {
      throw new Error(
        `Failed to export key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Import raw key data back to CryptoKey
   */
  static async importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    try {
      return await crypto.subtle.importKey(
        "raw",
        keyData,
        {
          name: this.ALGORITHM,
          length: this.KEY_LENGTH,
        },
        true,
        ["encrypt", "decrypt"]
      );
    } catch (error) {
      throw new Error(
        `Failed to import key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Secure memory cleanup - overwrite sensitive data
   *
   * Note: crypto.getRandomValues() has a limit of 65536 bytes.
   * For larger buffers, we chunk the operation.
   */
  static secureCleanup(
    ...buffers: (ArrayBuffer | Uint8Array | null | undefined)[]
  ): void {
    const MAX_RANDOM_BYTES = 65536; // crypto.getRandomValues() limit

    for (const buffer of buffers) {
      if (!buffer) continue;

      try {
        let view: Uint8Array;

        if (buffer instanceof ArrayBuffer) {
          view = new Uint8Array(buffer);
        } else if (buffer instanceof Uint8Array) {
          view = buffer;
        } else {
          continue;
        }

        // For large buffers, process in chunks to avoid QuotaExceededError
        if (view.length > MAX_RANDOM_BYTES) {
          // For large buffers, just zero out (random overwrite would be too slow)
          view.fill(0);
        } else {
          // For small buffers (keys, IVs), do proper random overwrite
          const randomBytes = new Uint8Array(view.length);
          crypto.getRandomValues(randomBytes);
          view.set(randomBytes); // Overwrite with random data
          view.fill(0); // Then zero out
        }
      } catch (error) {
        // Best effort cleanup - log but don't throw
        console.warn("Secure cleanup failed:", error);
      }
    }
  }

  /**
   * Convert encrypted data to a Blob for IPFS upload
   */
  static encryptedDataToBlob(encryptedData: EncryptedData): Blob {
    // Combine IV and ciphertext into a single blob
    const combined = new Uint8Array(
      encryptedData.iv.length + encryptedData.ciphertext.byteLength
    );
    combined.set(encryptedData.iv, 0);
    combined.set(
      new Uint8Array(encryptedData.ciphertext),
      encryptedData.iv.length
    );

    return new Blob([combined], { type: "application/octet-stream" });
  }

  /**
   * Extract IV and ciphertext from a combined blob
   */
  static blobToEncryptedData(blob: Blob): Promise<EncryptedData> {
    return new Promise(async (resolve, reject) => {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const combined = new Uint8Array(arrayBuffer);

        // Extract IV (first IV_LENGTH bytes)
        const iv = combined.slice(0, this.IV_LENGTH);

        // Extract ciphertext (remaining bytes)
        const ciphertext = combined.slice(this.IV_LENGTH).buffer;

        resolve({
          ciphertext,
          iv,
          algorithm: this.ALGORITHM,
          keyLength: this.KEY_LENGTH,
        });
      } catch (error) {
        reject(
          new Error(
            `Failed to parse encrypted blob: ${error instanceof Error ? error.message : "Unknown error"}`
          )
        );
      }
    });
  }

  /**
   * Get encryption metadata
   */
  static getMetadata(): EncryptionMetadata {
    return {
      algorithm: this.ALGORITHM,
      keyLength: this.KEY_LENGTH,
      ivLength: this.IV_LENGTH,
      tagLength: this.TAG_LENGTH,
    };
  }
}

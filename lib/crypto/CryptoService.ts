/**
 * CryptoService - Core encryption service using Web Crypto API
 * Implements AES-256-GCM encryption for media blobs with secure key management
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

export class CryptoService {
  private static readonly ALGORITHM = "AES-GCM";
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits recommended for GCM
  private static readonly TAG_LENGTH = 16; // 128 bits authentication tag

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

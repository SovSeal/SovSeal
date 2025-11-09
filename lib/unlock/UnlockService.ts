/**
 * UnlockService - Handles timestamp verification and message decryption
 *
 * Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 10.1
 */

"use client";

import { Message } from "@/types/contract";
import { ipfsService } from "@/lib/storage";
import { CryptoService } from "@/lib/crypto/CryptoService";
import { AsymmetricCrypto, EncryptedKey } from "@/lib/crypto/AsymmetricCrypto";

/**
 * Result of a successful unlock operation
 */
export interface UnlockResult {
  mediaBlob: Blob;
  mimeType: string;
  objectUrl: string;
}

/**
 * Options for unlock operation
 */
export interface UnlockOptions {
  onProgress?: (stage: string, progress: number) => void;
  demoMode?: boolean;
}

/**
 * UnlockService provides methods for unlocking and decrypting time-locked messages
 */
export class UnlockService {
  /**
   * Verify that the current time is at or after the unlock timestamp
   *
   * Requirements: 9.1, 9.2
   *
   * @param unlockTimestamp - The timestamp when the message becomes unlockable
   * @param demoMode - If true, bypass timestamp verification
   * @returns true if unlockable, false otherwise
   * @throws Error if timestamp not reached and not in demo mode
   */
  static verifyTimestamp(
    unlockTimestamp: number,
    demoMode: boolean = false
  ): boolean {
    // Check for demo mode
    if (demoMode) {
      console.warn("DEMO MODE: Bypassing timestamp verification");
      return true;
    }

    const currentTime = Date.now();

    if (currentTime < unlockTimestamp) {
      const timeRemaining = unlockTimestamp - currentTime;
      const minutesRemaining = Math.ceil(timeRemaining / 1000 / 60);

      throw new Error(
        `Message is still locked. Please wait ${minutesRemaining} more minute(s) before unlocking.`
      );
    }

    return true;
  }

  /**
   * Unlock and decrypt a time-locked message
   *
   * This method performs the complete unlock flow:
   * 1. Verify timestamp has passed
   * 2. Download encrypted AES key from IPFS
   * 3. Decrypt AES key using Talisman wallet
   * 4. Download encrypted media blob from IPFS
   * 5. Verify SHA-256 hash matches messageHash
   * 6. Decrypt media blob using recovered AES key
   * 7. Create object URL for playback
   *
   * Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 10.1
   *
   * @param message - The message to unlock
   * @param options - Unlock options including progress callback and demo mode
   * @returns Promise resolving to unlock result with media blob and object URL
   * @throws Error if unlock fails at any stage
   */
  static async unlockMessage(
    message: Message,
    options: UnlockOptions = {}
  ): Promise<UnlockResult> {
    const { onProgress, demoMode = false } = options;

    try {
      // Stage 1: Verify timestamp
      onProgress?.("Verifying unlock time", 10);
      this.verifyTimestamp(message.unlockTimestamp, demoMode);

      // Stage 2: Download encrypted AES key from IPFS
      onProgress?.("Downloading encryption key", 20);
      const encryptedKeyBlob = await ipfsService.downloadEncryptedBlob(
        message.encryptedKeyCID
      );

      // Parse the encrypted key data
      const encryptedKeyText = await encryptedKeyBlob.text();
      const encryptedKey: EncryptedKey = JSON.parse(encryptedKeyText);

      // Stage 3: Decrypt AES key using Talisman wallet
      onProgress?.("Decrypting encryption key", 40);
      const aesKeyData = await AsymmetricCrypto.decryptAESKeyWithTalisman(
        encryptedKey
      );

      // Import the AES key
      const aesKey = await CryptoService.importKey(aesKeyData);

      // Stage 4: Download encrypted media blob from IPFS
      onProgress?.("Downloading encrypted media", 60);
      const encryptedMediaBlob = await ipfsService.downloadEncryptedBlob(
        message.encryptedMessageCID
      );

      // Stage 5: Verify SHA-256 hash matches messageHash
      onProgress?.("Verifying data integrity", 70);
      const isValid = await AsymmetricCrypto.verifyHash(
        encryptedMediaBlob,
        message.messageHash
      );

      if (!isValid) {
        throw new Error(
          "Data integrity check failed. The encrypted media may be corrupted or tampered with."
        );
      }

      // Stage 6: Decrypt media blob
      onProgress?.("Decrypting media", 80);
      const encryptedData = await CryptoService.blobToEncryptedData(
        encryptedMediaBlob
      );
      const decryptedArrayBuffer = await CryptoService.decryptBlob(
        encryptedData,
        aesKey
      );

      // Determine MIME type
      const mimeType = message.metadata?.mimeType || "application/octet-stream";

      // Create blob from decrypted data
      const mediaBlob = new Blob([decryptedArrayBuffer], { type: mimeType });

      // Stage 7: Create object URL for playback
      onProgress?.("Preparing media player", 90);
      const objectUrl = URL.createObjectURL(mediaBlob);

      // Cleanup sensitive data from memory
      CryptoService.secureCleanup(aesKeyData, encryptedData.ciphertext);

      onProgress?.("Complete", 100);

      return {
        mediaBlob,
        mimeType,
        objectUrl,
      };
    } catch (error) {
      // Ensure we provide helpful error messages
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to unlock message: Unknown error");
    }
  }

  /**
   * Mark a message as unlocked in localStorage
   *
   * Requirements: 8.5
   *
   * @param messageId - The ID of the message to mark as unlocked
   */
  static markAsUnlocked(messageId: string): void {
    try {
      const unlockedMessages = this.getUnlockedMessages();
      if (!unlockedMessages.includes(messageId)) {
        unlockedMessages.push(messageId);
        localStorage.setItem(
          "futureproof_unlocked_messages",
          JSON.stringify(unlockedMessages)
        );
      }
    } catch (error) {
      console.error("Failed to mark message as unlocked:", error);
    }
  }

  /**
   * Check if a message has been unlocked
   *
   * @param messageId - The ID of the message to check
   * @returns true if message has been unlocked, false otherwise
   */
  static isMessageUnlocked(messageId: string): boolean {
    try {
      const unlockedMessages = this.getUnlockedMessages();
      return unlockedMessages.includes(messageId);
    } catch (error) {
      console.error("Failed to check unlock status:", error);
      return false;
    }
  }

  /**
   * Get list of unlocked message IDs from localStorage
   *
   * @returns Array of unlocked message IDs
   */
  static getUnlockedMessages(): string[] {
    try {
      const stored = localStorage.getItem("futureproof_unlocked_messages");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to get unlocked messages:", error);
      return [];
    }
  }

  /**
   * Clear all unlocked message records
   */
  static clearUnlockedMessages(): void {
    try {
      localStorage.removeItem("futureproof_unlocked_messages");
    } catch (error) {
      console.error("Failed to clear unlocked messages:", error);
    }
  }

  /**
   * Check if demo mode is enabled via environment variable
   *
   * Requirements: 9.3
   *
   * @returns true if demo mode is enabled
   */
  static isDemoModeEnabled(): boolean {
    return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  }
}

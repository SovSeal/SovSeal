/**
 * MessageCreationService - Orchestrates end-to-end message creation
 *
 * Handles the complete flow of creating a time-locked message:
 * 1. Generate AES key and encrypt media blob
 * 2. Calculate SHA-256 hash of encrypted blob
 * 3. Retrieve recipient's public key
 * 4. Encrypt AES key with recipient's public key
 * 5. Upload encrypted AES key to IPFS
 * 6. Upload encrypted media blob to IPFS
 * 7. Submit transaction to smart contract
 * 8. Clear sensitive data from memory
 */

import { CryptoService } from "@/lib/crypto/CryptoService";
import { AsymmetricCrypto } from "@/lib/crypto/AsymmetricCrypto";
import { ipfsService } from "@/lib/storage";
import { ContractService } from "@/lib/contract/ContractService";
import type { MediaFile } from "@/types/media";
import type { WalletAccount } from "@/types/wallet";

export interface MessageCreationParams {
  mediaFile: MediaFile;
  recipientAddress: string;
  unlockTimestamp: number;
  senderAccount: WalletAccount;
}

export interface MessageCreationProgress {
  stage:
    | "encrypting"
    | "hashing"
    | "key-encryption"
    | "uploading-key"
    | "uploading-media"
    | "submitting"
    | "complete";
  progress: number;
  message: string;
}

export interface MessageCreationResult {
  success: boolean;
  messageId?: string;
  encryptedKeyCID?: string;
  encryptedMessageCID?: string;
  messageHash?: string;
  blockHash?: string;
  error?: string;
}

export class MessageCreationService {
  /**
   * Create a time-locked message with full encryption and blockchain anchoring
   *
   * @param params Message creation parameters
   * @param onProgress Optional callback for progress updates
   * @returns Promise resolving to creation result
   */
  static async createMessage(
    params: MessageCreationParams,
    onProgress?: (progress: MessageCreationProgress) => void
  ): Promise<MessageCreationResult> {
    let aesKey: CryptoKey | null = null;
    let aesKeyData: ArrayBuffer | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let encryptedData: any = null;

    try {
      // Stage 1: Generate AES key and encrypt media blob
      onProgress?.({
        stage: "encrypting",
        progress: 10,
        message: "Encrypting your message...",
      });

      aesKey = await CryptoService.generateAESKey();
      encryptedData = await CryptoService.encryptBlob(
        params.mediaFile.blob,
        aesKey
      );

      // Convert encrypted data to blob for upload
      const encryptedBlob = CryptoService.encryptedDataToBlob(encryptedData);

      // Stage 2: Calculate SHA-256 hash of encrypted blob
      onProgress?.({
        stage: "hashing",
        progress: 25,
        message: "Generating integrity hash...",
      });

      const messageHash = await AsymmetricCrypto.generateHash(encryptedBlob);

      // Stage 3: Retrieve recipient's public key
      onProgress?.({
        stage: "key-encryption",
        progress: 35,
        message: "Encrypting message key for recipient...",
      });

      const recipientPublicKey =
        await AsymmetricCrypto.getPublicKeyFromTalisman(
          params.recipientAddress
        );

      // Stage 4: Encrypt AES key with recipient's public key
      aesKeyData = await CryptoService.exportKey(aesKey);
      const encryptedKey = await AsymmetricCrypto.encryptAESKey(
        aesKeyData,
        recipientPublicKey
      );

      // Convert encrypted key to blob for IPFS upload
      // Include metadata (mime type, file name, size) with the encrypted key
      const keyWithMetadata = {
        encryptedKey,
        metadata: {
          mimeType: params.mediaFile.type,
          fileName: params.mediaFile.name,
          fileSize: params.mediaFile.size,
        },
      };

      const encryptedKeyBlob = new Blob([JSON.stringify(keyWithMetadata)], {
        type: "application/json",
      });

      // Stage 5: Upload encrypted AES key to IPFS
      onProgress?.({
        stage: "uploading-key",
        progress: 50,
        message: "Uploading encrypted key to IPFS...",
      });

      const keyUploadResult = await ipfsService.uploadEncryptedBlob(
        encryptedKeyBlob,
        `key-${Date.now()}.json`
      );

      // Stage 6: Upload encrypted media blob to IPFS
      onProgress?.({
        stage: "uploading-media",
        progress: 60,
        message: "Uploading encrypted message to IPFS...",
      });

      const mediaUploadResult = await ipfsService.uploadEncryptedBlob(
        encryptedBlob,
        `message-${Date.now()}.enc`,
        {
          onProgress: (uploadProgress: number) => {
            // Map upload progress to overall progress (60-85%)
            const overallProgress = 60 + uploadProgress * 0.25;
            onProgress?.({
              stage: "uploading-media",
              progress: overallProgress,
              message: `Uploading encrypted message to IPFS... ${uploadProgress}%`,
            });
          },
        }
      );

      // Stage 7: Submit transaction to smart contract
      onProgress?.({
        stage: "submitting",
        progress: 90,
        message: "Submitting to blockchain...",
      });

      const transactionResult = await ContractService.storeMessage(
        {
          encryptedKeyCID: keyUploadResult.cid,
          encryptedMessageCID: mediaUploadResult.cid,
          messageHash,
          unlockTimestamp: params.unlockTimestamp,
          recipient: params.recipientAddress,
        },
        params.senderAccount.address
      );

      // Stage 8: Complete
      onProgress?.({
        stage: "complete",
        progress: 100,
        message: "Message created successfully!",
      });

      return {
        success: true,
        messageId: transactionResult.messageId,
        encryptedKeyCID: keyUploadResult.cid,
        encryptedMessageCID: mediaUploadResult.cid,
        messageHash,
        blockHash: transactionResult.blockHash,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Stage 9: Clear sensitive data from memory
      if (aesKeyData) {
        CryptoService.secureCleanup(aesKeyData);
      }
      if (encryptedData) {
        CryptoService.secureCleanup(encryptedData.ciphertext, encryptedData.iv);
      }
    }
  }

  /**
   * Validate message creation parameters
   *
   * @param params Parameters to validate
   * @returns Validation result with error message if invalid
   */
  static validateParams(params: MessageCreationParams): {
    valid: boolean;
    error?: string;
  } {
    // Validate media file
    if (!params.mediaFile || !params.mediaFile.blob) {
      return { valid: false, error: "Media file is required" };
    }

    // Validate recipient address
    if (
      !params.recipientAddress ||
      params.recipientAddress.trim().length === 0
    ) {
      return { valid: false, error: "Recipient address is required" };
    }

    // Basic Polkadot address validation
    const polkadotAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{47,48}$/;
    if (!polkadotAddressRegex.test(params.recipientAddress.trim())) {
      return { valid: false, error: "Invalid Polkadot address format" };
    }

    // Validate unlock timestamp
    if (!params.unlockTimestamp || params.unlockTimestamp <= Date.now()) {
      return { valid: false, error: "Unlock timestamp must be in the future" };
    }

    // Validate sender account
    if (!params.senderAccount || !params.senderAccount.address) {
      return { valid: false, error: "Sender account is required" };
    }

    // Check sender is not recipient
    if (params.senderAccount.address === params.recipientAddress) {
      return { valid: false, error: "Cannot send message to yourself" };
    }

    return { valid: true };
  }
}

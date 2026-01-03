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
import { storachaService as ipfsService } from "@/lib/storage/StorachaService";
import { ContractService } from "@/lib/contract/ContractService";
import { isValidEthereumAddress } from "@/utils/edgeCaseValidation";
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

      // Stage 5 & 6: Upload encrypted key and media to IPFS in parallel
      // This is a major performance optimization - uploads are independent
      onProgress?.({
        stage: "uploading-key",
        progress: 50,
        message: "Uploading encrypted content to IPFS...",
      });

      const timestamp = Date.now();
      const [keyUploadResult, mediaUploadResult] = await Promise.all([
        // Upload encrypted key (small, fast)
        ipfsService.uploadEncryptedBlob(
          encryptedKeyBlob,
          `key-${timestamp}.json`
        ),
        // Upload encrypted media (larger, with progress tracking)
        ipfsService.uploadEncryptedBlob(
          encryptedBlob,
          `message-${timestamp}.enc`,
          {
            onProgress: (uploadProgress: number) => {
              // Map upload progress to overall progress (50-85%)
              const overallProgress = 50 + uploadProgress * 0.35;
              onProgress?.({
                stage: "uploading-media",
                progress: overallProgress,
                message: `Uploading encrypted content to IPFS... ${uploadProgress}%`,
              });
            },
          }
        ),
      ]);

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

    // Validate recipient address - must be Ethereum format (0x...)
    if (
      !params.recipientAddress ||
      params.recipientAddress.trim().length === 0
    ) {
      return { valid: false, error: "Recipient address is required" };
    }

    // Ethereum address validation (0x followed by 40 hex characters)
    if (!isValidEthereumAddress(params.recipientAddress.trim())) {
      return {
        valid: false,
        error: "Invalid Ethereum address format (must start with 0x followed by 40 hex characters)"
      };
    }

    // Validate unlock timestamp
    if (!params.unlockTimestamp || params.unlockTimestamp <= Date.now()) {
      return { valid: false, error: "Unlock timestamp must be in the future" };
    }

    // Validate sender account
    if (!params.senderAccount || !params.senderAccount.address) {
      return { valid: false, error: "Sender account is required" };
    }

    // Validate sender address format
    if (!isValidEthereumAddress(params.senderAccount.address)) {
      return {
        valid: false,
        error: "Invalid sender address format (must be Ethereum format: 0x...)"
      };
    }

    // Check sender is not recipient (case-insensitive comparison for Ethereum addresses)
    if (params.senderAccount.address.toLowerCase() === params.recipientAddress.toLowerCase()) {
      return { valid: false, error: "Cannot send message to yourself" };
    }

    return { valid: true };
  }
}

/**
 * Type definitions for recipient-without-wallet redeem package flow
 * Requirements: 6.6
 */

/**
 * Redeem package containing encrypted AES key and message metadata
 * for recipients without a wallet
 */
export interface RedeemPackage {
  /** CID of the encrypted AES key on IPFS */
  encryptedKeyCID: string;
  /** CID of the encrypted message blob on IPFS */
  encryptedMessageCID: string;
  /** SHA-256 hash of the encrypted message blob for verification */
  messageHash: string;
  /** Unix timestamp when the message can be unlocked */
  unlockTimestamp: number;
  /** Instructions for the recipient on how to claim the message */
  instructions: string;
  /** Expiration timestamp for the redeem package (optional) */
  expiresAt?: number;
  /** Sender's wallet address */
  sender: string;
}

/**
 * Encrypted redeem package ready for IPFS upload
 */
export interface EncryptedRedeemPackage {
  /** Encrypted package data */
  encryptedData: ArrayBuffer;
  /** Initialization vector used for encryption */
  iv: Uint8Array;
  /** Salt used for passphrase-based key derivation */
  salt: Uint8Array;
}

/**
 * Claim link for recipients to access their message
 */
export interface ClaimLink {
  /** Full URL to the claim page */
  url: string;
  /** CID of the encrypted redeem package on IPFS */
  packageCID: string;
  /** Expiration timestamp (optional) */
  expiresAt?: number;
}

/**
 * Decrypted redeem package after recipient enters passphrase
 */
export interface DecryptedRedeemPackage extends RedeemPackage {
  /** Indicates the package was successfully decrypted */
  decrypted: true;
}

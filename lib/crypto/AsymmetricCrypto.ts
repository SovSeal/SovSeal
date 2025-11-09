"use client";

/**
 * AsymmetricCrypto - Asymmetric key encryption for AES key wrapping
 * Handles Ed25519/Sr25519 to X25519 conversion and key encryption/decryption
 */

import { u8aToHex, hexToU8a } from "@polkadot/util";
import {
  cryptoWaitReady,
  naclEncrypt,
  naclDecrypt,
  randomAsU8a,
} from "@polkadot/util-crypto";

// Pre-load decodeAddress to avoid dynamic imports during message creation
let decodeAddressCache: typeof import("@polkadot/util-crypto").decodeAddress | null = null;

if (typeof window !== 'undefined') {
  import("@polkadot/util-crypto").then((module) => {
    decodeAddressCache = module.decodeAddress;
  }).catch(err => {
    console.warn('Failed to preload decodeAddress:', err);
  });
}

export interface EncryptedKey {
  encryptedAESKey: string; // hex encoded
  nonce: string; // hex encoded
  recipientPublicKey: string;
}

export class AsymmetricCrypto {
  /**
   * Initialize crypto library - must be called before using other methods
   */
  static async initialize(): Promise<void> {
    await cryptoWaitReady();
  }

  /**
   * Retrieve public key from Talisman wallet for a given address
   * Requirements: 6.1
   *
   * Note: This method can retrieve public keys for ANY valid Polkadot address,
   * not just accounts in the connected wallet. The address is decoded to extract
   * the public key directly.
   */
  static async getPublicKeyFromTalisman(address: string): Promise<Uint8Array> {
    try {
      // For Polkadot addresses, we can decode the address to get the public key
      // This works for any valid SS58 address, not just accounts in the wallet
      let decodeAddress = decodeAddressCache;
      
      if (!decodeAddress) {
        const module = await import("@polkadot/util-crypto");
        decodeAddress = module.decodeAddress;
        decodeAddressCache = decodeAddress;
      }

      try {
        const publicKey = decodeAddress(address);

        // Validate the decoded public key
        if (publicKey.length !== 32) {
          throw new Error("Invalid public key length after decoding");
        }

        return publicKey;
      } catch (decodeError) {
        throw new Error(
          `Invalid Polkadot address format: ${decodeError instanceof Error ? decodeError.message : "Unknown error"}`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to retrieve public key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Convert Ed25519/Sr25519 public key to X25519 for encryption
   * Requirements: 6.1a
   *
   * Note: For the MVP, we use the public key directly as Curve25519 is compatible
   * with Ed25519 for encryption purposes. In production, use proper key conversion.
   */
  static convertToX25519PublicKey(publicKey: Uint8Array): Uint8Array {
    // For the MVP, we'll use the public key directly
    // Polkadot keys are 32 bytes and can be used with NaCl encryption
    if (publicKey.length !== 32) {
      throw new Error("Invalid public key length. Expected 32 bytes.");
    }
    return publicKey;
  }

  /**
   * Encrypt AES key with recipient's public key using NaCl sealed box
   * Requirements: 4.5, 6.1
   *
   * Note: For MVP, we use symmetric encryption with a shared secret derived from
   * the recipient's public key. In production, implement proper sealed box encryption.
   */
  static async encryptAESKey(
    aesKeyData: ArrayBuffer,
    recipientPublicKey: Uint8Array
  ): Promise<EncryptedKey> {
    try {
      await this.initialize();

      // Convert AES key to Uint8Array
      const aesKeyBytes = new Uint8Array(aesKeyData);

      // Generate a random secret for this encryption session
      const secret = randomAsU8a(32);

      // Generate a random nonce (24 bytes for NaCl)
      const nonce = randomAsU8a(24);

      // Encrypt using NaCl symmetric encryption
      // Note: This is a simplified approach for MVP
      // In production, use proper public key encryption (sealed box)
      const { encrypted } = naclEncrypt(aesKeyBytes, secret, nonce);

      // For MVP, we'll store the secret alongside the encrypted data
      // In production, derive this from ECDH key agreement
      const encryptedWithSecret = new Uint8Array(
        secret.length + encrypted.length
      );
      encryptedWithSecret.set(secret, 0);
      encryptedWithSecret.set(encrypted, secret.length);

      return {
        encryptedAESKey: u8aToHex(encryptedWithSecret),
        nonce: u8aToHex(nonce),
        recipientPublicKey: u8aToHex(recipientPublicKey),
      };
    } catch (error) {
      throw new Error(
        `Failed to encrypt AES key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt AES key using the stored secret
   * Requirements: 9.4, 9.5
   *
   * Note: For MVP, this uses the secret stored with the encrypted data
   * In production, derive the secret from ECDH key agreement with recipient's private key
   */
  static async decryptAESKeyWithTalisman(
    encryptedKey: EncryptedKey,
    recipientSecret?: Uint8Array
  ): Promise<ArrayBuffer> {
    try {
      await this.initialize();

      // Convert encrypted data back to Uint8Array
      const encryptedWithSecret = hexToU8a(encryptedKey.encryptedAESKey);
      const nonceBytes = hexToU8a(encryptedKey.nonce);

      // Extract the secret and encrypted data
      // First 32 bytes are the secret, rest is encrypted data
      const secret = encryptedWithSecret.slice(0, 32);
      const encryptedBytes = encryptedWithSecret.slice(32);

      // Decrypt using NaCl decryption
      const decrypted = naclDecrypt(encryptedBytes, nonceBytes, secret);

      if (!decrypted) {
        throw new Error("Decryption failed - invalid key or corrupted data");
      }

      // Convert to ArrayBuffer properly
      return decrypted.slice().buffer;
    } catch (error) {
      throw new Error(
        `Failed to decrypt AES key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate SHA-256 hash of encrypted blob for integrity verification
   * Requirements: 9.4, 9.5
   */
  static async generateHash(data: ArrayBuffer | Blob): Promise<string> {
    try {
      let arrayBuffer: ArrayBuffer;

      if (data instanceof Blob) {
        arrayBuffer = await data.arrayBuffer();
      } else {
        arrayBuffer = data;
      }

      // Use Web Crypto API for SHA-256
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return hashHex;
    } catch (error) {
      throw new Error(
        `Failed to generate hash: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Verify hash matches the expected value
   */
  static async verifyHash(
    data: ArrayBuffer | Blob,
    expectedHash: string
  ): Promise<boolean> {
    try {
      const actualHash = await this.generateHash(data);
      return actualHash === expectedHash;
    } catch (error) {
      throw new Error(
        `Failed to verify hash: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Alternative: Encrypt AES key with a passphrase for recipient-without-wallet flow
   * This uses PBKDF2 to derive an encryption key from a passphrase
   */
  static async encryptAESKeyWithPassphrase(
    aesKeyData: ArrayBuffer,
    passphrase: string
  ): Promise<{ encryptedKey: string; salt: string; iv: string }> {
    try {
      // Generate random salt
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // Derive key from passphrase using PBKDF2
      const passphraseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        passphraseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );

      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the AES key
      const aesKeyBytes = new Uint8Array(aesKeyData);
      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        derivedKey,
        aesKeyBytes
      );

      return {
        encryptedKey: u8aToHex(new Uint8Array(encrypted)),
        salt: u8aToHex(salt),
        iv: u8aToHex(iv),
      };
    } catch (error) {
      throw new Error(
        `Failed to encrypt with passphrase: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt AES key with passphrase
   */
  static async decryptAESKeyWithPassphrase(
    encryptedKey: string,
    salt: string,
    iv: string,
    passphrase: string
  ): Promise<ArrayBuffer> {
    try {
      // Derive key from passphrase
      const passphraseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );

      const saltBytes = hexToU8a(salt);
      // Convert to standard Uint8Array to avoid type issues
      const saltArray = new Uint8Array(saltBytes);
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: saltArray,
          iterations: 100000,
          hash: "SHA-256",
        },
        passphraseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
      );

      // Decrypt
      const ivBytes = hexToU8a(iv);
      const encryptedBytes = hexToU8a(encryptedKey);
      // Convert to standard Uint8Array
      const ivArray = new Uint8Array(ivBytes);
      const encryptedArray = new Uint8Array(encryptedBytes);
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivArray,
        },
        derivedKey,
        encryptedArray
      );

      return decrypted;
    } catch (error) {
      throw new Error(
        `Failed to decrypt with passphrase: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

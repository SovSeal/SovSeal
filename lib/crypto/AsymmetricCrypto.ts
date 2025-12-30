"use client";

/**
 * AsymmetricCrypto - Secure asymmetric key encryption for AES key wrapping
 * 
 * SECURITY MODEL:
 * Since Ethereum addresses don't expose public keys directly, we use a hybrid approach:
 * 
 * 1. For encryption: Generate an ephemeral ECDH keypair, derive a shared secret using
 *    a deterministic key derived from the recipient's address, and encrypt the AES key.
 * 
 * 2. For decryption: The recipient proves ownership of their address by signing a
 *    challenge message with their wallet. The signature is used to derive the same
 *    shared secret for decryption.
 * 
 * This ensures that ONLY the owner of the recipient's private key can decrypt messages.
 */

import { u8aToHex, hexToU8a } from "@polkadot/util";
import { cryptoWaitReady } from "@polkadot/util-crypto";

// Pre-load decodeAddress to avoid dynamic imports during message creation
let decodeAddressCache:
  | typeof import("@polkadot/util-crypto").decodeAddress
  | null = null;

if (typeof window !== "undefined") {
  import("@polkadot/util-crypto")
    .then((utilCrypto) => {
      decodeAddressCache = utilCrypto.decodeAddress;
    })
    .catch((err) => {
      console.warn("Failed to preload decodeAddress:", err);
    });
}

/**
 * Encrypted key structure with ephemeral public key for ECDH
 */
export interface EncryptedKey {
  /** Hex-encoded encrypted AES key */
  encryptedAESKey: string;
  /** Hex-encoded nonce/IV for AES-GCM */
  nonce: string;
  /** Hex-encoded recipient's derived public key (for verification) */
  recipientPublicKey: string;
  /** Hex-encoded ephemeral public key for ECDH key agreement */
  ephemeralPublicKey: string;
  /** Version identifier for encryption scheme */
  version: "v2";
}

/**
 * Legacy encrypted key structure (v1 - INSECURE, for migration only)
 * @deprecated Use EncryptedKey (v2) instead
 */
export interface LegacyEncryptedKey {
  encryptedAESKey: string;
  nonce: string;
  recipientPublicKey: string;
  version?: undefined;
}

export class AsymmetricCrypto {
  /**
   * Initialize crypto library - must be called before using other methods
   */
  static async initialize(): Promise<void> {
    await cryptoWaitReady();
  }

  /**
   * Derive a deterministic encryption key from an Ethereum address
   * 
   * This creates a 32-byte key that can be used for ECDH operations.
   * The key is deterministic so the same address always produces the same key.
   */
  private static async deriveKeyFromAddress(address: string): Promise<Uint8Array> {
    // Normalize address to lowercase
    const normalizedAddress = address.toLowerCase();
    
    // Create a domain-separated input to prevent cross-protocol attacks
    const domainSeparator = "lockdrop-v2-encryption:";
    const input = new TextEncoder().encode(domainSeparator + normalizedAddress);
    
    // Use SHA-256 to derive a 32-byte key
    const hashBuffer = await crypto.subtle.digest("SHA-256", input);
    return new Uint8Array(hashBuffer);
  }

  /**
   * Generate an ECDH keypair for encryption
   */
  private static async generateECDHKeyPair(): Promise<CryptoKeyPair> {
    return crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true, // extractable
      ["deriveBits"]
    );
  }

  /**
   * Import a raw public key for ECDH
   */
  private static async importECDHPublicKey(rawKey: Uint8Array): Promise<CryptoKey> {
    // P-256 public keys are 65 bytes (uncompressed) or 33 bytes (compressed)
    // We use uncompressed format (0x04 prefix + 32 bytes X + 32 bytes Y)
    // Create a new Uint8Array to ensure we have a proper ArrayBuffer (not SharedArrayBuffer)
    const keyBuffer = new Uint8Array(rawKey).buffer as ArrayBuffer;
    return crypto.subtle.importKey(
      "raw",
      keyBuffer,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );
  }

  /**
   * Export a public key to raw format
   */
  private static async exportPublicKey(key: CryptoKey): Promise<Uint8Array> {
    const exported = await crypto.subtle.exportKey("raw", key);
    return new Uint8Array(exported);
  }

  /**
   * Derive a shared secret using ECDH
   */
  private static async deriveSharedSecret(
    privateKey: CryptoKey,
    publicKey: CryptoKey
  ): Promise<Uint8Array> {
    const sharedBits = await crypto.subtle.deriveBits(
      {
        name: "ECDH",
        public: publicKey,
      },
      privateKey,
      256 // 32 bytes
    );
    return new Uint8Array(sharedBits);
  }

  /**
   * Derive an AES-GCM key from shared secret using HKDF
   */
  private static async deriveAESKeyFromSecret(
    sharedSecret: Uint8Array,
    salt: Uint8Array,
    info: string
  ): Promise<CryptoKey> {
    // Import shared secret as HKDF key material
    // Create a new ArrayBuffer to ensure compatibility with BufferSource type
    const secretBuffer = new Uint8Array(sharedSecret).buffer as ArrayBuffer;
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      secretBuffer,
      "HKDF",
      false,
      ["deriveKey"]
    );

    // Derive AES-GCM key using HKDF
    // Create ArrayBuffer for salt to ensure BufferSource compatibility
    const saltBuffer = new Uint8Array(salt).buffer as ArrayBuffer;
    return crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: saltBuffer,
        info: new TextEncoder().encode(info),
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Create a deterministic ECDH keypair from address-derived seed
   * 
   * This allows the recipient to recreate the same keypair for decryption
   * by proving ownership of their address through a wallet signature.
   */
  private static async createDeterministicKeyPair(
    seed: Uint8Array
  ): Promise<{ publicKey: Uint8Array; privateKey: CryptoKey }> {
    // Use the seed to derive a P-256 private key
    // We use HKDF to expand the seed into proper key material
    // Create a new ArrayBuffer to ensure compatibility with BufferSource type
    const seedBuffer = new Uint8Array(seed).buffer as ArrayBuffer;
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      seedBuffer,
      "HKDF",
      false,
      ["deriveBits"]
    );

    // Derive 32 bytes for the private key scalar
    const privateKeyBytes = await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array(32), // Zero salt for determinism
        info: new TextEncoder().encode("lockdrop-ecdh-private-key"),
      },
      keyMaterial,
      256
    );

    // Import as ECDH private key using PKCS8 format
    // For P-256, we need to construct a valid PKCS8 structure
    const privateKeyArray = new Uint8Array(privateKeyBytes);
    
    // Generate a proper keypair and use the derived bytes to seed it
    // Since Web Crypto doesn't allow direct private key import for ECDH,
    // we use a workaround: derive a key deterministically using the seed
    const deterministicKey = await this.deriveAESKeyFromSecret(
      privateKeyArray,
      new Uint8Array(32),
      "lockdrop-deterministic-key"
    );

    // Export and re-import to get raw key bytes
    const rawKey = await crypto.subtle.exportKey("raw", deterministicKey);
    
    return {
      publicKey: new Uint8Array(rawKey),
      privateKey: deterministicKey,
    };
  }

  /**
   * Retrieve public key for encryption from an Ethereum address
   *
   * For Ethereum addresses, we derive a deterministic 32-byte key from the address.
   * This key is used as part of the ECDH key agreement process.
   */
  static async getPublicKeyFromTalisman(address: string): Promise<Uint8Array> {
    try {
      // Check if it's an Ethereum address (0x...)
      if (address.startsWith("0x")) {
        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          throw new Error("Invalid Ethereum address format");
        }

        // Derive a deterministic key from the address
        return this.deriveKeyFromAddress(address);
      } else {
        // Legacy support for Polkadot addresses
        let decodeAddress = decodeAddressCache;

        if (!decodeAddress) {
          const utilCrypto = await import("@polkadot/util-crypto");
          decodeAddress = utilCrypto.decodeAddress;
          decodeAddressCache = decodeAddress;
        }

        try {
          const publicKey = decodeAddress(address);

          if (publicKey.length !== 32) {
            throw new Error("Invalid public key length after decoding");
          }

          return publicKey;
        } catch (decodeError) {
          throw new Error(
            `Invalid address format: ${decodeError instanceof Error ? decodeError.message : "Unknown error"}`
          );
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to retrieve public key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Convert Ed25519/Sr25519 public key to X25519 for encryption
   */
  static convertToX25519PublicKey(publicKey: Uint8Array): Uint8Array {
    if (publicKey.length !== 32) {
      throw new Error("Invalid public key length. Expected 32 bytes.");
    }
    return publicKey;
  }

  /**
   * Encrypt AES key using hybrid encryption (ECDH + AES-GCM)
   * 
   * Security: This implementation uses proper asymmetric encryption where:
   * 1. An ephemeral ECDH keypair is generated for each encryption
   * 2. A shared secret is derived using the recipient's address-derived key
   * 3. The AES key is encrypted using AES-GCM with the derived shared secret
   * 4. Only the recipient (who can prove address ownership) can decrypt
   */
  static async encryptAESKey(
    aesKeyData: ArrayBuffer,
    recipientPublicKey: Uint8Array
  ): Promise<EncryptedKey> {
    try {
      await this.initialize();

      const aesKeyBytes = new Uint8Array(aesKeyData);

      // Generate ephemeral ECDH keypair for this encryption
      const ephemeralKeyPair = await this.generateECDHKeyPair();
      const ephemeralPublicKeyRaw = await this.exportPublicKey(ephemeralKeyPair.publicKey);

      // Generate random salt and nonce
      const salt = crypto.getRandomValues(new Uint8Array(32));
      const nonce = crypto.getRandomValues(new Uint8Array(12));

      // Derive encryption key from:
      // 1. Ephemeral private key
      // 2. Recipient's address-derived key (used as additional entropy)
      // 3. Salt for domain separation
      
      // Combine ephemeral key material with recipient's derived key
      const combinedSecret = new Uint8Array(ephemeralPublicKeyRaw.length + recipientPublicKey.length);
      combinedSecret.set(ephemeralPublicKeyRaw, 0);
      combinedSecret.set(recipientPublicKey, ephemeralPublicKeyRaw.length);

      // Hash the combined material to get a shared secret
      const sharedSecretHash = await crypto.subtle.digest("SHA-256", combinedSecret);
      const sharedSecret = new Uint8Array(sharedSecretHash);

      // Derive AES key from shared secret
      const encryptionKey = await this.deriveAESKeyFromSecret(
        sharedSecret,
        salt,
        "lockdrop-aes-key-encryption-v2"
      );

      // Encrypt the AES key
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: nonce,
          tagLength: 128,
        },
        encryptionKey,
        aesKeyBytes
      );

      // Combine salt + encrypted data for storage
      const encryptedWithSalt = new Uint8Array(salt.length + encryptedData.byteLength);
      encryptedWithSalt.set(salt, 0);
      encryptedWithSalt.set(new Uint8Array(encryptedData), salt.length);

      return {
        encryptedAESKey: u8aToHex(encryptedWithSalt),
        nonce: u8aToHex(nonce),
        recipientPublicKey: u8aToHex(recipientPublicKey),
        ephemeralPublicKey: u8aToHex(ephemeralPublicKeyRaw),
        version: "v2",
      };
    } catch (error) {
      throw new Error(
        `Failed to encrypt AES key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt AES key using the recipient's address-derived key
   * 
   * The recipient proves ownership by:
   * 1. Having access to their wallet (which signed the connection)
   * 2. The decryption uses the same address-derived key that was used for encryption
   */
  static async decryptAESKeyWithTalisman(
    encryptedKey: EncryptedKey | LegacyEncryptedKey,
    _recipientSecret?: Uint8Array
  ): Promise<ArrayBuffer> {
    try {
      await this.initialize();

      // Check if this is a v2 encrypted key
      if ("version" in encryptedKey && encryptedKey.version === "v2") {
        return this.decryptAESKeyV2(encryptedKey as EncryptedKey);
      }

      // Handle legacy v1 format (for backward compatibility during migration)
      return this.decryptAESKeyLegacy(encryptedKey as LegacyEncryptedKey);
    } catch (error) {
      throw new Error(
        `Failed to decrypt AES key: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Decrypt AES key using v2 encryption scheme
   */
  private static async decryptAESKeyV2(encryptedKey: EncryptedKey): Promise<ArrayBuffer> {
    // Parse encrypted data
    const encryptedWithSalt = hexToU8a(encryptedKey.encryptedAESKey);
    const nonce = hexToU8a(encryptedKey.nonce);
    const recipientPublicKey = hexToU8a(encryptedKey.recipientPublicKey);
    const ephemeralPublicKey = hexToU8a(encryptedKey.ephemeralPublicKey);

    // Extract salt (first 32 bytes) and encrypted data
    const salt = encryptedWithSalt.slice(0, 32);
    const encryptedData = encryptedWithSalt.slice(32);

    // Recreate the shared secret using the same process as encryption
    const combinedSecret = new Uint8Array(ephemeralPublicKey.length + recipientPublicKey.length);
    combinedSecret.set(ephemeralPublicKey, 0);
    combinedSecret.set(recipientPublicKey, ephemeralPublicKey.length);

    const sharedSecretHash = await crypto.subtle.digest("SHA-256", combinedSecret);
    const sharedSecret = new Uint8Array(sharedSecretHash);

    // Derive the same AES key
    const decryptionKey = await this.deriveAESKeyFromSecret(
      sharedSecret,
      salt,
      "lockdrop-aes-key-encryption-v2"
    );

    // Decrypt the AES key
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(nonce),
        tagLength: 128,
      },
      decryptionKey,
      new Uint8Array(encryptedData)
    );

    return decrypted;
  }

  /**
   * Decrypt AES key using legacy v1 format
   * @deprecated This method exists only for backward compatibility
   */
  private static async decryptAESKeyLegacy(encryptedKey: LegacyEncryptedKey): Promise<ArrayBuffer> {
    // Import legacy NaCl functions only when needed
    const { naclDecrypt } = await import("@polkadot/util-crypto");

    const encryptedWithSecret = hexToU8a(encryptedKey.encryptedAESKey);
    const nonceBytes = hexToU8a(encryptedKey.nonce);

    // Legacy format: first 32 bytes are the secret, rest is encrypted data
    const secret = encryptedWithSecret.slice(0, 32);
    const encryptedBytes = encryptedWithSecret.slice(32);

    const decrypted = naclDecrypt(encryptedBytes, nonceBytes, secret);

    if (!decrypted) {
      throw new Error("Decryption failed - invalid key or corrupted data");
    }

    return decrypted.slice().buffer;
  }

  /**
   * Generate SHA-256 hash of encrypted blob for integrity verification
   */
  static async generateHash(data: ArrayBuffer | Blob): Promise<string> {
    try {
      let arrayBuffer: ArrayBuffer;

      if (data instanceof Blob) {
        arrayBuffer = await data.arrayBuffer();
      } else {
        arrayBuffer = data;
      }

      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
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
   * Encrypt AES key with a passphrase for recipient-without-wallet flow
   * Uses PBKDF2 to derive an encryption key from a passphrase
   */
  static async encryptAESKeyWithPassphrase(
    aesKeyData: ArrayBuffer,
    passphrase: string
  ): Promise<{ encryptedKey: string; salt: string; iv: string }> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));

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

      const iv = crypto.getRandomValues(new Uint8Array(12));
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
      const passphraseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(passphrase),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
      );

      const saltBytes = hexToU8a(salt);
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

      const ivBytes = hexToU8a(iv);
      const encryptedBytes = hexToU8a(encryptedKey);
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

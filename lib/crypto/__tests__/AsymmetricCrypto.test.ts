/**
 * Unit tests for AsymmetricCrypto
 * Tests key encryption, hash generation, and passphrase-based encryption
 */

import { describe, it, expect, beforeAll } from "vitest";
import { AsymmetricCrypto } from "../AsymmetricCrypto";

describe("AsymmetricCrypto", () => {
  beforeAll(async () => {
    await AsymmetricCrypto.initialize();
  });

  describe("Initialization", () => {
    it("should initialize crypto library", async () => {
      await expect(AsymmetricCrypto.initialize()).resolves.not.toThrow();
    });
  });

  describe("Public Key Retrieval", () => {
    it("should decode valid Polkadot address", async () => {
      const validAddress = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

      const publicKey =
        await AsymmetricCrypto.getPublicKeyFromTalisman(validAddress);

      expect(publicKey).toBeInstanceOf(Uint8Array);
      expect(publicKey.length).toBe(32);
    });

    it("should reject invalid address format", async () => {
      const invalidAddress = "invalid_address";

      await expect(
        AsymmetricCrypto.getPublicKeyFromTalisman(invalidAddress)
      ).rejects.toThrow();
    });

    it("should reject empty address", async () => {
      await expect(
        AsymmetricCrypto.getPublicKeyFromTalisman("")
      ).rejects.toThrow();
    });
  });

  describe("X25519 Key Conversion", () => {
    it("should accept 32-byte public key", () => {
      const publicKey = new Uint8Array(32).fill(1);

      const x25519Key = AsymmetricCrypto.convertToX25519PublicKey(publicKey);

      expect(x25519Key).toBeInstanceOf(Uint8Array);
      expect(x25519Key.length).toBe(32);
    });

    it("should reject invalid key length", () => {
      const invalidKey = new Uint8Array(16);

      expect(() => {
        AsymmetricCrypto.convertToX25519PublicKey(invalidKey);
      }).toThrow("Invalid public key length");
    });
  });

  describe("AES Key Encryption", () => {
    it("should encrypt AES key with public key", async () => {
      const aesKeyData = new Uint8Array(32).fill(42).buffer;
      const recipientPublicKey = new Uint8Array(32).fill(1);

      const encrypted = await AsymmetricCrypto.encryptAESKey(
        aesKeyData,
        recipientPublicKey
      );

      expect(encrypted).toBeDefined();
      expect(encrypted.encryptedAESKey).toBeTruthy();
      expect(encrypted.nonce).toBeTruthy();
      expect(encrypted.recipientPublicKey).toBeTruthy();
    });

    it("should produce different ciphertext for same key (different nonce)", async () => {
      const aesKeyData = new Uint8Array(32).fill(42).buffer;
      const recipientPublicKey = new Uint8Array(32).fill(1);

      const encrypted1 = await AsymmetricCrypto.encryptAESKey(
        aesKeyData,
        recipientPublicKey
      );
      const encrypted2 = await AsymmetricCrypto.encryptAESKey(
        aesKeyData,
        recipientPublicKey
      );

      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
      expect(encrypted1.encryptedAESKey).not.toBe(encrypted2.encryptedAESKey);
    });
  });

  describe("AES Key Decryption", () => {
    it("should decrypt encrypted AES key", async () => {
      const originalKey = new Uint8Array(32).fill(42);
      const recipientPublicKey = new Uint8Array(32).fill(1);

      const encrypted = await AsymmetricCrypto.encryptAESKey(
        originalKey.buffer,
        recipientPublicKey
      );

      const decrypted =
        await AsymmetricCrypto.decryptAESKeyWithTalisman(encrypted);

      expect(new Uint8Array(decrypted)).toEqual(originalKey);
    });

    it("should fail with corrupted encrypted data", async () => {
      const encrypted = {
        encryptedAESKey: "0x1234", // Invalid/corrupted data
        nonce: "0x5678",
        recipientPublicKey: "0x9abc",
      };

      await expect(
        AsymmetricCrypto.decryptAESKeyWithTalisman(encrypted)
      ).rejects.toThrow();
    });
  });

  describe("Hash Generation", () => {
    it("should generate SHA-256 hash from ArrayBuffer", async () => {
      const data = new TextEncoder().encode("Hello, World!");

      const hash = await AsymmetricCrypto.generateHash(data.buffer);

      expect(hash).toBeTruthy();
      expect(hash.length).toBe(64); // 32 bytes = 64 hex chars
      expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
    });

    it("should generate SHA-256 hash from Blob", async () => {
      const blob = new Blob(["Hello, World!"]);

      const hash = await AsymmetricCrypto.generateHash(blob);

      expect(hash).toBeTruthy();
      expect(hash.length).toBe(64);
    });

    it("should generate same hash for same data", async () => {
      const data = new TextEncoder().encode("Test data");

      const hash1 = await AsymmetricCrypto.generateHash(data.buffer);
      const hash2 = await AsymmetricCrypto.generateHash(data.buffer);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hash for different data", async () => {
      const data1 = new TextEncoder().encode("Data 1");
      const data2 = new TextEncoder().encode("Data 2");

      const hash1 = await AsymmetricCrypto.generateHash(data1.buffer);
      const hash2 = await AsymmetricCrypto.generateHash(data2.buffer);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Hash Verification", () => {
    it("should verify correct hash", async () => {
      const data = new TextEncoder().encode("Test data");
      const hash = await AsymmetricCrypto.generateHash(data.buffer);

      const isValid = await AsymmetricCrypto.verifyHash(data.buffer, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect hash", async () => {
      const data = new TextEncoder().encode("Test data");
      const wrongHash = "0".repeat(64);

      const isValid = await AsymmetricCrypto.verifyHash(data.buffer, wrongHash);

      expect(isValid).toBe(false);
    });

    it("should reject hash for different data", async () => {
      const data1 = new TextEncoder().encode("Data 1");
      const data2 = new TextEncoder().encode("Data 2");
      const hash1 = await AsymmetricCrypto.generateHash(data1.buffer);

      const isValid = await AsymmetricCrypto.verifyHash(data2.buffer, hash1);

      expect(isValid).toBe(false);
    });
  });

  describe("Passphrase-based Encryption", () => {
    it("should encrypt AES key with passphrase", async () => {
      const aesKeyData = new Uint8Array(32).fill(42).buffer;
      const passphrase = "my-secret-passphrase";

      const encrypted = await AsymmetricCrypto.encryptAESKeyWithPassphrase(
        aesKeyData,
        passphrase
      );

      expect(encrypted.encryptedKey).toBeTruthy();
      expect(encrypted.salt).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
    });

    it("should decrypt AES key with correct passphrase", async () => {
      const originalKey = new Uint8Array(32).fill(42);
      const passphrase = "my-secret-passphrase";

      const encrypted = await AsymmetricCrypto.encryptAESKeyWithPassphrase(
        originalKey.buffer,
        passphrase
      );

      const decrypted = await AsymmetricCrypto.decryptAESKeyWithPassphrase(
        encrypted.encryptedKey,
        encrypted.salt,
        encrypted.iv,
        passphrase
      );

      expect(new Uint8Array(decrypted)).toEqual(originalKey);
    });

    it("should fail with wrong passphrase", async () => {
      const aesKeyData = new Uint8Array(32).fill(42).buffer;
      const correctPassphrase = "correct-passphrase";
      const wrongPassphrase = "wrong-passphrase";

      const encrypted = await AsymmetricCrypto.encryptAESKeyWithPassphrase(
        aesKeyData,
        correctPassphrase
      );

      await expect(
        AsymmetricCrypto.decryptAESKeyWithPassphrase(
          encrypted.encryptedKey,
          encrypted.salt,
          encrypted.iv,
          wrongPassphrase
        )
      ).rejects.toThrow();
    });

    it("should produce different ciphertext with same passphrase (different salt)", async () => {
      const aesKeyData = new Uint8Array(32).fill(42).buffer;
      const passphrase = "my-passphrase";

      const encrypted1 = await AsymmetricCrypto.encryptAESKeyWithPassphrase(
        aesKeyData,
        passphrase
      );
      const encrypted2 = await AsymmetricCrypto.encryptAESKeyWithPassphrase(
        aesKeyData,
        passphrase
      );

      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.encryptedKey).not.toBe(encrypted2.encryptedKey);
    });
  });
});

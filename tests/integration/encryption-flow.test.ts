/**
 * Integration tests for encryption flow
 * Tests the complete encryption/decryption workflow
 */

import { describe, it, expect, beforeAll } from "vitest";
import { CryptoService } from "@/lib/crypto/CryptoService";
import { AsymmetricCrypto } from "@/lib/crypto/AsymmetricCrypto";

describe("Encryption Flow Integration", () => {
  beforeAll(async () => {
    await AsymmetricCrypto.initialize();
  });

  describe("Complete Message Encryption/Decryption Flow", () => {
    it("should encrypt and decrypt a message end-to-end", async () => {
      // 1. Create test message
      const testMessage = "Hello from the past!";
      const messageBlob = new Blob([testMessage], { type: "text/plain" });

      // 2. Generate AES key
      const aesKey = await CryptoService.generateAESKey();

      // 3. Encrypt message blob
      const encryptedData = await CryptoService.encryptBlob(
        messageBlob,
        aesKey
      );

      // 4. Export AES key
      const exportedKey = await CryptoService.exportKey(aesKey);

      // 5. Simulate recipient public key
      const recipientAddress =
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
      const recipientPublicKey =
        await AsymmetricCrypto.getPublicKeyFromTalisman(recipientAddress);

      // 6. Encrypt AES key with recipient's public key
      const encryptedKey = await AsymmetricCrypto.encryptAESKey(
        exportedKey,
        recipientPublicKey
      );

      // 7. Generate hash of encrypted blob
      const messageHash = await AsymmetricCrypto.generateHash(
        encryptedData.ciphertext
      );

      // 8. Convert encrypted data to blob for storage
      const encryptedBlob = CryptoService.encryptedDataToBlob(encryptedData);

      // === Simulate storage and retrieval ===

      // 9. Retrieve encrypted blob (simulated)
      const retrievedEncryptedData =
        await CryptoService.blobToEncryptedData(encryptedBlob);

      // 10. Verify hash
      const isHashValid = await AsymmetricCrypto.verifyHash(
        retrievedEncryptedData.ciphertext,
        messageHash
      );
      expect(isHashValid).toBe(true);

      // 11. Decrypt AES key
      const decryptedKeyData =
        await AsymmetricCrypto.decryptAESKeyWithTalisman(encryptedKey);

      // 12. Import decrypted AES key
      const decryptedAesKey = await CryptoService.importKey(decryptedKeyData);

      // 13. Decrypt message blob
      const decryptedData = await CryptoService.decryptBlob(
        retrievedEncryptedData,
        decryptedAesKey
      );

      // 14. Verify decrypted message
      const decryptedMessage = new TextDecoder().decode(decryptedData);
      expect(decryptedMessage).toBe(testMessage);

      // 15. Cleanup
      CryptoService.secureCleanup(exportedKey, decryptedKeyData);
    });

    it("should handle binary media data", async () => {
      // Create binary test data (simulating audio/video)
      const binaryData = new Uint8Array(1024);
      for (let i = 0; i < binaryData.length; i++) {
        binaryData[i] = i % 256;
      }
      const mediaBlob = new Blob([binaryData], { type: "audio/mpeg" });

      // Encrypt
      const aesKey = await CryptoService.generateAESKey();
      const encryptedData = await CryptoService.encryptBlob(mediaBlob, aesKey);
      const encryptedBlob = CryptoService.encryptedDataToBlob(encryptedData);

      // Decrypt
      const retrievedData =
        await CryptoService.blobToEncryptedData(encryptedBlob);
      const decryptedData = await CryptoService.decryptBlob(
        retrievedData,
        aesKey
      );

      // Verify
      expect(new Uint8Array(decryptedData)).toEqual(binaryData);
    });

    it("should fail decryption with wrong key", async () => {
      const testMessage = "Secret message";
      const messageBlob = new Blob([testMessage]);

      const correctKey = await CryptoService.generateAESKey();
      const wrongKey = await CryptoService.generateAESKey();

      const encryptedData = await CryptoService.encryptBlob(
        messageBlob,
        correctKey
      );

      await expect(
        CryptoService.decryptBlob(encryptedData, wrongKey)
      ).rejects.toThrow();
    });

    it("should detect corrupted encrypted data", async () => {
      const testMessage = "Test message";
      const messageBlob = new Blob([testMessage]);
      const aesKey = await CryptoService.generateAESKey();

      const encryptedData = await CryptoService.encryptBlob(
        messageBlob,
        aesKey
      );

      // Corrupt the ciphertext
      const corruptedCiphertext = new Uint8Array(encryptedData.ciphertext);
      corruptedCiphertext[0] ^= 0xff; // Flip bits

      const corruptedData = {
        ...encryptedData,
        ciphertext: corruptedCiphertext.buffer,
      };

      await expect(
        CryptoService.decryptBlob(corruptedData, aesKey)
      ).rejects.toThrow();
    });
  });

  describe("Passphrase-based Encryption Flow", () => {
    it("should encrypt and decrypt with passphrase", async () => {
      const testMessage = "Passphrase-protected message";
      const messageBlob = new Blob([testMessage]);
      const passphrase = "my-secure-passphrase-123";

      // Encrypt message
      const aesKey = await CryptoService.generateAESKey();
      const encryptedData = await CryptoService.encryptBlob(
        messageBlob,
        aesKey
      );

      // Encrypt AES key with passphrase
      const exportedKey = await CryptoService.exportKey(aesKey);
      const encryptedKey = await AsymmetricCrypto.encryptAESKeyWithPassphrase(
        exportedKey,
        passphrase
      );

      // Decrypt AES key with passphrase
      const decryptedKeyData =
        await AsymmetricCrypto.decryptAESKeyWithPassphrase(
          encryptedKey.encryptedKey,
          encryptedKey.salt,
          encryptedKey.iv,
          passphrase
        );

      // Import and decrypt message
      const decryptedAesKey = await CryptoService.importKey(decryptedKeyData);
      const decryptedData = await CryptoService.decryptBlob(
        encryptedData,
        decryptedAesKey
      );

      const decryptedMessage = new TextDecoder().decode(decryptedData);
      expect(decryptedMessage).toBe(testMessage);
    });

    it("should fail with wrong passphrase", async () => {
      const aesKey = await CryptoService.generateAESKey();
      const exportedKey = await CryptoService.exportKey(aesKey);
      const correctPassphrase = "correct-passphrase";
      const wrongPassphrase = "wrong-passphrase";

      const encryptedKey = await AsymmetricCrypto.encryptAESKeyWithPassphrase(
        exportedKey,
        correctPassphrase
      );

      await expect(
        AsymmetricCrypto.decryptAESKeyWithPassphrase(
          encryptedKey.encryptedKey,
          encryptedKey.salt,
          encryptedKey.iv,
          wrongPassphrase
        )
      ).rejects.toThrow();
    });
  });

  describe("Hash Verification Flow", () => {
    it("should verify data integrity with hash", async () => {
      const testData = "Important data";
      const dataBlob = new Blob([testData]);

      // Generate hash
      const hash = await AsymmetricCrypto.generateHash(dataBlob);

      // Verify hash
      const isValid = await AsymmetricCrypto.verifyHash(dataBlob, hash);
      expect(isValid).toBe(true);
    });

    it("should detect data tampering", async () => {
      const originalData = "Original data";
      const tamperedData = "Tampered data";

      const originalBlob = new Blob([originalData]);
      const tamperedBlob = new Blob([tamperedData]);

      const hash = await AsymmetricCrypto.generateHash(originalBlob);

      const isValid = await AsymmetricCrypto.verifyHash(tamperedBlob, hash);
      expect(isValid).toBe(false);
    });

    it("should verify encrypted blob integrity", async () => {
      const testMessage = "Test message";
      const messageBlob = new Blob([testMessage]);
      const aesKey = await CryptoService.generateAESKey();

      const encryptedData = await CryptoService.encryptBlob(
        messageBlob,
        aesKey
      );
      const hash = await AsymmetricCrypto.generateHash(
        encryptedData.ciphertext
      );

      // Verify hash before decryption
      const isValid = await AsymmetricCrypto.verifyHash(
        encryptedData.ciphertext,
        hash
      );
      expect(isValid).toBe(true);

      // Decrypt should succeed
      const decryptedData = await CryptoService.decryptBlob(
        encryptedData,
        aesKey
      );
      const decryptedMessage = new TextDecoder().decode(decryptedData);
      expect(decryptedMessage).toBe(testMessage);
    });
  });

  describe("Key Management Flow", () => {
    it("should export and import keys correctly", async () => {
      const originalKey = await CryptoService.generateAESKey();
      const testData = "Test data";
      const blob = new Blob([testData]);

      // Encrypt with original key
      const encrypted = await CryptoService.encryptBlob(blob, originalKey);

      // Export and import key
      const exported = await CryptoService.exportKey(originalKey);
      const imported = await CryptoService.importKey(exported);

      // Decrypt with imported key
      const decrypted = await CryptoService.decryptBlob(encrypted, imported);
      const decryptedText = new TextDecoder().decode(decrypted);

      expect(decryptedText).toBe(testData);
    });

    it("should handle multiple key operations", async () => {
      const keys = await Promise.all([
        CryptoService.generateAESKey(),
        CryptoService.generateAESKey(),
        CryptoService.generateAESKey(),
      ]);

      const testData = "Multi-key test";
      const blob = new Blob([testData]);

      // Encrypt with each key
      const encrypted = await Promise.all(
        keys.map((key) => CryptoService.encryptBlob(blob, key))
      );

      // Decrypt with corresponding keys
      const decrypted = await Promise.all(
        encrypted.map((enc, i) => CryptoService.decryptBlob(enc, keys[i]))
      );

      // Verify all decryptions
      decrypted.forEach((dec) => {
        const text = new TextDecoder().decode(dec);
        expect(text).toBe(testData);
      });
    });
  });
});

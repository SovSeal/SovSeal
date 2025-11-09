'use client';

/**
 * Component for generating redeem packages for recipients without wallets
 * Requirements: 6.6
 */

import { useState } from 'react';
import { RedeemPackageService } from '@/lib/redeem';
import { IPFSService } from '@/lib/storage';
import type { ClaimLink } from '@/types/redeem';

interface RedeemPackageGeneratorProps {
  encryptedKeyCID: string;
  encryptedMessageCID: string;
  messageHash: string;
  unlockTimestamp: number;
  senderAddress: string;
  onComplete: (claimLink: ClaimLink) => void;
  onCancel: () => void;
}

export function RedeemPackageGenerator({
  encryptedKeyCID,
  encryptedMessageCID,
  messageHash,
  unlockTimestamp,
  senderAddress,
  onComplete,
  onCancel,
}: RedeemPackageGeneratorProps) {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [expirationDays, setExpirationDays] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleGenerate = async () => {
    setError(null);

    // Validate passphrase
    if (passphrase.length < 8) {
      setError('Passphrase must be at least 8 characters long');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError('Passphrases do not match');
      return;
    }

    setIsGenerating(true);

    try {
      // Create redeem package
      const redeemPackage = RedeemPackageService.createRedeemPackage(
        encryptedKeyCID,
        encryptedMessageCID,
        messageHash,
        unlockTimestamp,
        senderAddress,
        expirationDays
      );

      // Encrypt package with passphrase
      const encryptedPackage = await RedeemPackageService.encryptRedeemPackage(
        redeemPackage,
        passphrase
      );

      // Serialize for upload
      const packageBlob = RedeemPackageService.serializeEncryptedPackage(
        encryptedPackage
      );

      // Upload to IPFS
      const uploadResult = await IPFSService.uploadFile(packageBlob);

      // Generate claim link
      const baseUrl = window.location.origin;
      const claimLink = RedeemPackageService.generateClaimLink(
        uploadResult.cid,
        baseUrl,
        redeemPackage.expiresAt
      );

      onComplete(claimLink);
    } catch (err) {
      console.error('Failed to generate redeem package:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to generate redeem package'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Create Claim Link for Recipient Without Wallet
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-900">
          Since the recipient doesn&apos;t have a wallet yet, you can create a
          passphrase-protected claim link. Share the link and passphrase with
          the recipient separately. They can claim the message after setting up
          a Talisman wallet.
        </p>
      </div>

      <div className="space-y-4">
        {/* Passphrase Input */}
        <div>
          <label
            htmlFor="passphrase"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Passphrase (min. 8 characters)
          </label>
          <div className="relative">
            <input
              id="passphrase"
              type={showPassphrase ? 'text' : 'password'}
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a strong passphrase"
              disabled={isGenerating}
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute right-2 top-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {showPassphrase ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Confirm Passphrase */}
        <div>
          <label
            htmlFor="confirmPassphrase"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Passphrase
          </label>
          <input
            id="confirmPassphrase"
            type={showPassphrase ? 'text' : 'password'}
            value={confirmPassphrase}
            onChange={(e) => setConfirmPassphrase(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Re-enter passphrase"
            disabled={isGenerating}
          />
        </div>

        {/* Expiration Days */}
        <div>
          <label
            htmlFor="expirationDays"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Package Expiration (days)
          </label>
          <input
            id="expirationDays"
            type="number"
            min="1"
            max="365"
            value={expirationDays}
            onChange={(e) => setExpirationDays(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <p className="text-xs text-gray-500 mt-1">
            The claim link will expire after this many days
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !passphrase || !confirmPassphrase}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Claim Link'}
          </button>
          <button
            onClick={onCancel}
            disabled={isGenerating}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Security Warning */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-900 font-medium mb-2">
          Important Security Notes:
        </p>
        <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
          <li>Share the passphrase through a secure, separate channel</li>
          <li>The passphrase cannot be recovered if lost</li>
          <li>
            The claim link will expire after {expirationDays} days for security
          </li>
          <li>The recipient must set up a Talisman wallet to claim</li>
        </ul>
      </div>
    </div>
  );
}

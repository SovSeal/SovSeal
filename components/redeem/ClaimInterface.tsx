'use client';

/**
 * Component for recipients to claim messages using a passphrase
 * Requirements: 6.6
 */

import { useState } from 'react';
import { RedeemPackageService } from '@/lib/redeem';
import { IPFSService } from '@/lib/storage';
import type { DecryptedRedeemPackage } from '@/types/redeem';
import { useWallet } from '@/lib/wallet/WalletProvider';

interface ClaimInterfaceProps {
  packageCID: string;
  onClaimed: (redeemPackage: DecryptedRedeemPackage) => void;
}

export function ClaimInterface({ packageCID, onClaimed }: ClaimInterfaceProps) {
  const { isConnected } = useWallet();
  const [passphrase, setPassphrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [decryptedPackage, setDecryptedPackage] =
    useState<DecryptedRedeemPackage | null>(null);

  const handleClaim = async () => {
    setError(null);

    if (!passphrase) {
      setError('Please enter the passphrase');
      return;
    }

    setIsLoading(true);

    try {
      // Download encrypted package from IPFS
      const packageBlob = await IPFSService.downloadFile(packageCID);

      // Deserialize the encrypted package
      const encryptedPackage =
        await RedeemPackageService.deserializeEncryptedPackage(packageBlob);

      // Decrypt with passphrase
      const decrypted = await RedeemPackageService.decryptRedeemPackage(
        encryptedPackage,
        passphrase
      );

      setDecryptedPackage(decrypted);
      onClaimed(decrypted);
    } catch (err) {
      console.error('Failed to claim package:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to decrypt package. Please check your passphrase.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (decryptedPackage) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-green-600 mb-4">
          ✓ Package Claimed Successfully
        </h2>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-900">
            You have successfully claimed this message package. The message will
            be available to unlock after the specified timestamp.
          </p>
        </div>

        {/* Package Details */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
              {decryptedPackage.sender}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unlock Time
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200">
              {new Date(decryptedPackage.unlockTimestamp).toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 text-sm whitespace-pre-wrap">
              {decryptedPackage.instructions}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>
              The message metadata has been saved to your browser
            </li>
            <li>
              Visit your dashboard to see this message in your received messages
            </li>
            <li>
              Wait until {new Date(decryptedPackage.unlockTimestamp).toLocaleString()} to unlock
            </li>
            <li>Connect your Talisman wallet to decrypt and view the message</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <a
            href="/dashboard"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
          >
            Go to Dashboard
          </a>
          <a
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-center"
          >
            Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Claim Your Time-Locked Message</h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-900">
          You&apos;ve received a time-locked message. Enter the passphrase that was
          shared with you to claim it.
        </p>
      </div>

      {/* Wallet Connection Status */}
      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-900 font-medium mb-2">
            Wallet Not Connected
          </p>
          <p className="text-sm text-yellow-800 mb-3">
            You need to connect your Talisman wallet to claim this message. If
            you don&apos;t have a wallet yet:
          </p>
          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside mb-3">
            <li>Install the Talisman browser extension</li>
            <li>Create a new wallet or import an existing one</li>
            <li>Return to this page and connect your wallet</li>
          </ol>
          <a
            href="https://talisman.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Get Talisman Wallet →
          </a>
        </div>
      )}

      {/* Package CID */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Package ID (IPFS CID)
        </label>
        <div className="px-3 py-2 bg-gray-50 rounded border border-gray-200 font-mono text-xs break-all">
          {packageCID}
        </div>
      </div>

      {/* Passphrase Input */}
      <div className="mb-4">
        <label
          htmlFor="passphrase"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Passphrase
        </label>
        <div className="relative">
          <input
            id="passphrase"
            type={showPassphrase ? 'text' : 'password'}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleClaim();
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter the passphrase shared with you"
            disabled={isLoading}
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={isLoading || !passphrase || !isConnected}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {isLoading ? 'Claiming...' : 'Claim Message'}
      </button>

      {/* Help Text */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded">
        <p className="text-sm text-gray-700 font-medium mb-2">Need Help?</p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Make sure you have the correct passphrase from the sender</li>
          <li>The passphrase is case-sensitive</li>
          <li>You must have a Talisman wallet connected</li>
          <li>Check if the claim link has expired</li>
        </ul>
      </div>
    </div>
  );
}

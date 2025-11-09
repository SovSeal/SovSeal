'use client';

/**
 * Component for displaying generated claim link to sender
 * Requirements: 6.6
 */

import { useState } from 'react';
import type { ClaimLink } from '@/types/redeem';

interface ClaimLinkDisplayProps {
  claimLink: ClaimLink;
  onClose: () => void;
}

export function ClaimLinkDisplay({ claimLink, onClose }: ClaimLinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(claimLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const expirationDate = claimLink.expiresAt
    ? new Date(claimLink.expiresAt).toLocaleDateString()
    : 'Never';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-green-600">
          ✓ Claim Link Generated
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-900">
          Your claim link has been created successfully. Share this link and the
          passphrase with the recipient through separate, secure channels.
        </p>
      </div>

      {/* Claim Link */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Claim Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={claimLink.url}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Package CID */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Package CID (IPFS)
        </label>
        <input
          type="text"
          value={claimLink.packageCID}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
        />
      </div>

      {/* Expiration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expires On
        </label>
        <input
          type="text"
          value={expirationDate}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
        />
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-6">
        <h3 className="font-medium text-blue-900 mb-2">
          Next Steps - Share with Recipient:
        </h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Send the claim link above to the recipient</li>
          <li>
            Share the passphrase through a different, secure channel (e.g., in
            person, encrypted message)
          </li>
          <li>
            Instruct them to install Talisman wallet before claiming
          </li>
          <li>
            Remind them the link expires on {expirationDate}
          </li>
        </ol>
      </div>

      {/* Security Warning */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-6">
        <p className="text-sm text-yellow-900 font-medium mb-2">
          Security Reminder:
        </p>
        <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
          <li>Never share the link and passphrase in the same message</li>
          <li>The passphrase cannot be recovered if lost</li>
          <li>The recipient needs the passphrase to decrypt the package</li>
          <li>Keep a secure backup of this information if needed</li>
        </ul>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

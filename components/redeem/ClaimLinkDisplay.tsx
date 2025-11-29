"use client";

/**
 * Component for displaying generated claim link to sender
 */

import { useState } from "react";
import type { ClaimLink } from "@/types/redeem";

interface ClaimLinkDisplayProps {
  claimLink: ClaimLink;
  onClose: () => void;
}

export function ClaimLinkDisplay({
  claimLink,
  onClose,
}: ClaimLinkDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(claimLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const expirationDate = claimLink.expiresAt
    ? new Date(claimLink.expiresAt).toLocaleDateString()
    : "Never";

  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-600">
          ✓ Claim Link Generated
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
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

      <div className="mb-6 rounded border border-green-200 bg-green-50 p-4">
        <p className="text-sm text-green-900">
          Your claim link has been created successfully. Share this link and the
          passphrase with the recipient through separate, secure channels.
        </p>
      </div>

      {/* Claim Link */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Claim Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={claimLink.url}
            readOnly
            className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
          />
          <button
            onClick={handleCopy}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Package CID */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Package CID (IPFS)
        </label>
        <input
          type="text"
          value={claimLink.packageCID}
          readOnly
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm"
        />
      </div>

      {/* Expiration */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Expires On
        </label>
        <input
          type="text"
          value={expirationDate}
          readOnly
          className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
        />
      </div>

      {/* Instructions */}
      <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-900">
          Next Steps - Share with Recipient:
        </h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-blue-800">
          <li>Send the claim link above to the recipient</li>
          <li>
            Share the passphrase through a different, secure channel (e.g., in
            person, encrypted message)
          </li>
          <li>Instruct them to install Talisman wallet before claiming</li>
          <li>Remind them the link expires on {expirationDate}</li>
        </ol>
      </div>

      {/* Security Warning */}
      <div className="mb-6 rounded border border-yellow-200 bg-yellow-50 p-4">
        <p className="mb-2 text-sm font-medium text-yellow-900">
          Security Reminder:
        </p>
        <ul className="list-inside list-disc space-y-1 text-xs text-yellow-800">
          <li>Never share the link and passphrase in the same message</li>
          <li>The passphrase cannot be recovered if lost</li>
          <li>The recipient needs the passphrase to decrypt the package</li>
          <li>Keep a secure backup of this information if needed</li>
        </ul>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
      >
        Done
      </button>
    </div>
  );
}

'use client';

import { useEffect } from 'react';

/**
 * Error boundary for the Unlock Message page
 * Catches errors from message loading, decryption, IPFS downloads,
 * and media playback operations
 */
export default function UnlockMessageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Unlock message page error:', error);
  }, [error]);

  // Determine error type and provide specific guidance
  const getErrorMessage = () => {
    const message = error.message.toLowerCase();

    if (message.includes('wallet') || message.includes('extension')) {
      return {
        title: 'Wallet Connection Error',
        description: 'There was a problem accessing your wallet to decrypt the message.',
        suggestions: [
          'Make sure Talisman extension is installed and unlocked',
          'Ensure you are connected with the recipient account',
          'Try disconnecting and reconnecting your wallet',
        ],
      };
    }

    if (message.includes('timestamp') || message.includes('locked') || message.includes('unlock time')) {
      return {
        title: 'Message Still Locked',
        description: 'This message cannot be unlocked yet.',
        suggestions: [
          'Check the unlock timestamp on the message',
          'Wait until the unlock time has passed',
          'The countdown timer shows when the message will be available',
        ],
      };
    }

    if (message.includes('decrypt') || message.includes('key') || message.includes('crypto')) {
      return {
        title: 'Decryption Error',
        description: 'Unable to decrypt the message content.',
        suggestions: [
          'Ensure you are using the correct recipient account',
          'The message may have been encrypted for a different address',
          'Check that your wallet has access to the private key',
        ],
      };
    }

    if (message.includes('ipfs') || message.includes('download') || message.includes('cid')) {
      return {
        title: 'Download Error',
        description: 'Failed to download the encrypted message from IPFS.',
        suggestions: [
          'Check your internet connection',
          'IPFS gateways may be temporarily unavailable',
          'Try again in a few moments',
        ],
      };
    }

    if (message.includes('hash') || message.includes('integrity') || message.includes('corrupted')) {
      return {
        title: 'Data Integrity Error',
        description: 'The message data appears to be corrupted or tampered with.',
        suggestions: [
          'The encrypted data may have been modified',
          'Try downloading the message again',
          'Contact the sender to verify the message',
        ],
      };
    }

    if (message.includes('not found') || message.includes('recipient')) {
      return {
        title: 'Message Not Found',
        description: 'This message does not exist or you are not the recipient.',
        suggestions: [
          'Verify the message ID is correct',
          'Ensure you are connected with the recipient account',
          'The message may have been deleted or expired',
        ],
      };
    }

    if (message.includes('playback') || message.includes('media') || message.includes('video') || message.includes('audio')) {
      return {
        title: 'Playback Error',
        description: 'Unable to play the decrypted media.',
        suggestions: [
          'Your browser may not support this media format',
          'Try using a different browser (Chrome, Firefox, or Edge)',
          'Check that your browser supports HTML5 media playback',
        ],
      };
    }

    // Generic error
    return {
      title: 'Unable to Unlock Message',
      description: 'An unexpected error occurred while unlocking this message.',
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Ensure your wallet is connected and unlocked',
      ],
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {errorInfo.title}
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 text-center mb-6">
          {errorInfo.description}
        </p>

        {/* Error Details (collapsible) */}
        <details className="mb-6 bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            Technical Details
          </summary>
          <div className="mt-3 text-sm text-gray-600 font-mono bg-white p-3 rounded border border-gray-200 overflow-auto max-h-40">
            {error.message}
          </div>
        </details>

        {/* Suggestions */}
        <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            What you can try:
          </h3>
          <ul className="space-y-1 text-sm text-blue-800">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
          >
            Back to Dashboard
          </a>
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href="https://github.com/your-repo/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Report this issue
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

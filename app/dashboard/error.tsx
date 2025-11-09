'use client';

import { useEffect } from 'react';

/**
 * Error boundary for the Dashboard page
 * Catches errors from blockchain queries, wallet operations, and message rendering
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Dashboard page error:', error);
  }, [error]);

  // Determine error type and provide specific guidance
  const getErrorMessage = () => {
    const message = error.message.toLowerCase();

    if (message.includes('wallet') || message.includes('extension')) {
      return {
        title: 'Wallet Connection Error',
        description: 'There was a problem with your wallet connection.',
        suggestions: [
          'Check that Talisman extension is unlocked',
          'Refresh the page and reconnect your wallet',
          'Try switching to a different account',
        ],
      };
    }

    if (message.includes('rpc') || message.includes('endpoint') || message.includes('network')) {
      return {
        title: 'Network Connection Error',
        description: 'Unable to connect to the Polkadot network.',
        suggestions: [
          'Check your internet connection',
          'The Westend RPC endpoint may be temporarily unavailable',
          'Try again in a few moments',
        ],
      };
    }

    if (message.includes('query') || message.includes('contract') || message.includes('blockchain')) {
      return {
        title: 'Blockchain Query Error',
        description: 'Failed to retrieve your messages from the blockchain.',
        suggestions: [
          'The blockchain node may be syncing',
          'Try refreshing the page',
          'Check the network status at polkadot.js.org',
        ],
      };
    }

    if (message.includes('decrypt') || message.includes('crypto')) {
      return {
        title: 'Decryption Error',
        description: 'Unable to decrypt one or more messages.',
        suggestions: [
          'Ensure you are using the correct wallet account',
          'The message may have been encrypted for a different account',
          'Try refreshing the page',
        ],
      };
    }

    // Generic error
    return {
      title: 'Dashboard Error',
      description: 'An unexpected error occurred while loading your dashboard.',
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'If the problem persists, try disconnecting and reconnecting your wallet',
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
          <div className="mt-3 text-sm text-gray-600 font-mono bg-white p-3 rounded border border-gray-200 overflow-auto">
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
            href="/"
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
          >
            Go to Home
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

'use client';

/**
 * Error boundary for claim page
 * Requirements: 6.6
 */

import { useEffect } from 'react';

export default function ClaimError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Claim page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Failed to Load Claim Page
          </h2>

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-900 mb-2">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              This could happen if:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>The claim link is invalid or corrupted</li>
              <li>The package has expired</li>
              <li>There was a network error loading the page</li>
              <li>Your browser doesn&apos;t support required features</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={reset}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-center"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

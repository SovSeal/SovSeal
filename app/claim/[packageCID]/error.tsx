"use client";

/**
 * Error boundary for claim page
 */

import { useEffect } from "react";

export default function ClaimError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Claim page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold text-red-600">
            Failed to Load Claim Page
          </h2>

          <div className="mb-6 rounded border border-red-200 bg-red-50 p-4">
            <p className="mb-2 text-sm text-red-900">
              {error.message || "An unexpected error occurred"}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-700">This could happen if:</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              <li>The claim link is invalid or corrupted</li>
              <li>The package has expired</li>
              <li>There was a network error loading the page</li>
              <li>Your browser doesn&apos;t support required features</li>
            </ul>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Try Again
            </button>
            <a
              href="/"
              className="rounded-md border border-gray-300 px-4 py-2 text-center transition-colors hover:bg-gray-50"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

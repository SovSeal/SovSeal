"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary for the entire application
 * Catches critical errors from wallet provider, routing, and unexpected failures
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-xl">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <svg
                  className="h-16 w-16 text-red-600"
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
            <h1 className="mb-3 text-center text-3xl font-bold text-gray-900">
              Application Error
            </h1>

            {/* Error Description */}
            <p className="mb-6 text-center text-gray-600">
              Lockdrop encountered an unexpected error. This may be due to a
              browser compatibility issue or a temporary problem.
            </p>

            {/* Error Details */}
            <details className="mb-6 rounded-lg bg-gray-50 p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Error Details
              </summary>
              <div className="mt-3 max-h-40 overflow-auto rounded border border-gray-200 bg-white p-3 font-mono text-sm text-gray-600">
                {error.message}
              </div>
            </details>

            {/* Suggestions */}
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-blue-900">
                What you can try:
              </h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Refresh the page and try again</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Clear your browser cache and cookies</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Try using a different browser (Chrome, Firefox, or Edge)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Ensure you are using HTTPS or localhost</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                className="w-full rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="w-full rounded-lg bg-gray-200 px-6 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                Return to Home
              </Link>
            </div>

            {/* Help Section */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="mb-2 text-center text-sm text-gray-600">
                <strong>Lockdrop</strong> - Guaranteed by math, not corporations
              </p>
              <p className="text-center text-xs text-gray-500">
                If this problem persists, please{" "}
                <a
                  href="https://github.com/your-repo/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline hover:text-purple-700"
                >
                  report the issue
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

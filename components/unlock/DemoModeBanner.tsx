/**
 * DemoModeBanner - Prominent banner displayed when demo mode is active
 *
 * Requirements: 9.3
 */

"use client";

export function DemoModeBanner() {
  return (
    <div className="bg-yellow-500 border-b-4 border-yellow-600">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          <svg
            className="w-6 h-6 text-yellow-900"
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
          <div className="flex-1 text-center">
            <p className="text-yellow-900 font-bold text-lg">
              ⚠️ DEMO MODE ACTIVE ⚠️
            </p>
            <p className="text-yellow-800 text-sm">
              Timestamp verification is bypassed. This mode is for testing and
              demonstrations only.
            </p>
          </div>
          <svg
            className="w-6 h-6 text-yellow-900"
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
    </div>
  );
}

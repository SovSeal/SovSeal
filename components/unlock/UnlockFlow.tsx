/**
 * UnlockFlow - UI for unlocking and viewing time-locked messages
 *
 * Requirements: 9.1, 9.2, 9.3
 */

"use client";

import { useState, useEffect } from "react";
import { Message } from "@/types/contract";
import { formatDistanceToNow } from "@/utils/dateUtils";
import { UnlockService } from "@/lib/unlock";

interface UnlockFlowProps {
  message: Message;
  onUnlock: (message: Message, demoMode?: boolean) => Promise<void>;
  onClose: () => void;
}

export function UnlockFlow({ message, onUnlock, onClose }: UnlockFlowProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isUnlockable, setIsUnlockable] = useState(false);
  const [demoMode] = useState(UnlockService.isDemoModeEnabled());

  // Calculate time remaining until unlock
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Date.now();
      const unlockTime = message.unlockTimestamp;

      // In demo mode, always show as unlockable
      if (demoMode) {
        setTimeRemaining("Ready to unlock (Demo Mode)");
        setIsUnlockable(true);
        return;
      }

      if (unlockTime <= now) {
        setTimeRemaining("Ready to unlock");
        setIsUnlockable(true);
      } else {
        setTimeRemaining(formatDistanceToNow(unlockTime));
        setIsUnlockable(false);
      }
    };

    // Update immediately
    updateTimeRemaining();

    // Update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [message.unlockTimestamp, demoMode]);

  const handleUnlock = async () => {
    if (!isUnlockable && !demoMode) {
      setError("Message is not yet unlockable");
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      await onUnlock(message, demoMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlock message");
      setIsUnlocking(false);
    }
  };

  const formatAddress = (address: string): string => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Demo Mode Banner */}
        {demoMode && (
          <div className="rounded-t-lg bg-yellow-500 px-6 py-3">
            <div className="flex items-center justify-center gap-2">
              <svg
                className="h-5 w-5 text-yellow-900"
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
              <p className="text-sm font-bold text-yellow-900">
                DEMO MODE - Timestamp verification bypassed
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Unlock Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            disabled={isUnlocking}
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

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Message Metadata */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">From:</span>
              <span className="font-mono text-sm text-gray-900">
                {formatAddress(message.sender)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Created:
              </span>
              <span className="text-sm text-gray-900">
                {formatTimestamp(message.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Unlock Time:
              </span>
              <span className="text-sm text-gray-900">
                {formatTimestamp(message.unlockTimestamp)}
              </span>
            </div>

            {message.metadata && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Type:
                  </span>
                  <span className="text-sm text-gray-900">
                    {message.metadata.mimeType}
                  </span>
                </div>

                {message.metadata.fileSize && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Size:
                    </span>
                    <span className="text-sm text-gray-900">
                      {(message.metadata.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}

                {message.metadata.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Duration:
                    </span>
                    <span className="text-sm text-gray-900">
                      {Math.round(message.metadata.duration)}s
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Countdown Timer or Ready Status */}
          <div className="py-8 text-center">
            {isUnlockable ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <svg
                    className="h-16 w-16 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    Ready to Unlock
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    This message can now be decrypted and viewed
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <svg
                    className="h-16 w-16 text-gray-400"
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
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    Still Locked
                  </p>
                  <p className="mt-2 text-lg text-gray-600">
                    Unlocks {timeRemaining}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Please wait until the unlock time has passed
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start">
                <svg
                  className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    Unlock Failed
                  </p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Unlock Progress */}
          {isUnlocking && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Unlocking Message...
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    Downloading and decrypting content. This may take a moment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
            disabled={isUnlocking}
          >
            Cancel
          </button>
          <button
            onClick={handleUnlock}
            disabled={!isUnlockable || isUnlocking}
            className={`rounded-lg px-6 py-2 font-medium transition-colors ${
              isUnlockable && !isUnlocking
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {isUnlocking ? "Unlocking..." : "Unlock & View"}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

const WARNING_STORAGE_KEY = 'lockdrop_key_backup_warning_shown';

export function KeyBackupWarning() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if warning has been shown before
    const hasShown = localStorage.getItem(WARNING_STORAGE_KEY);
    if (!hasShown) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(WARNING_STORAGE_KEY, 'true');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-600"
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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Important: Back Up Your Keys
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Your wallet keys are the ONLY way to decrypt your messages.</strong>
              </p>
              <p>
                If you lose access to your Talisman wallet or forget your password, your Lockdrop messages will be permanently inaccessible.
              </p>
              <p className="font-semibold text-yellow-700">
                Please ensure you have backed up your wallet recovery phrase in a secure location.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-600">
            💡 Tip: Store your recovery phrase offline in multiple secure locations. Never share it with anyone.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}

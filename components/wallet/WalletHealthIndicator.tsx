'use client';

import React from 'react';
import { useWallet } from '@/lib/wallet/WalletProvider';

/**
 * Component that displays wallet health status and provides reconnection option
 * Shows a warning banner when wallet extension becomes unavailable
 */
export function WalletHealthIndicator() {
  const { isConnected, isHealthy, reconnect } = useWallet();
  const [isReconnecting, setIsReconnecting] = React.useState(false);

  // Don't show anything if not connected
  if (!isConnected) {
    return null;
  }

  // Don't show anything if healthy
  if (isHealthy) {
    return null;
  }

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await reconnect();
    } catch (error) {
      console.error('Reconnection failed:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-orange-500 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 animate-pulse"
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
          <div>
            <p className="font-semibold">Wallet Extension Unavailable</p>
            <p className="text-sm opacity-90">
              Talisman extension may be disabled or locked
            </p>
          </div>
        </div>

        <button
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </button>
      </div>
    </div>
  );
}

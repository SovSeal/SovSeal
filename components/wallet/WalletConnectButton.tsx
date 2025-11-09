'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/wallet/WalletProvider';
import { Tooltip } from '@/components/ui';

export function WalletConnectButton() {
  const { isConnected, address, disconnect, connect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    setShowInstallInstructions(false);
    setHasAttemptedConnection(true);

    try {
      await connect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      
      // Show installation instructions if extension not found
      if (errorMessage.toLowerCase().includes('not found') || 
          errorMessage.toLowerCase().includes('install') ||
          errorMessage.toLowerCase().includes('not authorized')) {
        setShowInstallInstructions(true);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setError(null);
    setShowInstallInstructions(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip content={`Connected: ${address}`} position="bottom">
          <div className="px-2 md:px-4 py-2 bg-green-100 rounded-lg">
            <span className="text-xs md:text-sm font-mono text-green-800">
              {formatAddress(address)}
            </span>
          </div>
        </Tooltip>
        <button
          onClick={handleDisconnect}
          className="px-2 md:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs md:text-sm"
          aria-label="Disconnect wallet"
        >
          <span className="hidden md:inline">Disconnect</span>
          <span className="md:hidden">✕</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Tooltip content="Connect your Talisman wallet to get started" position="bottom">
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-3 md:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-xs md:text-sm touch-target"
          aria-label="Connect Talisman wallet"
        >
          <span className="hidden md:inline">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          <span className="md:hidden">{isConnecting ? '...' : 'Connect'}</span>
        </button>
      </Tooltip>

      {/* Error and install instructions in a dropdown/modal style */}
      {(error || showInstallInstructions) && hasAttemptedConnection && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg shadow-lg mb-2">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {showInstallInstructions && (
            <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg shadow-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Install Talisman Wallet
              </h3>
              <p className="text-sm text-blue-800 mb-3">
                Talisman is required to use FutureProof. Install the browser extension to continue.
              </p>
              <a
                href="https://www.talisman.xyz/download"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                Download Talisman →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

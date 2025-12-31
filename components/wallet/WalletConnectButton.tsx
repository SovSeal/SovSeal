"use client";

import React, { useState } from "react";
import { useWallet } from "@/lib/wallet/WalletProvider";
import { Tooltip } from "@/components/ui";
import { WalletIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      if (
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("install") ||
        errorMessage.toLowerCase().includes("not authorized")
      ) {
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

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Tooltip content={`Connected: ${address}`} position="bottom">
          <div className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2">
            <span className="font-mono text-xs text-brand-400 sm:text-sm">
              {formatAddress(address)}
            </span>
          </div>
        </Tooltip>
        <button
          onClick={handleDisconnect}
          className="rounded-lg p-2 text-dark-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          aria-label="Disconnect wallet"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Tooltip
        content="Connect your wallet (Talisman recommended)"
        position="bottom"
      >
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
          aria-label="Connect wallet"
        >
          <WalletIcon className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isConnecting ? "Connecting..." : "Connect"}
          </span>
        </button>
      </Tooltip>

      {(error || showInstallInstructions) && hasAttemptedConnection && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-fade-in">
          {error && (
            <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {showInstallInstructions && (
            <div className="card-glass p-4">
              <h3 className="mb-2 font-semibold text-dark-100">
                Install a Wallet
              </h3>
              <p className="mb-3 text-sm text-dark-400">
                SovSeal works best with Talisman wallet.
              </p>
              <div className="space-y-2">
                <a
                  href="https://www.talisman.xyz/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary block text-center text-sm"
                >
                  Download Talisman →
                </a>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary block text-center text-sm"
                >
                  Download MetaMask →
                </a>
              </div>
              <p className="mt-3 text-xs text-dark-500">
                ⚠️ Use an Ethereum account (0x...), not Polkadot (5...)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

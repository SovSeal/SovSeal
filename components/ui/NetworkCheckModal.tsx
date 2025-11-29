"use client";

import { useState } from "react";
import { useNetworkCheck, PASSET_HUB_CONFIG } from "@/hooks/useNetworkCheck";
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface NetworkCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNetworkReady: () => void;
}

/**
 * Modal that blocks message creation until user switches to correct network.
 * Provides one-click network switching for supported wallets.
 */
export function NetworkCheckModal({ isOpen, onClose, onNetworkReady }: NetworkCheckModalProps) {
  const { currentChainName, switchToPassetHub, checkNetwork } = useNetworkCheck();
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitch = async () => {
    setIsSwitching(true);
    setError(null);

    try {
      const success = await switchToPassetHub();
      if (success) {
        // Double-check the network after switch
        await checkNetwork();
        onNetworkReady();
      } else {
        setError("Failed to switch network. Please switch manually in your wallet.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch network");
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md animate-fade-in rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-dark-400 transition-colors hover:bg-dark-800 hover:text-dark-200"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
          <ExclamationTriangleIcon className="h-7 w-7 text-amber-400" />
        </div>

        {/* Content */}
        <h2 className="mb-2 text-center font-display text-xl font-bold text-dark-100">
          Wrong Network
        </h2>
        <p className="mb-6 text-center text-sm text-dark-400">
          You&apos;re currently connected to{" "}
          <span className="font-medium text-dark-200">{currentChainName || "an unknown network"}</span>.
          <br />
          Please switch to{" "}
          <span className="font-medium text-brand-400">{PASSET_HUB_CONFIG.chainName}</span> to create
          time-locked messages.
        </p>

        {/* Network details */}
        <div className="mb-6 rounded-lg border border-dark-700 bg-dark-800/50 p-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-dark-500">
            Required Network
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-400">Network</span>
              <span className="font-medium text-dark-200">{PASSET_HUB_CONFIG.chainName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-400">Chain ID</span>
              <span className="font-mono text-dark-200">{PASSET_HUB_CONFIG.chainId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-400">Currency</span>
              <span className="text-dark-200">{PASSET_HUB_CONFIG.nativeCurrency.symbol}</span>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleSwitch}
            disabled={isSwitching}
            className="btn-primary flex flex-1 items-center justify-center gap-2"
          >
            {isSwitching ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-4 w-4" />
                Switch Network
              </>
            )}
          </button>
        </div>

        {/* Manual instructions */}
        <p className="mt-4 text-center text-xs text-dark-500">
          If automatic switching doesn&apos;t work, manually add the network in your wallet settings.
        </p>
      </div>
    </div>
  );
}

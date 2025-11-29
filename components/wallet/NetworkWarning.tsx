"use client";

import { useNetworkCheck, PASSET_HUB_CONFIG } from "@/hooks/useNetworkCheck";
import { useWallet } from "@/lib/wallet/WalletProvider";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

/**
 * Displays a warning banner when the user is connected to the wrong network.
 * Shows after wallet connection if not on Passet Hub testnet.
 */
export function NetworkWarning() {
  const { isConnected } = useWallet();
  const { isCorrectNetwork, currentChainName, isChecking, switchToPassetHub } = useNetworkCheck();

  // Don't show if not connected or on correct network
  if (!isConnected || isCorrectNetwork || isChecking) {
    return null;
  }

  const handleSwitch = async () => {
    await switchToPassetHub();
  };

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-400" />
          <div className="text-sm">
            <span className="font-medium text-amber-300">Wrong Network: </span>
            <span className="text-amber-200/80">
              You&apos;re on {currentChainName || "an unknown network"}. Switch to{" "}
              <span className="font-medium">{PASSET_HUB_CONFIG.chainName}</span> to create messages.
            </span>
          </div>
        </div>
        <button
          onClick={handleSwitch}
          className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1.5 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/30"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Switch Network
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export type WalletType = "talisman" | "metamask";

interface WalletOption {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  recommended?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "talisman",
    name: "Talisman",
    description: "Recommended for Polkadot ecosystem",
    icon: "🦑",
    recommended: true,
  },
  {
    id: "metamask",
    name: "MetaMask",
    description: "Popular Ethereum wallet",
    icon: "🦊",
  },
];

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletType: WalletType) => void;
  availableWallets: WalletType[];
}

export function WalletSelector({
  isOpen,
  onClose,
  onSelect,
  availableWallets,
}: WalletSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card-glass w-full max-w-md p-6 animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-100">
            Select Wallet
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-400 hover:bg-dark-700 hover:text-dark-200"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-dark-400">
          Choose which wallet you&apos;d like to connect with:
        </p>

        <div className="space-y-3">
          {WALLET_OPTIONS.map((wallet) => {
            const isAvailable = availableWallets.includes(wallet.id);
            return (
              <button
                key={wallet.id}
                onClick={() => isAvailable && onSelect(wallet.id)}
                disabled={!isAvailable}
                className={`w-full rounded-lg border p-4 text-left transition-all ${isAvailable
                    ? "border-slate-500/20 bg-dark-800/50 hover:border-brand-500/30 hover:bg-dark-700/50"
                    : "cursor-not-allowed border-dark-800 bg-dark-900/50 opacity-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dark-100">
                        {wallet.name}
                      </span>
                      {wallet.recommended && isAvailable && (
                        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-400">
                          Recommended
                        </span>
                      )}
                      {!isAvailable && (
                        <span className="rounded-full bg-dark-700 px-2 py-0.5 text-xs text-dark-500">
                          Not installed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-400">{wallet.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 border-t border-slate-500/20 pt-4">
          <p className="text-xs text-dark-500">
            Don&apos;t have a wallet?{" "}
            <a
              href="https://www.talisman.xyz/download"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:underline"
            >
              Download Talisman
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Passet Hub Testnet configuration
 * Chain ID verified via: curl -X POST -H "Content-Type: application/json" \
 *   --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
 *   https://testnet-passet-hub-eth-rpc.polkadot.io
 * Returns: 0x190f1b46 = 420420422
 */
export const PASSET_HUB_CONFIG = {
  chainId: 420420422,
  chainIdHex: "0x190f1b46",
  chainName: "Passet Hub Testnet",
  rpcUrl: "https://testnet-passet-hub-eth-rpc.polkadot.io",
  nativeCurrency: {
    name: "PAS",
    symbol: "PAS",
    decimals: 12,
  },
  blockExplorerUrl: "", // No explorer yet
};

export interface NetworkCheckResult {
  isCorrectNetwork: boolean;
  currentChainId: number | null;
  currentChainName: string | null;
  isChecking: boolean;
  error: string | null;
}

/**
 * Hook to check if the user's wallet is connected to Passet Hub testnet
 */
export function useNetworkCheck() {
  const [result, setResult] = useState<NetworkCheckResult>({
    isCorrectNetwork: false,
    currentChainId: null,
    currentChainName: null,
    isChecking: true,
    error: null,
  });

  const checkNetwork = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setResult({
        isCorrectNetwork: false,
        currentChainId: null,
        currentChainName: null,
        isChecking: false,
        error: "No wallet detected",
      });
      return;
    }

    try {
      setResult((prev) => ({ ...prev, isChecking: true, error: null }));

      const chainIdHex = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      const chainId = parseInt(chainIdHex, 16);
      const isCorrect = chainId === PASSET_HUB_CONFIG.chainId;

      // Try to get a friendly name for common networks
      const chainName = getChainName(chainId);

      setResult({
        isCorrectNetwork: isCorrect,
        currentChainId: chainId,
        currentChainName: chainName,
        isChecking: false,
        error: null,
      });
    } catch (error) {
      setResult({
        isCorrectNetwork: false,
        currentChainId: null,
        currentChainName: null,
        isChecking: false,
        error: error instanceof Error ? error.message : "Failed to check network",
      });
    }
  }, []);

  const switchToPassetHub = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !window.ethereum) {
      return false;
    }

    try {
      // First try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: PASSET_HUB_CONFIG.chainIdHex }],
      });
      await checkNetwork();
      return true;
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: PASSET_HUB_CONFIG.chainIdHex,
                chainName: PASSET_HUB_CONFIG.chainName,
                rpcUrls: [PASSET_HUB_CONFIG.rpcUrl],
                nativeCurrency: PASSET_HUB_CONFIG.nativeCurrency,
              },
            ],
          });
          await checkNetwork();
          return true;
        } catch (addError) {
          console.error("Failed to add Passet Hub network:", addError);
          return false;
        }
      }
      console.error("Failed to switch network:", switchError);
      return false;
    }
  }, [checkNetwork]);

  // Check network on mount and listen for changes
  useEffect(() => {
    checkNetwork();

    if (typeof window !== "undefined" && window.ethereum?.on) {
      const handleChainChanged = () => {
        checkNetwork();
      };

      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, [checkNetwork]);

  return {
    ...result,
    checkNetwork,
    switchToPassetHub,
    expectedChainId: PASSET_HUB_CONFIG.chainId,
    expectedChainName: PASSET_HUB_CONFIG.chainName,
  };
}

/**
 * Get a friendly name for common chain IDs
 */
function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum Mainnet",
    5: "Goerli Testnet",
    11155111: "Sepolia Testnet",
    137: "Polygon Mainnet",
    80001: "Polygon Mumbai",
    420420422: "Passet Hub Testnet",
    31337: "Hardhat Local",
  };
  return chains[chainId] || `Unknown Network (${chainId})`;
}

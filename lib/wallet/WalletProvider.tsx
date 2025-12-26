"use client";

/**
 * WalletProvider - Ethereum wallet connection using EIP-1193 (window.ethereum)
 *
 * Supports MetaMask and Talisman Ethereum accounts with wallet selection
 * Returns Ethereum addresses (0x...) compatible with ethers.js and Passet Hub
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { WalletState, WalletContextValue } from "@/types/wallet";
import { withTimeout, TIMEOUTS, TimeoutError } from "@/utils/timeout";
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";
import { AppStorage, STORAGE_KEYS } from "@/utils/storage";
import { INTERVALS } from "@/utils/constants";
import { WalletSelector, WalletType } from "@/components/wallet/WalletSelector";

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const LOG_CONTEXT = "WalletProvider";

interface WalletProviderProps {
  children: React.ReactNode;
}

// EIP-1193 Provider interface
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    handler: (...args: unknown[]) => void
  ) => void;
  isMetaMask?: boolean;
  isTalisman?: boolean;
}

// Extended window interface for multiple wallet providers
interface WindowWithProviders extends Window {
  ethereum?: EthereumProvider;
  talismanEth?: EthereumProvider;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
    talismanEth?: EthereumProvider;
  }
}

/**
 * Detect which wallet providers are available
 */
function detectAvailableWallets(): WalletType[] {
  if (typeof window === "undefined") return [];
  
  const wallets: WalletType[] = [];
  const win = window as WindowWithProviders;
  
  // Check for Talisman (has dedicated talismanEth or isTalisman flag)
  if (win.talismanEth || win.ethereum?.isTalisman) {
    wallets.push("talisman");
  }
  
  // Check for MetaMask (has isMetaMask flag but not isTalisman)
  if (win.ethereum?.isMetaMask && !win.ethereum?.isTalisman) {
    wallets.push("metamask");
  }
  
  // If only ethereum exists without specific flags, assume it's MetaMask-compatible
  if (win.ethereum && wallets.length === 0) {
    wallets.push("metamask");
  }
  
  return wallets;
}

/**
 * Get the provider for a specific wallet type
 */
function getProviderForWallet(walletType: WalletType): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  
  const win = window as WindowWithProviders;
  
  if (walletType === "talisman") {
    // Prefer dedicated talismanEth provider if available
    if (win.talismanEth) return win.talismanEth;
    // Fall back to ethereum if it's Talisman
    if (win.ethereum?.isTalisman) return win.ethereum;
  }
  
  if (walletType === "metamask") {
    // Use ethereum if it's MetaMask (and not Talisman)
    if (win.ethereum?.isMetaMask && !win.ethereum?.isTalisman) {
      return win.ethereum;
    }
    // Fall back to generic ethereum
    if (win.ethereum && !win.ethereum.isTalisman) {
      return win.ethereum;
    }
  }
  
  return null;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const isInitialMount = useRef(true);
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    accounts: [],
    selectedAccount: null,
  });
  const [isHealthy, setIsHealthy] = useState(true);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([]);
  const [activeProvider, setActiveProvider] = useState<EthereumProvider | null>(null);
  const connectionListeners = useRef<Set<(connected: boolean) => void>>(
    new Set()
  );
  const pendingConnectionResolve = useRef<((walletType: WalletType) => void) | null>(null);

  // Try to restore wallet connection on mount
  useEffect(() => {
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    const attemptReconnect = async () => {
      try {
        // Check if wallet was previously connected
        const stored = AppStorage.get<{ wasConnected: boolean }>(
          STORAGE_KEYS.WALLET_CONNECTION
        );
        if (!stored?.wasConnected) return;

        // Check if ethereum provider is available
        if (typeof window === "undefined" || !window.ethereum) return;

        // Try to get accounts without triggering popup
        const accounts = (await window.ethereum.request({
          method: "eth_accounts",
        })) as string[];

        if (accounts && accounts.length > 0) {
          ErrorLogger.info(LOG_CONTEXT, "Restoring previous connection");

          const walletName = window.ethereum.isTalisman
            ? "Talisman"
            : window.ethereum.isMetaMask
              ? "MetaMask"
              : "Ethereum Wallet";

          const selectedAddress = accounts[0];
          const selectedAccount = {
            address: selectedAddress,
            meta: {
              name: `${walletName} Account`,
              source: walletName,
            },
            type: "ethereum" as const,
          };

          const allAccounts = accounts.map((addr, index) => ({
            address: addr,
            meta: {
              name: `${walletName} Account ${index + 1}`,
              source: walletName,
            },
            type: "ethereum" as const,
          }));

          setState({
            isConnected: true,
            address: selectedAddress,
            accounts: allAccounts,
            selectedAccount,
          });

          setIsHealthy(true);
        }
      } catch (error) {
        ErrorLogger.debug(LOG_CONTEXT, "Could not restore connection", {
          error: error instanceof Error ? error.message : String(error),
        });
        // Clear invalid stored state
        AppStorage.remove(STORAGE_KEYS.WALLET_CONNECTION);
      }
    };

    attemptReconnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      ErrorLogger.info(LOG_CONTEXT, "Accounts changed", { count: accountsArray.length });

      if (accountsArray.length === 0) {
        // User disconnected wallet
        disconnect();
      } else if (state.isConnected && accountsArray[0] !== state.address) {
        // Account switched
        const newAddress = accountsArray[0];
        setState((prev) => ({
          ...prev,
          address: newAddress,
          selectedAccount: {
            address: newAddress,
            meta: {
              name: "Ethereum Account",
              source: window.ethereum?.isMetaMask ? "MetaMask" : "Talisman",
            },
            type: "ethereum",
          },
        }));
      }
    };

    const handleChainChanged = () => {
      ErrorLogger.info(LOG_CONTEXT, "Chain changed, reloading...");
      window.location.reload();
    };

    if (window.ethereum.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isConnected, state.address]);

  const connect = useCallback(async (preferredAddress?: string) => {
    try {
      // Detect available wallets
      const wallets = detectAvailableWallets();
      setAvailableWallets(wallets);
      
      if (wallets.length === 0) {
        throw new Error(
          "No Ethereum wallet detected. Please install Talisman wallet extension (recommended) or MetaMask as an alternative."
        );
      }

      let selectedWalletType: WalletType;
      
      // If multiple wallets available, show selector
      if (wallets.length > 1) {
        ErrorLogger.info(LOG_CONTEXT, "Multiple wallets detected, showing selector", { wallets });
        
        // Show wallet selector and wait for user choice
        selectedWalletType = await new Promise<WalletType>((resolve) => {
          pendingConnectionResolve.current = resolve;
          setShowWalletSelector(true);
        });
        
        setShowWalletSelector(false);
        pendingConnectionResolve.current = null;
      } else {
        // Only one wallet, use it directly
        selectedWalletType = wallets[0];
      }
      
      // Get the provider for the selected wallet
      const provider = getProviderForWallet(selectedWalletType);
      if (!provider) {
        throw new Error(`Failed to get provider for ${selectedWalletType}`);
      }
      
      setActiveProvider(provider);
      
      const walletName = selectedWalletType === "talisman" ? "Talisman" : "MetaMask";
      ErrorLogger.info(LOG_CONTEXT, `Connecting to ${walletName}...`);

      // Request accounts (triggers wallet popup)
      const accounts = await withTimeout(
        provider.request({ method: "eth_requestAccounts" }) as Promise<string[]>,
        TIMEOUTS.WALLET_ENABLE,
        "Request Ethereum accounts"
      );

      ErrorLogger.info(LOG_CONTEXT, `Found ${accounts.length} Ethereum account(s)`);

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No Ethereum accounts found. Please create an Ethereum account in your wallet."
        );
      }

      // Select account
      const selectedAddress =
        preferredAddress && accounts.includes(preferredAddress)
          ? preferredAddress
          : accounts[0];

      const selectedAccount = {
        address: selectedAddress,
        meta: {
          name: `${walletName} Account`,
          source: walletName,
        },
        type: "ethereum" as const,
      };

      // Convert all accounts to the format expected by the app
      const allAccounts = accounts.map((addr, index) => ({
        address: addr,
        meta: {
          name: `${walletName} Account ${index + 1}`,
          source: walletName,
        },
        type: "ethereum" as const,
      }));

      ErrorLogger.info(LOG_CONTEXT, "Successfully connected", { 
        address: selectedAddress,
        wallet: walletName 
      });

      setState({
        isConnected: true,
        address: selectedAddress,
        accounts: allAccounts,
        selectedAccount,
      });

      // Persist connection state with wallet type
      AppStorage.set(STORAGE_KEYS.WALLET_CONNECTION, { 
        wasConnected: true,
        walletType: selectedWalletType 
      });

      setIsHealthy(true);
    } catch (error) {
      ErrorLogger.error(
        error instanceof Error ? error : new Error(String(error)),
        LOG_CONTEXT,
        { operation: "connect" }
      );

      if (error instanceof TimeoutError) {
        throw new Error(
          "Wallet connection timed out. Please ensure your wallet extension is unlocked and responsive."
        );
      }

      if (error instanceof Error) {
        // User rejected the request
        if (
          error.message.includes("User rejected") ||
          error.message.includes("User denied")
        ) {
          throw new Error(
            "Connection rejected. Please approve the connection request in your wallet."
          );
        }
        throw error;
      }

      // Handle RPC error codes
      const rpcError = error as { code?: number };
      if (rpcError?.code === -32002) {
        throw new Error(
          "A wallet connection request is already pending. Please check for a hidden popup window, or refresh the page and try again."
        );
      }

      throw new Error("Failed to connect wallet. Please try again.");
    }
  }, []);

  // Handle wallet selection from modal
  const handleWalletSelect = useCallback((walletType: WalletType) => {
    if (pendingConnectionResolve.current) {
      pendingConnectionResolve.current(walletType);
    }
  }, []);

  // Handle wallet selector close
  const handleWalletSelectorClose = useCallback(() => {
    setShowWalletSelector(false);
    if (pendingConnectionResolve.current) {
      // Reject the connection by selecting the first available wallet
      // This will be caught as an error if user closes without selecting
      pendingConnectionResolve.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    ErrorLogger.info(LOG_CONTEXT, "Disconnecting wallet");
    setState({
      isConnected: false,
      address: null,
      accounts: [],
      selectedAccount: null,
    });
    AppStorage.remove(STORAGE_KEYS.WALLET_CONNECTION);
  }, []);

  const selectAccount = useCallback(
    (address: string) => {
      const account = state.accounts.find((acc) => acc.address === address);
      if (account) {
        setState((prev) => ({
          ...prev,
          address: account.address,
          selectedAccount: account,
        }));
      }
    },
    [state.accounts]
  );

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!state.selectedAccount) {
        throw new Error("No account selected");
      }

      // Use active provider or fall back to window.ethereum
      const provider = activeProvider || window.ethereum;
      if (!provider) {
        throw new Error("Ethereum wallet not available");
      }

      try {
        ErrorLogger.debug(LOG_CONTEXT, "Requesting message signature...");

        // Convert message to hex
        const messageHex = "0x" + Buffer.from(message, "utf8").toString("hex");

        // Request signature using personal_sign (EIP-191)
        const signature = await withTimeout(
          provider.request({
            method: "personal_sign",
            params: [messageHex, state.selectedAccount.address],
          }) as Promise<string>,
          TIMEOUTS.WALLET_SIGN,
          "Sign message"
        );

        ErrorLogger.debug(LOG_CONTEXT, "Message signed successfully");
        return signature;
      } catch (error) {
        ErrorLogger.error(
          error instanceof Error ? error : new Error(String(error)),
          LOG_CONTEXT,
          { operation: "signMessage" }
        );

        if (error instanceof TimeoutError) {
          throw new Error(
            "Message signing timed out. Please check your wallet extension and try again."
          );
        }

        if (error instanceof Error && error.message.includes("User rejected")) {
          throw new Error(
            "Signature rejected. Please approve the signature request in your wallet."
          );
        }

        throw error;
      }
    },
    [state.selectedAccount, activeProvider]
  );

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined") return false;
      return !!window.ethereum;
    } catch {
      return false;
    }
  }, []);

  const reconnect = useCallback(async () => {
    ErrorLogger.info(LOG_CONTEXT, "Manual reconnection triggered");
    const previousAddress = state.address;
    disconnect();
    // Brief delay to ensure clean disconnect before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 500));
    await connect(previousAddress || undefined);
  }, [connect, disconnect, state.address]);

  const onConnectionChange = useCallback(
    (listener: (connected: boolean) => void): (() => void) => {
      connectionListeners.current.add(listener);
      listener(state.isConnected);
      return () => connectionListeners.current.delete(listener);
    },
    [state.isConnected]
  );

  // Notify listeners when connection state changes
  useEffect(() => {
    connectionListeners.current.forEach((listener) => {
      try {
        listener(state.isConnected);
      } catch (error) {
        console.error("Error in wallet connection listener:", error);
      }
    });
  }, [state.isConnected]);

  // Periodic health check with visibility API optimization
  useEffect(() => {
    if (!state.isConnected) {
      setIsHealthy(true);
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let isPageVisible = !document.hidden;

    const performHealthCheck = async () => {
      // Skip health checks when page is not visible
      if (!isPageVisible) return;

      const healthy = await checkHealth();
      setIsHealthy(healthy);

      if (!healthy) {
        ErrorLogger.warn(LOG_CONTEXT, "Health check failed - wallet may be unavailable");
      }
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        // Perform immediate health check when page becomes visible
        performHealthCheck();
      }
    };

    // Listen for visibility changes to pause/resume health checks
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial health check
    performHealthCheck();

    // Set up interval for periodic checks
    intervalId = setInterval(performHealthCheck, INTERVALS.HEALTH_CHECK);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state.isConnected, checkHealth]);

  const value: WalletContextValue = {
    ...state,
    connect,
    disconnect,
    selectAccount,
    signMessage,
    isHealthy,
    checkHealth,
    reconnect,
    onConnectionChange,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletSelector
        isOpen={showWalletSelector}
        onClose={handleWalletSelectorClose}
        onSelect={handleWalletSelect}
        availableWallets={availableWallets}
      />
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

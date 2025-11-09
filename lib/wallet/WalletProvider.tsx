"use client";

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

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const STORAGE_KEY = "futureproof_wallet_connection";
const APP_NAME = "FutureProof";

interface WalletProviderProps {
  children: React.ReactNode;
}

// Pre-load extension modules to avoid dynamic imports during connection
type ExtensionModules = {
  web3Enable?: typeof import("@polkadot/extension-dapp").web3Enable;
  web3Accounts?: typeof import("@polkadot/extension-dapp").web3Accounts;
  web3FromAddress?: typeof import("@polkadot/extension-dapp").web3FromAddress;
  stringToHex?: typeof import("@polkadot/util").stringToHex;
};

// Use window object to survive Fast Refresh module reloads
declare global {
  interface Window {
    __futureproof_extension_cache?: ExtensionModules;
  }
}

function getExtensionCache(): ExtensionModules {
  if (typeof window === 'undefined') return {};
  
  if (!window.__futureproof_extension_cache) {
    window.__futureproof_extension_cache = {};
    
    // Preload modules asynchronously
    Promise.all([import("@polkadot/extension-dapp"), import("@polkadot/util")])
      .then(([dapp, util]) => {
        if (window.__futureproof_extension_cache) {
          window.__futureproof_extension_cache.web3Enable = dapp.web3Enable;
          window.__futureproof_extension_cache.web3Accounts = dapp.web3Accounts;
          window.__futureproof_extension_cache.web3FromAddress = dapp.web3FromAddress;
          window.__futureproof_extension_cache.stringToHex = util.stringToHex;
        }
      })
      .catch((err) => {
        console.warn("Failed to preload extension modules:", err);
      });
  }
  
  return window.__futureproof_extension_cache;
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
  const connectionListeners = useRef<Set<(connected: boolean) => void>>(
    new Set()
  );

  // Clear any persisted connection data on mount for security
  // Users must connect wallet each session
  useEffect(() => {
    // Only run on initial mount to prevent Fast Refresh issues
    if (!isInitialMount.current) return;
    isInitialMount.current = false;

    // Always clear persisted connection for security
    // Wallet must be reconnected each session to ensure it's unlocked
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Validate wallet is still accessible when window gains focus
  useEffect(() => {
    if (!state.isConnected || !state.selectedAccount) return;

    const handleFocus = async () => {
      try {
        // Use cached module or dynamic import
        let web3Accounts = getExtensionCache().web3Accounts;
        if (!web3Accounts) {
          const dapp = await import("@polkadot/extension-dapp");
          web3Accounts = dapp.web3Accounts;
        }

        const accounts = await web3Accounts();

        // Check if wallet is locked (no accounts returned)
        if (accounts.length === 0) {
          console.warn("Wallet appears to be locked - disconnecting");
          setState({
            isConnected: false,
            address: null,
            accounts: [],
            selectedAccount: null,
          });
          localStorage.removeItem(STORAGE_KEY);
          return;
        }

        // Check if our account still exists
        const accountExists = accounts.some(
          (acc) => acc.address === state.selectedAccount!.address
        );
        if (!accountExists) {
          console.warn("Connected account no longer available - disconnecting");
          setState({
            isConnected: false,
            address: null,
            accounts: [],
            selectedAccount: null,
          });
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.warn("Wallet validation failed - disconnecting:", error);
        setState({
          isConnected: false,
          address: null,
          accounts: [],
          selectedAccount: null,
        });
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [state.isConnected, state.selectedAccount]);

  // Periodic health check to detect locked wallet
  useEffect(() => {
    if (!state.isConnected || !state.selectedAccount) return;

    const checkWalletHealth = async () => {
      try {
        let web3Accounts = getExtensionCache().web3Accounts;
        if (!web3Accounts) {
          const dapp = await import("@polkadot/extension-dapp");
          web3Accounts = dapp.web3Accounts;
        }

        const accounts = await web3Accounts();

        if (accounts.length === 0) {
          console.warn("Wallet health check failed - wallet appears locked");
          setIsHealthy(false);
          setState({
            isConnected: false,
            address: null,
            accounts: [],
            selectedAccount: null,
          });
          localStorage.removeItem(STORAGE_KEY);
        } else {
          setIsHealthy(true);
        }
      } catch (error) {
        console.warn("Wallet health check error:", error);
        setIsHealthy(false);
      }
    };

    // Check immediately
    checkWalletHealth();

    // Then check every 30 seconds
    const interval = setInterval(checkWalletHealth, 30000);
    return () => clearInterval(interval);
  }, [state.isConnected, state.selectedAccount]);

  const connect = useCallback(async (preferredAddress?: string) => {
    const MAX_RETRIES = 2; // 2 retries = 3 total attempts
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Add exponential backoff delay for retries
        if (attempt > 0) {
          const delay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s
          console.log(
            `Retrying wallet connection (attempt ${attempt + 1}/${MAX_RETRIES + 1}) after ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Use cached modules or dynamic import as fallback
        let web3Enable = getExtensionCache().web3Enable;
        let web3Accounts = getExtensionCache().web3Accounts;

        if (!web3Enable || !web3Accounts) {
          const dapp = await import("@polkadot/extension-dapp");
          web3Enable = dapp.web3Enable;
          web3Accounts = dapp.web3Accounts;
          getExtensionCache().web3Enable = web3Enable;
          getExtensionCache().web3Accounts = web3Accounts;
        }

        // Check if extension is available first (without timeout for detection)
        if (typeof window !== "undefined" && !(window as any).injectedWeb3) {
          // Wait a bit for extension to inject
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Enable the extension with timeout
        console.log("Attempting to enable Polkadot extensions...");
        const extensions = await withTimeout(
          web3Enable(APP_NAME),
          TIMEOUTS.WALLET_ENABLE,
          "Enable Talisman extension"
        );

        console.log(
          `Found ${extensions.length} extension(s):`,
          extensions.map((e) => e.name)
        );

        if (extensions.length === 0) {
          // Check if injectedWeb3 exists to give better error message
          const hasInjected =
            typeof window !== "undefined" && (window as any).injectedWeb3;
          const errorMsg = hasInjected
            ? "Polkadot extension found but not authorized. Please authorize FutureProof in your Talisman settings."
            : "No Polkadot extension detected. Please install Talisman wallet extension and refresh the page.";
          throw new Error(errorMsg);
        }

        // Get all accounts with timeout
        console.log("Fetching accounts from wallet...");
        const allAccounts = await withTimeout(
          web3Accounts(),
          TIMEOUTS.WALLET_ACCOUNTS,
          "Fetch wallet accounts"
        );

        console.log(`Found ${allAccounts.length} account(s)`);

        if (allAccounts.length === 0) {
          throw new Error(
            "No accounts found in Talisman wallet. Please create an account first."
          );
        }

        // Select account (preferred or first)
        let selectedAccount = allAccounts[0];
        if (preferredAddress) {
          const found = allAccounts.find(
            (acc) => acc.address === preferredAddress
          );
          if (found) {
            selectedAccount = found;
          }
        }

        // Update state
        console.log(
          "Successfully connected to wallet:",
          selectedAccount.address
        );
        setState({
          isConnected: true,
          address: selectedAccount.address,
          accounts: allAccounts,
          selectedAccount,
        });

        // Note: We no longer persist connection to localStorage for security
        // Users must reconnect each session to ensure wallet is unlocked

        // Success - exit retry loop
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // Don't retry on user-facing errors (extension not found, no accounts)
        const errorMsg = lastError.message.toLowerCase();
        if (
          errorMsg.includes("not found") ||
          errorMsg.includes("not authorized") ||
          errorMsg.includes("no accounts")
        ) {
          throw lastError; // Fail fast on non-retryable errors
        }

        // Log retry-worthy errors
        if (attempt < MAX_RETRIES) {
          console.warn(
            `Wallet connection attempt ${attempt + 1} failed:`,
            lastError.message
          );
        }
      }
    }

    // All retries exhausted
    if (lastError instanceof TimeoutError) {
      throw new Error(
        "Wallet connection timed out after multiple attempts. Please ensure Talisman extension is unlocked and responsive."
      );
    }
    throw new Error(
      `Wallet connection failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`
    );
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      accounts: [],
      selectedAccount: null,
    });
    localStorage.removeItem(STORAGE_KEY);
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

        // Note: We no longer persist connection to localStorage for security
      }
    },
    [state.accounts]
  );

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!state.selectedAccount) {
        throw new Error("No account selected");
      }

      // Validate wallet is accessible before signing
      try {
        let web3Accounts = getExtensionCache().web3Accounts;
        if (!web3Accounts) {
          const dapp = await import("@polkadot/extension-dapp");
          web3Accounts = dapp.web3Accounts;
        }

        const accounts = await web3Accounts();
        if (accounts.length === 0) {
          disconnect();
          throw new Error(
            "Wallet is locked. Please unlock Talisman and reconnect."
          );
        }

        const accountExists = accounts.some(
          (acc) => acc.address === state.selectedAccount?.address
        );
        if (!accountExists) {
          disconnect();
          throw new Error(
            "Account no longer available. Please reconnect your wallet."
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("Wallet is locked") ||
            error.message.includes("Account no longer"))
        ) {
          throw error;
        }
        disconnect();
        throw new Error("Unable to access wallet. Please reconnect.");
      }

      try {
        // Use cached modules or dynamic import as fallback
        let web3FromAddress = getExtensionCache().web3FromAddress;
        let stringToHex = getExtensionCache().stringToHex;

        if (!web3FromAddress || !stringToHex) {
          const [dapp, util] = await Promise.all([
            import("@polkadot/extension-dapp"),
            import("@polkadot/util"),
          ]);
          web3FromAddress = dapp.web3FromAddress;
          stringToHex = util.stringToHex;
          getExtensionCache().web3FromAddress = web3FromAddress;
          getExtensionCache().stringToHex = stringToHex;
        }

        const injector = await withTimeout(
          web3FromAddress(state.selectedAccount.address),
          TIMEOUTS.WALLET_ENABLE,
          "Get wallet injector for signing"
        );

        if (!injector.signer.signRaw) {
          throw new Error("Wallet does not support message signing");
        }

        const messageHex = stringToHex(message);
        const { signature } = await withTimeout(
          injector.signer.signRaw({
            address: state.selectedAccount.address,
            data: messageHex,
            type: "bytes",
          }),
          TIMEOUTS.WALLET_SIGN,
          "Sign message"
        );

        return signature;
      } catch (error) {
        if (error instanceof TimeoutError) {
          console.error("Message signing timeout:", error);
          throw new Error(
            "Message signing timed out. Please check your wallet extension and try again."
          );
        }
        console.error("Message signing error:", error);
        throw error;
      }
    },
    [state.selectedAccount]
  );

  // Health check for wallet extension
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined") return false;
      const injectedWeb3 = (window as any).injectedWeb3;
      return !!(injectedWeb3 && injectedWeb3["polkadot-js"]);
    } catch {
      return false;
    }
  }, []);

  // Reconnect method for manual retry
  const reconnect = useCallback(async () => {
    console.log("Manual wallet reconnection triggered");
    const previousAddress = state.address;
    disconnect();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await connect(previousAddress || undefined);
  }, [connect, disconnect, state.address]);

  // Subscribe to connection state changes
  const onConnectionChange = useCallback(
    (listener: (connected: boolean) => void): (() => void) => {
      connectionListeners.current.add(listener);
      listener(state.isConnected); // Immediate notification
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

  // Periodic health check when connected
  useEffect(() => {
    if (!state.isConnected) {
      setIsHealthy(true);
      return;
    }

    const performHealthCheck = async () => {
      const healthy = await checkHealth();
      setIsHealthy(healthy);

      if (!healthy) {
        console.warn(
          "Wallet extension health check failed - extension may be unavailable"
        );
      }
    };

    // Initial check
    performHealthCheck();

    // Periodic checks every 30 seconds
    const interval = setInterval(performHealthCheck, 30000);

    return () => clearInterval(interval);
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
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

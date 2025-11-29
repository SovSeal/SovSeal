/**
 * useNetworkStatus Hook
 *
 * Monitors network connectivity and provides status information
 */

"use client";

import { useState, useEffect } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastChecked: number | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isConnecting: false,
    lastChecked: null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus({
        isOnline: true,
        isConnecting: false,
        lastChecked: Date.now(),
      });
    };

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        isConnecting: false,
        lastChecked: Date.now(),
      });
    };

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic connectivity check
    const checkConnectivity = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        await fetch("https://www.google.com/favicon.ico", {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!status.isOnline) {
          setStatus({
            isOnline: true,
            isConnecting: false,
            lastChecked: Date.now(),
          });
        }
      } catch {
        if (status.isOnline) {
          setStatus({
            isOnline: false,
            isConnecting: false,
            lastChecked: Date.now(),
          });
        }
      }
    };

    // Check connectivity every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    // Initial check
    checkConnectivity();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [status.isOnline]);

  return status;
}

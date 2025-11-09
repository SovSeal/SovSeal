"use client";

import { useState, useEffect } from 'react';
import { ContractService } from '@/lib/contract/ContractService';

/**
 * React hook for monitoring blockchain connection status
 * 
 * @returns Object with connection state and reconnect function
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, reconnect } = useBlockchainConnection();
 *   
 *   if (!isConnected) {
 *     return (
 *       <div>
 *         <p>Disconnected from blockchain</p>
 *         <button onClick={reconnect}>Reconnect</button>
 *       </div>
 *     );
 *   }
 *   
 *   return <div>Connected!</div>;
 * }
 * ```
 */
export function useBlockchainConnection() {
  const [isConnected, setIsConnected] = useState(ContractService.isConnected());
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = ContractService.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected) {
        setIsReconnecting(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const reconnect = async () => {
    setIsReconnecting(true);
    try {
      await ContractService.reconnect();
    } catch (error) {
      console.error('Manual reconnection failed:', error);
      setIsReconnecting(false);
    }
  };

  return {
    isConnected,
    isReconnecting,
    reconnect,
  };
}

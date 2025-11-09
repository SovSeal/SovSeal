'use client';

import React from 'react';
import { useWallet } from '@/lib/wallet/WalletProvider';

export function AccountSelector() {
  const { accounts, selectedAccount, selectAccount, isConnected } = useWallet();

  if (!isConnected || accounts.length <= 1) {
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <label htmlFor="account-select" className="block text-sm font-medium mb-2">
        Select Account
      </label>
      <select
        id="account-select"
        value={selectedAccount?.address || ''}
        onChange={(e) => selectAccount(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {accounts.map((account) => (
          <option key={account.address} value={account.address}>
            {account.meta.name || 'Unnamed Account'} ({account.address.slice(0, 8)}...{account.address.slice(-6)})
          </option>
        ))}
      </select>
    </div>
  );
}

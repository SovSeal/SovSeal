'use client';

import Link from 'next/link';
import { AccountSelector } from '@/components/wallet/AccountSelector';
import { KeyBackupWarning } from '@/components/wallet/KeyBackupWarning';
import { useWallet } from '@/lib/wallet/WalletProvider';
import { Logo } from '@/components/layout';

export default function Home() {
  const { isConnected } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 py-8 md:py-16">
      <div className="max-w-2xl w-full space-y-6 md:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Guaranteed by math, not corporations
          </p>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Create time-locked messages with client-side encryption, decentralized storage, and blockchain-enforced unlock conditions.
          </p>
        </div>

        {/* Privacy Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <span className="text-green-600 text-xl">🔒</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Client-Side Encryption</h3>
              <p className="text-gray-600">All encryption happens in your browser. No plaintext data ever leaves your device.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <span className="text-blue-600 text-xl">⏰</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Time-Locked</h3>
              <p className="text-gray-600">Blockchain enforces unlock conditions. Messages can only be decrypted after the specified time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <span className="text-purple-600 text-xl">🌐</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Decentralized Storage</h3>
              <p className="text-gray-600">Encrypted messages stored on IPFS. No central authority controls your data.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <span className="text-orange-600 text-xl">🔗</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Blockchain Verified</h3>
              <p className="text-gray-600">Message metadata anchored on Polkadot testnet for transparency and immutability.</p>
            </div>
          </div>
        </div>

        {isConnected ? (
          <>
            <div className="flex flex-col items-center gap-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <AccountSelector />
              
              <div className="flex gap-4 w-full">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  View Dashboard
                </Link>
                <Link
                  href="/create"
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium text-center"
                >
                  Create Message
                </Link>
              </div>
            </div>

            <div className="text-center p-6 bg-green-50 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                ✓ Wallet connected successfully! You can now create and unlock time-locked messages.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your Talisman wallet to get started
            </p>
            <p className="text-sm text-gray-500">
              Use the &quot;Connect Wallet&quot; button in the navigation above
            </p>
          </div>
        )}
      </div>

      {isConnected && <KeyBackupWarning />}
    </div>
  );
}

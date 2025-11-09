/**
 * Footer - Main footer component with links
 *
 * Requirements: 11.1, 11.2
 */

"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              About FutureProof
            </h3>
            <p className="text-sm text-gray-600">
              Decentralized time-capsule application with client-side
              encryption, IPFS storage, and blockchain-enforced unlock
              conditions.
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">
              Guaranteed by math, not corporations
            </p>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/polkadot-js/extension"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Talisman Wallet
                </a>
              </li>
              <li>
                <a
                  href="https://faucet.polkadot.io/westend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Westend Faucet
                </a>
              </li>
              <li>
                <a
                  href="https://web3.storage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Web3.Storage
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Security Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Privacy & Security
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Client-side encryption only</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Decentralized IPFS storage</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Blockchain-enforced unlocks</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>No plaintext data leaves browser</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {currentYear} FutureProof. Open source and decentralized.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://polkadot.network"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                Polkadot
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

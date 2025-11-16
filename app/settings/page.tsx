'use client';

/**
 * Settings Page
 * 
 * Allows users to configure Storacha authentication and view storage settings.
 */

import { StorachaAuth } from '@/components/storage/StorachaAuth';
import { useStoracha } from '@/hooks/useStoracha';

export default function SettingsPage() {
  const { authState, isReady, logout } = useStoracha();

  const handleResetConnection = () => {
    if (confirm('Are you sure you want to reset your Storacha connection? You will need to re-authenticate.')) {
      logout();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your Storacha storage connection and preferences
          </p>
        </div>

        {/* Storacha Authentication Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Decentralized Storage
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Connect to Storacha Network for secure, decentralized file storage
            </p>
          </div>

          <StorachaAuth />
        </div>

        {/* Storage Info Section */}
        {isReady && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Storage Information
            </h2>

            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Connected
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{authState.email}</dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Space DID</dt>
                <dd className="mt-1 text-sm font-mono text-gray-900 break-all">
                  {authState.spaceDid}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Gateway</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {process.env.NEXT_PUBLIC_STORACHA_GATEWAY || 'storacha.link'}
                </dd>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Features</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Client-side encryption (AES-256-GCM)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Decentralized IPFS storage
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Filecoin backup storage
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    99.9% availability guarantee
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleResetConnection}
                  className="w-full rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Reset Connection
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Clear your Storacha authentication and re-connect. Use this if you&apos;re experiencing upload issues.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Need Help?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Visit the{' '}
                  <a
                    href="https://docs.storacha.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-blue-600"
                  >
                    Storacha documentation
                  </a>{' '}
                  or join the{' '}
                  <a
                    href="https://discord.gg/8uza4ha73R"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-blue-600"
                  >
                    Discord community
                  </a>{' '}
                  for support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

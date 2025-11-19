'use client';

/**
 * Storacha Authentication Component
 * 
 * Handles email-based authentication and space creation for Storacha Network.
 * Users authenticate via email verification and create a space for storing content.
 */

import { useState, useEffect } from 'react';
import { storachaService } from '@/lib/storage';
import type { AuthState } from '@/lib/storage';

interface StorachaAuthProps {
  onAuthComplete?: () => void;
  className?: string;
}

export function StorachaAuth({ onAuthComplete, className = '' }: StorachaAuthProps) {
  const [email, setEmail] = useState('');
  const [spaceName, setSpaceName] = useState('lockdrop-space');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState<AuthState>(storachaService.getAuthState());
  const [error, setError] = useState('');

  // Check auth state on mount
  useEffect(() => {
    const state = storachaService.getAuthState();
    setAuthState(state);
    if (state.isAuthenticated && state.spaceDid) {
      onAuthComplete?.();
    }
  }, [onAuthComplete]);

  const handleLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setStatus('');

    try {
      // Step 1: Send verification email
      setStatus('📧 Sending verification email...');
      await storachaService.login(email);
      
      setStatus('✅ Email verified! Creating your space...');
      
      // Step 2: Create space
      const spaceDid = await storachaService.createSpace(spaceName);
      
      setStatus('🎉 Ready to upload!');
      setAuthState({
        isAuthenticated: true,
        email,
        spaceDid,
      });

      // Notify parent component
      onAuthComplete?.();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      setStatus('');
      
      // Provide helpful error messages
      if (errorMessage.includes('timeout')) {
        setError('Email verification timed out. Please check your email and try again.');
      } else if (errorMessage.includes('network')) {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  // Already authenticated
  if (authState.isAuthenticated && authState.spaceDid) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-4 ${className}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Storacha Connected
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>✓ Authenticated as <strong>{authState.email}</strong></p>
                <p className="mt-1 text-xs font-mono truncate">
                  Space: {authState.spaceDid}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication form
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Connect to Storacha Network
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Authenticate with your email to enable decentralized storage
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="your-email@example.com"
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            You&apos;ll receive a verification email to confirm your identity
          </p>
        </div>

        {/* Space Name Input */}
        <div>
          <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700">
            Space Name (Optional)
          </label>
          <input
            id="spaceName"
            type="text"
            value={spaceName}
            onChange={(e) => setSpaceName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="my-lockdrop-space"
            disabled={isLoading}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            A friendly name for your storage space
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading || !email}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Authenticating...
            </span>
          ) : (
            'Connect with Storacha'
          )}
        </button>

        {/* Status Message */}
        {status && (
          <div className="rounded-md bg-blue-50 p-3">
            <p className="text-sm text-blue-700">{status}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-md bg-gray-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-gray-400"
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
              <p className="text-xs text-gray-600">
                <strong>What is Storacha?</strong> A decentralized storage network built on IPFS and Filecoin. 
                Your data is encrypted client-side and stored across a distributed network with 99.9% availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

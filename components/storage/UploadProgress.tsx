'use client';

/**
 * UploadProgress Component
 * 
 * Displays upload progress, status, and provider information for IPFS uploads.
 * Handles upload errors with retry options.
 * 
 * Requirement 5.4: Display upload progress and status
 */

import { useEffect, useState } from 'react';

export interface UploadProgressProps {
  /** Current upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: 'idle' | 'uploading' | 'success' | 'error';
  /** Provider being used for upload */
  provider?: 'storacha';
  /** Error message if upload failed */
  error?: string;
  /** Callback for retry action */
  onRetry?: () => void;
  /** Callback for cancel action */
  onCancel?: () => void;
}

/**
 * UploadProgress displays real-time upload progress with provider information
 * and error handling capabilities.
 */
export function UploadProgress({
  progress,
  status,
  provider,
  error,
  onRetry,
  onCancel,
}: UploadProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    if (progress > displayProgress) {
      const timer = setTimeout(() => {
        setDisplayProgress(Math.min(displayProgress + 1, progress));
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, displayProgress]);

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'success':
        return 'Upload complete!';
      case 'error':
        return 'Upload failed';
      default:
        return 'Ready to upload';
    }
  };

  const getProviderBadge = () => {
    if (!provider) return null;

    const providerName = 'Storacha';
    const providerColor = 'bg-purple-100 text-purple-800';

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${providerColor}`}>
        {providerName}
      </span>
    );
  };

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {getStatusText()}
          </span>
          {getProviderBadge()}
        </div>
        
        {status === 'uploading' && (
          <span className="text-sm font-semibold text-gray-900">
            {displayProgress}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-300 ease-out ${getStatusColor()}`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Status Icons and Messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>File uploaded successfully to IPFS</span>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>{error || 'An error occurred during upload'}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Retry Upload
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Info */}
      {status === 'uploading' && provider && (
        <p className="text-xs text-gray-500">
          Uploading to {provider === 'storacha' ? 'Storacha Network' : 'IPFS'}
        </p>
      )}
    </div>
  );
}

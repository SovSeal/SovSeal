/**
 * ErrorRecovery Component
 * 
 * Provides user-friendly error display with recovery suggestions
 * and retry functionality.
 * 
 * Requirements: 12.1 - Display user-friendly error messages
 */

'use client';

import { classifyError, ErrorInfo } from '@/utils/errorHandling';
import { useState } from 'react';

interface ErrorRecoveryProps {
  error: Error | string;
  context?: string;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  showTechnicalDetails?: boolean;
}

export function ErrorRecovery({
  error,
  context,
  onRetry,
  onDismiss,
  showTechnicalDetails = false,
}: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const errorInfo: ErrorInfo = classifyError(error);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const getSeverityColor = () => {
    switch (errorInfo.severity) {
      case 'critical':
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const color = getSeverityColor();

  return (
    <div
      className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 mb-4`}
      role="alert"
    >
      {/* Error Icon and Title */}
      <div className="flex items-start mb-3">
        <div className={`flex-shrink-0 bg-${color}-100 rounded-full p-2 mr-3`}>
          <svg
            className={`h-5 w-5 text-${color}-600`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold text-${color}-900 mb-1`}>
            {errorInfo.message}
          </h3>
          {context && (
            <p className={`text-xs text-${color}-700 mb-2`}>
              Context: {context}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-${color}-400 hover:text-${color}-600 transition-colors`}
            aria-label="Dismiss error"
          >
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
          </button>
        )}
      </div>

      {/* Suggestions */}
      {errorInfo.suggestions.length > 0 && (
        <div className="mb-3">
          <p className={`text-xs font-medium text-${color}-800 mb-1`}>
            What you can try:
          </p>
          <ul className={`text-xs text-${color}-700 space-y-1`}>
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Details (collapsible) */}
      {showTechnicalDetails && (
        <details
          className="mb-3"
          open={showDetails}
          onToggle={(e) => setShowDetails((e.target as HTMLDetailsElement).open)}
        >
          <summary
            className={`cursor-pointer text-xs font-medium text-${color}-800 hover:text-${color}-900`}
          >
            Technical Details
          </summary>
          <div
            className={`mt-2 text-xs text-${color}-700 font-mono bg-white p-2 rounded border border-${color}-200 overflow-auto max-h-32`}
          >
            {errorInfo.technicalMessage}
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {errorInfo.retryable && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`px-3 py-1.5 text-xs font-medium text-white bg-${color}-600 hover:bg-${color}-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`px-3 py-1.5 text-xs font-medium text-${color}-700 bg-white border border-${color}-300 hover:bg-${color}-50 rounded transition-colors`}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

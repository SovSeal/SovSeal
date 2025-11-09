/**
 * Error Handling Utilities
 *
 * Provides centralized error handling, classification, and user-friendly
 * error messages for the FutureProof application.
 *
 * Requirements: All error scenarios from design
 */

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  WALLET = "wallet",
  MEDIA = "media",
  ENCRYPTION = "encryption",
  STORAGE = "storage",
  BLOCKCHAIN = "blockchain",
  UNLOCK = "unlock",
  NETWORK = "network",
  VALIDATION = "validation",
  UNKNOWN = "unknown",
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  technicalMessage: string;
  suggestions: string[];
  retryable: boolean;
  requiresUserAction: boolean;
}

/**
 * Classify an error and provide user-friendly information
 */
export function classifyError(error: Error | string): ErrorInfo {
  const errorMessage = typeof error === "string" ? error : error.message;
  const lowerMessage = errorMessage.toLowerCase();

  // Wallet errors
  if (
    lowerMessage.includes("wallet") ||
    lowerMessage.includes("extension") ||
    lowerMessage.includes("talisman") ||
    lowerMessage.includes("account")
  ) {
    return {
      category: ErrorCategory.WALLET,
      severity: ErrorSeverity.ERROR,
      message: "Wallet connection issue",
      technicalMessage: errorMessage,
      suggestions: [
        "Ensure Talisman extension is installed and unlocked",
        "Check that you have granted permission to this site",
        "Try disconnecting and reconnecting your wallet",
        "Refresh the page and try again",
      ],
      retryable: true,
      requiresUserAction: true,
    };
  }

  // Media errors
  if (
    lowerMessage.includes("media") ||
    lowerMessage.includes("recording") ||
    lowerMessage.includes("camera") ||
    lowerMessage.includes("microphone") ||
    lowerMessage.includes("permission denied")
  ) {
    return {
      category: ErrorCategory.MEDIA,
      severity: ErrorSeverity.ERROR,
      message: "Media recording or upload issue",
      technicalMessage: errorMessage,
      suggestions: [
        "Check that you have granted microphone/camera permissions",
        "Try uploading a file instead of recording",
        "Ensure your file is in a supported format",
        "Check that your device supports media recording",
      ],
      retryable: true,
      requiresUserAction: true,
    };
  }

  // Encryption errors
  if (
    lowerMessage.includes("encrypt") ||
    lowerMessage.includes("decrypt") ||
    lowerMessage.includes("crypto") ||
    lowerMessage.includes("key")
  ) {
    return {
      category: ErrorCategory.ENCRYPTION,
      severity: ErrorSeverity.ERROR,
      message: "Encryption or decryption failed",
      technicalMessage: errorMessage,
      suggestions: [
        "This may be a browser compatibility issue",
        "Try using a modern browser (Chrome, Firefox, or Edge)",
        "Ensure you are using HTTPS or localhost",
        "Clear your browser cache and try again",
      ],
      retryable: true,
      requiresUserAction: false,
    };
  }

  // Storage/IPFS errors
  if (
    lowerMessage.includes("ipfs") ||
    lowerMessage.includes("upload") ||
    lowerMessage.includes("storage") ||
    lowerMessage.includes("cid") ||
    lowerMessage.includes("download")
  ) {
    return {
      category: ErrorCategory.STORAGE,
      severity: ErrorSeverity.ERROR,
      message: "Storage operation failed",
      technicalMessage: errorMessage,
      suggestions: [
        "Check your internet connection",
        "IPFS services may be temporarily unavailable",
        "Try again in a few moments",
        "The file may be too large (try a smaller file)",
      ],
      retryable: true,
      requiresUserAction: false,
    };
  }

  // Blockchain errors
  if (
    lowerMessage.includes("transaction") ||
    lowerMessage.includes("blockchain") ||
    lowerMessage.includes("contract") ||
    lowerMessage.includes("rpc") ||
    lowerMessage.includes("balance") ||
    lowerMessage.includes("funds")
  ) {
    const needsFunds =
      lowerMessage.includes("balance") || lowerMessage.includes("funds");

    return {
      category: ErrorCategory.BLOCKCHAIN,
      severity: needsFunds ? ErrorSeverity.WARNING : ErrorSeverity.ERROR,
      message: needsFunds
        ? "Insufficient testnet tokens"
        : "Blockchain transaction failed",
      technicalMessage: errorMessage,
      suggestions: needsFunds
        ? [
            "Get free Westend tokens from the faucet",
            "Visit: https://faucet.polkadot.io/westend",
            "Or use Matrix: https://matrix.to/#/#westend_faucet:matrix.org",
          ]
        : [
            "Check your internet connection",
            "The blockchain node may be syncing",
            "Try again in a few moments",
            "Check network status at polkadot.js.org",
          ],
      retryable: !needsFunds,
      requiresUserAction: needsFunds,
    };
  }

  // Unlock/timestamp errors
  if (
    lowerMessage.includes("timestamp") ||
    lowerMessage.includes("locked") ||
    lowerMessage.includes("unlock")
  ) {
    return {
      category: ErrorCategory.UNLOCK,
      severity: ErrorSeverity.INFO,
      message: "Message is still locked",
      technicalMessage: errorMessage,
      suggestions: [
        "Wait until the unlock time has passed",
        "Check the countdown timer on the message",
        "The message will automatically become unlockable",
      ],
      retryable: false,
      requiresUserAction: false,
    };
  }

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("timeout") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("fetch failed") ||
    lowerMessage.includes("econnrefused")
  ) {
    return {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.WARNING,
      message: "Network connection issue",
      technicalMessage: errorMessage,
      suggestions: [
        "Check your internet connection",
        "Try again in a few moments",
        "The service may be temporarily unavailable",
        "Check if you are behind a firewall or proxy",
      ],
      retryable: true,
      requiresUserAction: false,
    };
  }

  // Validation errors
  if (
    lowerMessage.includes("invalid") ||
    lowerMessage.includes("required") ||
    lowerMessage.includes("validation")
  ) {
    return {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      message: "Invalid input",
      technicalMessage: errorMessage,
      suggestions: [
        "Check that all required fields are filled",
        "Verify the format of addresses and timestamps",
        "Ensure file types and sizes are supported",
      ],
      retryable: false,
      requiresUserAction: true,
    };
  }

  // Unknown errors
  return {
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.ERROR,
    message: "An unexpected error occurred",
    technicalMessage: errorMessage,
    suggestions: [
      "Try refreshing the page",
      "Clear your browser cache",
      "Try using a different browser",
      "If the problem persists, report the issue",
    ],
    retryable: true,
    requiresUserAction: false,
  };
}

/**
 * Format an error for display to the user
 */
export function formatErrorMessage(error: Error | string): string {
  const errorInfo = classifyError(error);
  return errorInfo.message;
}

/**
 * Get suggestions for resolving an error
 */
export function getErrorSuggestions(error: Error | string): string[] {
  const errorInfo = classifyError(error);
  return errorInfo.suggestions;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error | string): boolean {
  const errorInfo = classifyError(error);
  return errorInfo.retryable;
}

/**
 * Log error with context for debugging
 */
export function logError(
  error: Error | string,
  context: string,
  additionalInfo?: Record<string, any>
): void {
  const errorInfo = classifyError(error);

  console.error(`[${context}] ${errorInfo.category.toUpperCase()} Error:`, {
    message: errorInfo.message,
    technical: errorInfo.technicalMessage,
    severity: errorInfo.severity,
    retryable: errorInfo.retryable,
    ...additionalInfo,
  });

  // In production, this would send to a monitoring service
  // e.g., Sentry, LogRocket, etc.
}

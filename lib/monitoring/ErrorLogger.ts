/**
 * ErrorLogger - Centralized error logging and monitoring
 *
 * Provides structured error logging with context, categorization,
 * and integration points for monitoring services.
 *
 * Requirements: 12.1 - Log errors for debugging
 */

import {
  ErrorCategory,
  ErrorSeverity,
  classifyError,
} from "@/utils/errorHandling";

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  timestamp: number;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  technicalMessage: string;
  context: string;
  userAddress?: string;
  stackTrace?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * ErrorLogger provides centralized error logging with context
 */
export class ErrorLogger {
  private static logs: ErrorLogEntry[] = [];
  private static maxLogs = 100; // Keep last 100 errors in memory

  /**
   * Log an error with context
   *
   * @param error The error to log
   * @param context Context where the error occurred
   * @param additionalData Additional data to include
   */
  static log(
    error: Error | string,
    context: string,
    additionalData?: Record<string, unknown>
  ): void {
    const errorInfo = classifyError(error);
    const errorObj = typeof error === "string" ? new Error(error) : error;

    const entry: ErrorLogEntry = {
      timestamp: Date.now(),
      category: errorInfo.category,
      severity: errorInfo.severity,
      message: errorInfo.message,
      technicalMessage: errorInfo.technicalMessage,
      context,
      stackTrace: errorObj.stack,
      additionalData,
    };

    // Add to in-memory log
    this.logs.push(entry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging based on severity
    const logMethod = this.getConsoleMethod(errorInfo.severity);
    logMethod(
      `[${context}] ${errorInfo.category.toUpperCase()}:`,
      errorInfo.message,
      additionalData
    );

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Get appropriate console method for severity
   */
  private static getConsoleMethod(severity: ErrorSeverity): typeof console.log {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        return console.error;
      case ErrorSeverity.WARNING:
        return console.warn;
      case ErrorSeverity.INFO:
      default:
        return console.info;
    }
  }

  /**
   * Send error to monitoring service (placeholder)
   *
   * In production, integrate with services like:
   * - Sentry
   * - LogRocket
   * - Datadog
   * - Custom logging endpoint
   */
  private static sendToMonitoring(_entry: ErrorLogEntry): void {
    // Placeholder for monitoring service integration
    // Example: Sentry.captureException(_entry);
  }

  /**
   * Get recent error logs
   */
  static getRecentLogs(count: number = 10): ErrorLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by category
   */
  static getLogsByCategory(category: ErrorCategory): ErrorLogEntry[] {
    return this.logs.filter((_log) => _log.category === category);
  }

  /**
   * Get logs by severity
   */
  static getLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
    return this.logs.filter((_log) => _log.severity === severity);
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get error statistics
   */
  static getStatistics(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
  } {
    const stats = {
      total: this.logs.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
    };

    // Initialize counters
    Object.values(ErrorCategory).forEach((cat) => {
      stats.byCategory[cat] = 0;
    });
    Object.values(ErrorSeverity).forEach((sev) => {
      stats.bySeverity[sev] = 0;
    });

    // Count occurrences
    this.logs.forEach((log) => {
      stats.byCategory[log.category]++;
      stats.bySeverity[log.severity]++;
    });

    return stats;
  }
}

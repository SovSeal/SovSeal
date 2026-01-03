/**
 * RecoveryStatus - Display recovery status and progress
 */

"use client";

import type { RecoverySession, RecoveryConfig } from "@/lib/recovery";
import {
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";

interface RecoveryStatusProps {
    config: RecoveryConfig | null;
    activeSession: RecoverySession | null;
    guardianCount: number;
    onCancelRecovery?: (sessionId: string) => Promise<void>;
}

export function RecoveryStatus({
    config,
    activeSession,
    guardianCount,
    onCancelRecovery,
}: RecoveryStatusProps) {
    const threshold = config?.threshold ?? 3;
    const isConfigured = guardianCount >= threshold;

    // Format time remaining
    const formatTimeRemaining = (executeAfter: number) => {
        const remaining = executeAfter - Date.now();
        if (remaining <= 0) return "Ready to execute";

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

        if (days > 0) return `${days}d ${hours}h remaining`;
        return `${hours}h remaining`;
    };

    // Active recovery session
    if (activeSession && activeSession.status !== "cancelled" && activeSession.status !== "executed") {
        return (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                    <ClockIcon className="h-6 w-6 flex-shrink-0 text-amber-400" />
                    <div className="flex-1">
                        <h3 className="font-medium text-amber-300">Recovery In Progress</h3>
                        <p className="mt-1 text-sm text-dark-300">
                            A recovery request is active for your account.
                        </p>

                        <div className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-dark-400">New Owner:</span>
                                <span className="font-mono text-dark-200">
                                    {activeSession.newOwnerAddress.slice(0, 8)}...
                                    {activeSession.newOwnerAddress.slice(-6)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-400">Approvals:</span>
                                <span className="text-dark-200">
                                    {activeSession.collectedShares.length} / {activeSession.threshold}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-400">Time Lock:</span>
                                <span className="text-dark-200">
                                    {formatTimeRemaining(activeSession.executeAfter)}
                                </span>
                            </div>
                        </div>

                        {onCancelRecovery && (
                            <button
                                onClick={() => onCancelRecovery(activeSession.id)}
                                className="mt-4 flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
                            >
                                <XCircleIcon className="h-4 w-4" />
                                Cancel Recovery
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Recovery configured
    if (isConfigured) {
        return (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-start gap-3">
                    <ShieldCheckIcon className="h-6 w-6 flex-shrink-0 text-green-400" />
                    <div>
                        <h3 className="font-medium text-green-300">Recovery Configured</h3>
                        <p className="mt-1 text-sm text-dark-300">
                            You have {guardianCount} guardians. {threshold} are required for recovery.
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4 text-green-400" />
                            <span className="text-xs text-green-400">
                                Your account can be recovered if you lose access
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Not configured
    return (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
                <ShieldExclamationIcon className="h-6 w-6 flex-shrink-0 text-amber-400" />
                <div>
                    <h3 className="font-medium text-amber-300">Recovery Not Configured</h3>
                    <p className="mt-1 text-sm text-dark-300">
                        Add at least {threshold} guardians to enable account recovery.
                    </p>
                    <div className="mt-2">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-dark-700">
                            <div
                                className="h-full rounded-full bg-amber-500 transition-all"
                                style={{ width: `${(guardianCount / threshold) * 100}%` }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-dark-400">
                            {guardianCount} / {threshold} guardians added
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

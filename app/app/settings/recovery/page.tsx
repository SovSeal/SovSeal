"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRecovery } from "@/hooks/useRecovery";
import {
    GuardianList,
    AddGuardianForm,
    RecoveryStatus,
} from "@/components/recovery";
import {
    ArrowLeftIcon,
    ShieldCheckIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function RecoverySettingsPage() {
    const { isConnected, isReady } = useAuth();
    const {
        guardians,
        config,
        activeSession,
        isLoading,
        error,
        addGuardian,
        removeGuardian,
        cancelRecovery,
        refresh,
    } = useRecovery();

    // Load recovery data on mount
    useEffect(() => {
        if (isConnected) {
            refresh();
        }
    }, [isConnected, refresh]);

    // Not connected
    if (isReady && !isConnected) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="card-glass p-8 text-center">
                    <ShieldCheckIcon className="mx-auto mb-4 h-12 w-12 text-dark-400" />
                    <h2 className="mb-2 font-display text-xl font-semibold">
                        Sign In Required
                    </h2>
                    <p className="text-sm text-dark-400">
                        Please sign in to manage your recovery settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/app/settings"
                    className="mb-4 inline-flex items-center gap-2 text-sm text-dark-400 hover:text-dark-200"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Settings
                </Link>
                <h1 className="mb-2 font-display text-3xl font-bold">
                    Social Recovery
                </h1>
                <p className="text-dark-400">
                    Set up guardians to recover your account if you lose access
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Recovery Status */}
            <div className="mb-6">
                <RecoveryStatus
                    config={config}
                    activeSession={activeSession}
                    guardianCount={guardians.length}
                    onCancelRecovery={cancelRecovery}
                />
            </div>

            {/* How It Works */}
            <div className="card-glass mb-6 border-brand-500/20 bg-brand-500/5 p-4">
                <div className="flex gap-3">
                    <InformationCircleIcon className="h-5 w-5 flex-shrink-0 text-brand-400" />
                    <div>
                        <h3 className="mb-1 font-medium text-dark-100">How It Works</h3>
                        <ul className="space-y-1 text-sm text-dark-400">
                            <li>
                                • Add trusted contacts as guardians (minimum{" "}
                                {config?.threshold ?? 3} required)
                            </li>
                            <li>
                                • If you lose access, {config?.threshold ?? 3} guardians can
                                help recover your account
                            </li>
                            <li>• Recovery includes a 7-day waiting period for security</li>
                            <li>• You can cancel a recovery during this period</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Guardians Section */}
            <div className="card-glass p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold">Your Guardians</h2>
                    <span className="text-sm text-dark-400">
                        {guardians.length} / {config?.threshold ?? 3} minimum
                    </span>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-lg bg-dark-800/50"
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        <GuardianList guardians={guardians} onRemove={removeGuardian} />

                        <div className="mt-4">
                            <AddGuardianForm onAdd={addGuardian} />
                        </div>
                    </>
                )}
            </div>

            {/* Advanced Section */}
            <div className="mt-6">
                <details className="group">
                    <summary className="cursor-pointer text-sm text-dark-400 hover:text-dark-200">
                        Advanced Settings
                    </summary>
                    <div className="mt-4 rounded-lg border border-dark-700 bg-dark-800/50 p-4">
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-dark-300">Recovery Threshold</p>
                                <p className="text-dark-500">
                                    {config?.threshold ?? 3} of {guardians.length || "N"}{" "}
                                    guardians required
                                </p>
                            </div>
                            <div>
                                <p className="text-dark-300">Time Lock</p>
                                <p className="text-dark-500">
                                    7 days before recovery can be executed
                                </p>
                            </div>
                            <div>
                                <p className="text-dark-300">Contract Status</p>
                                <p className="text-dark-500">
                                    On-chain integration coming soon
                                </p>
                            </div>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    );
}

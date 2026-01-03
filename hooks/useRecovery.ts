/**
 * useRecovery - React hook for recovery management
 *
 * Provides access to recovery services for guardian management
 * and recovery sessions.
 */

"use client";

import { useState, useCallback } from "react";
import { GuardianManager, RecoveryOrchestrator, ShamirService } from "@/lib/recovery";
import type {
    Guardian,
    GuardianInput,
    RecoveryConfig,
    RecoverySession,
} from "@/lib/recovery";
import { useAuth } from "./useAuth";

interface UseRecoveryReturn {
    // State
    guardians: Guardian[];
    config: RecoveryConfig | null;
    activeSession: RecoverySession | null;
    isLoading: boolean;
    error: string | null;

    // Guardian management
    addGuardian: (input: GuardianInput) => Promise<Guardian>;
    removeGuardian: (guardianId: string) => Promise<void>;
    distributeShares: (secret: Uint8Array, threshold?: number) => Promise<void>;

    // Recovery flow
    initiateRecovery: (newOwnerAddress: string) => Promise<RecoverySession>;
    cancelRecovery: (sessionId: string) => Promise<void>;

    // Status
    isRecoveryConfigured: boolean;
    refresh: () => Promise<void>;
}

export function useRecovery(): UseRecoveryReturn {
    const { address, isConnected } = useAuth();
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [config, setConfig] = useState<RecoveryConfig | null>(null);
    const [activeSession, setActiveSession] = useState<RecoverySession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!address) return;

        setIsLoading(true);
        setError(null);

        try {
            const [guardianList, recoveryConfig, session] = await Promise.all([
                GuardianManager.getGuardians(address),
                GuardianManager.getRecoveryConfig(address),
                RecoveryOrchestrator.getActiveSession(address),
            ]);

            setGuardians(guardianList);
            setConfig(recoveryConfig);
            setActiveSession(session);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load recovery data");
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    const addGuardian = useCallback(
        async (input: GuardianInput): Promise<Guardian> => {
            if (!address) throw new Error("Not connected");

            setError(null);
            try {
                const guardian = await GuardianManager.registerGuardian(address, input);
                await refresh();
                return guardian;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to add guardian";
                setError(message);
                throw err;
            }
        },
        [address, refresh]
    );

    const removeGuardian = useCallback(
        async (guardianId: string): Promise<void> => {
            if (!address) throw new Error("Not connected");

            setError(null);
            try {
                await GuardianManager.removeGuardian(address, guardianId);
                await refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to remove guardian";
                setError(message);
                throw err;
            }
        },
        [address, refresh]
    );

    const distributeShares = useCallback(
        async (secret: Uint8Array, threshold?: number): Promise<void> => {
            if (!address) throw new Error("Not connected");

            const effectiveThreshold = threshold ?? ShamirService.getDefaults().threshold;

            setError(null);
            try {
                await GuardianManager.distributeShares(address, secret, effectiveThreshold);
                await refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to distribute shares";
                setError(message);
                throw err;
            }
        },
        [address, refresh]
    );

    const initiateRecovery = useCallback(
        async (newOwnerAddress: string): Promise<RecoverySession> => {
            if (!address) throw new Error("Not connected");

            setError(null);
            try {
                const session = await RecoveryOrchestrator.initiateRecovery({
                    userAddress: address,
                    newOwnerAddress,
                });
                await refresh();
                return session;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to initiate recovery";
                setError(message);
                throw err;
            }
        },
        [address, refresh]
    );

    const cancelRecovery = useCallback(
        async (sessionId: string): Promise<void> => {
            if (!address) throw new Error("Not connected");

            setError(null);
            try {
                await RecoveryOrchestrator.cancelRecovery(sessionId, address);
                await refresh();
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to cancel recovery";
                setError(message);
                throw err;
            }
        },
        [address, refresh]
    );

    const isRecoveryConfigured = guardians.length >= (config?.threshold ?? 3);

    return {
        guardians,
        config,
        activeSession,
        isLoading,
        error,
        addGuardian,
        removeGuardian,
        distributeShares,
        initiateRecovery,
        cancelRecovery,
        isRecoveryConfigured,
        refresh,
    };
}

/**
 * useGaslessTransaction - React hook for gasless message creation
 *
 * Provides a simple interface for components to:
 * 1. Check gasless eligibility
 * 2. Get smart account info
 *
 * NOTE: With ZeroDev/Pimlico, actual transactions are submitted via
 * the Kernel account client (see ZeroDevService). This hook provides
 * eligibility checking and state management.
 */

"use client";

import { useState, useCallback } from "react";
import { usePrivyWallet } from "@/lib/auth/usePrivyWallet";
import { PaymasterService, type SponsorshipEligibility } from "@/lib/paymaster";
import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";

const LOG_CONTEXT = "useGaslessTransaction";

export interface GaslessTransactionState {
    isLoading: boolean;
    error: string | null;
    eligibility: SponsorshipEligibility | null;
}

export interface UseGaslessTransactionReturn {
    state: GaslessTransactionState;
    isGaslessEnabled: boolean;
    isGaslessConfigured: boolean;
    checkEligibility: () => Promise<SponsorshipEligibility>;
    recordUsage: () => Promise<void>;
}

export function useGaslessTransaction(): UseGaslessTransactionReturn {
    const { address, authenticated } = usePrivyWallet();

    const [state, setState] = useState<GaslessTransactionState>({
        isLoading: false,
        error: null,
        eligibility: null,
    });

    const isGaslessEnabled = PaymasterService.isEnabled();
    const isGaslessConfigured = PaymasterService.isConfigured();

    /**
     * Check if user is eligible for gas sponsorship
     */
    const checkEligibility = useCallback(async (): Promise<SponsorshipEligibility> => {
        if (!address || !authenticated) {
            const notEligible: SponsorshipEligibility = {
                eligible: false,
                reason: "Wallet not connected",
                tier: "free",
            };
            setState((prev) => ({ ...prev, eligibility: notEligible }));
            return notEligible;
        }

        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            const eligibility = await PaymasterService.checkEligibility(address);
            setState((prev) => ({ ...prev, eligibility, isLoading: false }));
            return eligibility;
        } catch (error) {
            ErrorLogger.error(
                error instanceof Error ? error : new Error(String(error)),
                LOG_CONTEXT,
                { operation: "checkEligibility" }
            );

            const notEligible: SponsorshipEligibility = {
                eligible: false,
                reason: "Failed to check eligibility",
                tier: "free",
            };
            setState((prev) => ({ ...prev, eligibility: notEligible, isLoading: false }));
            return notEligible;
        }
    }, [address, authenticated]);

    /**
     * Record usage after successful sponsored transaction
     * Call this after a ZeroDev transaction succeeds
     */
    const recordUsage = useCallback(async (): Promise<void> => {
        if (!address) return;

        try {
            await PaymasterService.recordUsage(address);
        } catch (error) {
            ErrorLogger.error(
                error instanceof Error ? error : new Error(String(error)),
                LOG_CONTEXT,
                { operation: "recordUsage" }
            );
        }
    }, [address]);

    return {
        state,
        isGaslessEnabled,
        isGaslessConfigured,
        checkEligibility,
        recordUsage,
    };
}

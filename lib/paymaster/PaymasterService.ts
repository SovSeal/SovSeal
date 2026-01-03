/**
 * PaymasterService - Gas sponsorship utilities (client-side)
 *
 * Provides client-side utilities for gasless transactions.
 * The actual sponsorship is now handled by ZeroDevService + Pimlico.
 *
 * This service is kept for:
 * - Eligibility checking (calls /api/check-eligibility)
 * - Feature flag checking (NEXT_PUBLIC_GASLESS_ENABLED)
 */

"use client";

import { ErrorLogger } from "@/lib/monitoring/ErrorLogger";
import type { SponsorshipEligibility } from "./types";

const LOG_CONTEXT = "PaymasterService";

// Free tier limits (for display purposes)
const FREE_TIER_MONTHLY_LIMIT = 1;

export class PaymasterService {
    /**
     * Check if gasless transactions are enabled
     */
    static isEnabled(): boolean {
        return process.env.NEXT_PUBLIC_GASLESS_ENABLED === "true";
    }

    /**
     * Check if ZeroDev/Pimlico is configured
     */
    static isConfigured(): boolean {
        return !!(
            process.env.NEXT_PUBLIC_PIMLICO_API_KEY ||
            process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID
        );
    }

    /**
     * Check if a user is eligible for gas sponsorship
     * Calls the /api/check-eligibility endpoint
     */
    static async checkEligibility(
        userAddress: string
    ): Promise<SponsorshipEligibility> {
        try {
            const response = await fetch(
                `/api/check-eligibility?address=${encodeURIComponent(userAddress)}`
            );

            if (!response.ok) {
                const data = await response.json();
                return {
                    eligible: false,
                    tier: "free",
                    remainingDaily: 0,
                    reason: data.reason || "Failed to check eligibility",
                };
            }

            const data = await response.json();
            return {
                eligible: data.eligible,
                tier: data.tier || "free",
                remainingDaily: data.remaining ?? FREE_TIER_MONTHLY_LIMIT,
                reason: data.reason,
            };
        } catch (error) {
            ErrorLogger.error(
                error instanceof Error ? error : new Error(String(error)),
                LOG_CONTEXT,
                { operation: "checkEligibility" }
            );

            // Fail open for UX, but log error
            return {
                eligible: true,
                tier: "free",
                remainingDaily: FREE_TIER_MONTHLY_LIMIT,
                reason: undefined,
            };
        }
    }

    /**
     * Record usage after successful sponsored transaction
     */
    static async recordUsage(userAddress: string): Promise<void> {
        try {
            await fetch("/api/check-eligibility", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address: userAddress }),
            });
        } catch (error) {
            ErrorLogger.error(
                error instanceof Error ? error : new Error(String(error)),
                LOG_CONTEXT,
                { operation: "recordUsage" }
            );
        }
    }

    /**
     * Format eligibility status for display
     */
    static formatEligibility(eligibility: SponsorshipEligibility): string {
        if (eligibility.eligible) {
            if (eligibility.tier === "free") {
                const remaining = eligibility.remainingDaily ?? 0;
                return `${remaining} free message${remaining === 1 ? "" : "s"} remaining this month`;
            }
            return "Unlimited gasless transactions";
        }
        return eligibility.reason || "Not eligible for gas sponsorship";
    }
}

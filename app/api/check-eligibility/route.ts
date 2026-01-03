/**
 * GET/POST /api/check-eligibility
 *
 * Gatekeeper API for Pimlico sponsorship.
 * Checks if user is eligible for gas sponsorship based on usage limits.
 *
 * GET: Check eligibility without incrementing
 * POST: Check eligibility and increment usage count
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// Tier limits (monthly sponsored transactions)
const TIER_LIMITS: Record<string, number> = {
    free: 1,
    personal: 10,
    legacy: -1, // unlimited
    enterprise: -1, // unlimited
};

interface UsageRecord {
    user_address: string;
    gas_usage_count: number;
    tier: string;
    month_start: string;
}

/**
 * GET - Check eligibility without incrementing
 */
export async function GET(request: NextRequest) {
    const userAddress = request.nextUrl.searchParams.get("address");

    if (!userAddress) {
        return NextResponse.json(
            { error: "Missing address parameter" },
            { status: 400 }
        );
    }

    const result = await checkEligibility(userAddress.toLowerCase());
    return NextResponse.json(result);
}

/**
 * POST - Check eligibility and increment usage if eligible
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userAddress = body.address?.toLowerCase();

        if (!userAddress) {
            return NextResponse.json(
                { error: "Missing address in request body" },
                { status: 400 }
            );
        }

        // Check eligibility first
        const eligibility = await checkEligibility(userAddress);

        if (!eligibility.eligible) {
            return NextResponse.json(eligibility, { status: 403 });
        }

        // Increment usage count
        await incrementUsage(userAddress);

        return NextResponse.json({
            ...eligibility,
            incremented: true,
        });
    } catch (error) {
        console.error("[check-eligibility] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * Check if user is eligible for sponsored transaction
 */
async function checkEligibility(userAddress: string): Promise<{
    eligible: boolean;
    tier: string;
    usageCount: number;
    limit: number;
    remaining: number;
    reason?: string;
}> {
    // If Supabase not configured, allow by default
    if (!supabase) {
        return {
            eligible: true,
            tier: "free",
            usageCount: 0,
            limit: TIER_LIMITS.free,
            remaining: TIER_LIMITS.free,
        };
    }

    try {
        // Get or create usage record
        let record = await getUsageRecord(userAddress);

        if (!record) {
            record = await createUsageRecord(userAddress);
        }

        // Check if month has reset
        const now = new Date();
        const monthStart = new Date(record.month_start);
        if (
            now.getMonth() !== monthStart.getMonth() ||
            now.getFullYear() !== monthStart.getFullYear()
        ) {
            // Reset monthly counter
            await resetMonthlyUsage(userAddress);
            record.gas_usage_count = 0;
        }

        const tier = record.tier || "free";
        const limit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
        const usageCount = record.gas_usage_count || 0;

        // Unlimited tiers
        if (limit === -1) {
            return {
                eligible: true,
                tier,
                usageCount,
                limit: -1,
                remaining: -1,
            };
        }

        // Check limit
        if (usageCount >= limit) {
            return {
                eligible: false,
                tier,
                usageCount,
                limit,
                remaining: 0,
                reason: `Monthly limit reached (${limit} sponsored transactions). Upgrade for more.`,
            };
        }

        return {
            eligible: true,
            tier,
            usageCount,
            limit,
            remaining: limit - usageCount,
        };
    } catch (error) {
        console.error("[check-eligibility] Database error:", error);
        // Fail open but log
        return {
            eligible: true,
            tier: "free",
            usageCount: 0,
            limit: TIER_LIMITS.free,
            remaining: TIER_LIMITS.free,
        };
    }
}

/**
 * Get usage record for user
 */
async function getUsageRecord(userAddress: string): Promise<UsageRecord | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from("sponsorship_usage")
        .select("*")
        .eq("user_address", userAddress)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("[check-eligibility] Error fetching record:", error);
    }

    return data;
}

/**
 * Create new usage record
 */
async function createUsageRecord(userAddress: string): Promise<UsageRecord> {
    const now = new Date();
    const defaultRecord: UsageRecord = {
        user_address: userAddress,
        gas_usage_count: 0,
        tier: "free",
        month_start: now.toISOString(),
    };

    if (!supabase) {
        return defaultRecord;
    }

    const { data, error } = await supabase
        .from("sponsorship_usage")
        .insert({
            user_address: userAddress,
            gas_usage_count: 0,
            tier: "free",
            month_start: now.toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("[check-eligibility] Error creating record:", error);
    }

    return data || defaultRecord;
}

/**
 * Increment usage count
 */
async function incrementUsage(userAddress: string): Promise<void> {
    if (!supabase) return;

    // First get current count
    const record = await getUsageRecord(userAddress);
    const currentCount = record?.gas_usage_count ?? 0;

    const { error } = await supabase
        .from("sponsorship_usage")
        .upsert({
            user_address: userAddress,
            gas_usage_count: currentCount + 1,
            last_sponsored_at: new Date().toISOString(),
        });

    if (error) {
        console.error("[check-eligibility] Error incrementing usage:", error);
    }
}

/**
 * Reset monthly usage
 */
async function resetMonthlyUsage(userAddress: string): Promise<void> {
    if (!supabase) return;

    const { error } = await supabase
        .from("sponsorship_usage")
        .update({
            gas_usage_count: 0,
            month_start: new Date().toISOString(),
        })
        .eq("user_address", userAddress);

    if (error) {
        console.error("[check-eligibility] Error resetting usage:", error);
    }
}

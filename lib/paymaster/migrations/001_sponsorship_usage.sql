-- Supabase Migration: Pimlico Gatekeeper
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
--
-- Purpose: Track gas sponsorship usage for eligibility checking

-- =============================================================================
-- Table: sponsorship_usage
-- Tracks gas usage count per user for Pimlico sponsorship gating
-- =============================================================================

CREATE TABLE IF NOT EXISTS sponsorship_usage (
    user_address TEXT PRIMARY KEY,
    gas_usage_count INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'personal', 'legacy', 'enterprise')),
    last_sponsored_at TIMESTAMPTZ,
    month_start TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_sponsorship_tier ON sponsorship_usage(tier);

-- =============================================================================
-- RLS Policies
-- =============================================================================

ALTER TABLE sponsorship_usage ENABLE ROW LEVEL SECURITY;

-- Allow API routes to manage sponsorship data
CREATE POLICY "Anon can manage sponsorship usage"
    ON sponsorship_usage FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- Function: Reset monthly counts (run on 1st of each month)
-- =============================================================================

CREATE OR REPLACE FUNCTION reset_monthly_sponsorship()
RETURNS void AS $$
BEGIN
    UPDATE sponsorship_usage 
    SET gas_usage_count = 0, month_start = DATE_TRUNC('month', NOW())
    WHERE month_start < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

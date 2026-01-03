-- Supabase Migration: Paymaster Rate Limiting & Nonce Storage
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- 
-- Purpose: Enable replay protection and persistent rate limiting for the relay endpoint

-- =============================================================================
-- Table: relay_nonces
-- Stores used nonces to prevent replay attacks
-- =============================================================================

CREATE TABLE IF NOT EXISTS relay_nonces (
    nonce TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_relay_nonces_used_at ON relay_nonces(used_at);

-- Index for sender lookups (useful for auditing)
CREATE INDEX IF NOT EXISTS idx_relay_nonces_sender ON relay_nonces(sender);

-- =============================================================================
-- Table: relay_rate_limits
-- Tracks request counts per IP for rate limiting
-- =============================================================================

CREATE TABLE IF NOT EXISTS relay_rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_relay_rate_limits_window ON relay_rate_limits(window_start);

-- =============================================================================
-- Table: user_sponsorship_usage
-- Tracks gas sponsorship usage per user for tier enforcement
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_sponsorship_usage (
    sender TEXT PRIMARY KEY,
    monthly_messages INTEGER DEFAULT 0,
    daily_gas_used BIGINT DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    month_start TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),
    day_start TIMESTAMPTZ DEFAULT DATE_TRUNC('day', NOW())
);

-- Index for monthly reset queries
CREATE INDEX IF NOT EXISTS idx_sponsorship_month ON user_sponsorship_usage(month_start);

-- =============================================================================
-- RLS Policies (Row Level Security)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE relay_nonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sponsorship_usage ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by Next.js API routes)
-- Note: These use service_role key, not anon key

CREATE POLICY "Service role full access on relay_nonces"
    ON relay_nonces FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on relay_rate_limits"
    ON relay_rate_limits FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on user_sponsorship_usage"
    ON user_sponsorship_usage FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Also allow anon insert for relay operations (with proper rate limiting at app level)
CREATE POLICY "Anon can insert nonces"
    ON relay_nonces FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anon can read nonces"
    ON relay_nonces FOR SELECT
    USING (true);

CREATE POLICY "Anon can manage rate limits"
    ON relay_rate_limits FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Anon can manage sponsorship usage"
    ON user_sponsorship_usage FOR ALL
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- Automatic Cleanup Function (optional - run via cron)
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_relay_data()
RETURNS void AS $$
BEGIN
    -- Delete nonces older than 7 days
    DELETE FROM relay_nonces WHERE used_at < NOW() - INTERVAL '7 days';
    
    -- Delete rate limits older than 1 hour
    DELETE FROM relay_rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
    
    -- Reset monthly counters (run on 1st of each month)
    UPDATE user_sponsorship_usage 
    SET monthly_messages = 0, month_start = DATE_TRUNC('month', NOW())
    WHERE month_start < DATE_TRUNC('month', NOW());
    
    -- Reset daily counters
    UPDATE user_sponsorship_usage 
    SET daily_gas_used = 0, day_start = DATE_TRUNC('day', NOW())
    WHERE day_start < DATE_TRUNC('day', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Set up a cron job to run cleanup hourly
-- Requires pg_cron extension (available in Supabase Pro)
-- SELECT cron.schedule('cleanup-relay-data', '0 * * * *', 'SELECT cleanup_old_relay_data()');

-- ============================================================================
-- Blamo Closing — migration 003: free lead-magnet subscribers
--
-- Applied by hand against the owner's Neon database (same method as 001/002):
-- each statement below is executed as its own template-literal query via the
-- Neon serverless driver (the driver cannot run multiple statements in one
-- prepared call, and sql.unsafe() is a no-op on this version — see
-- scripts in the lead-magnet delegation notes). Idempotent (IF NOT EXISTS).
--
-- The table backs the free "3 Closes That Work" PDF capture:
--   * POST /api/lead-magnet        — upsert by email (keeps original
--                                    subscribed_at on conflict)
--   * GET  /api/lead-magnet/due?day=N — admin (X-Admin-Key) batching query for
--                                    the 4-email sequence (day 0/3/7/14)
--   * POST /api/unsubscribe        — sets subscribed=false, unsubscribed_at
--   * GET  /unsubscribe?email=...  — one-click page that flips the same flag
--
-- Sequence emails are sent by the team in batches using the due endpoint;
-- dayN_sent_at timestamps mark who has already received each email so a
-- subscriber never gets a duplicate.
-- ============================================================================
create table if not exists lead_magnet_subscribers (
  id              uuid primary key default gen_random_uuid(),
  -- Stored lowercase (the app normalizes on write); unique so upserts are
  -- idempotent across repeated form submissions.
  email           text not null unique,
  subscribed      boolean not null default true,
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,
  -- Sequence batching: set by the team when each email is sent (NULL = not yet).
  day0_sent_at    timestamptz,
  day3_sent_at    timestamptz,
  day7_sent_at    timestamptz,
  day14_sent_at   timestamptz
);
-- The due query filters subscribed=true AND dayN_sent_at IS NULL; the index
-- keeps that scan cheap as the list grows.
create index if not exists lead_magnet_subscribers_due_idx
  on lead_magnet_subscribers (subscribed, subscribed_at);

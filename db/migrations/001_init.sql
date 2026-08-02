-- ============================================================================
-- Blamo Closing — initial schema (users + purchases)
--
-- Applied ONCE, by hand, against the owner's Neon database. The owner connects
-- a database via the platform's database card; when it's connected, run this
-- file in the Neon SQL editor (or: psql "$DATABASE_URL" -f db/migrations/001_init.sql).
-- The SQL is idempotent (IF NOT EXISTS) so re-running it is harmless.
--
-- Scope notes (see PR "feature/accounts-data-layer"):
--   * NO `sessions` table. Sessions are STATELESS signed cookies (HMAC-SHA256
--     over {userId, exp}, signed with SESSION_SECRET). Validating a session is
--     zero DB round-trips (Neon is HTTP-per-query; a lookup on every request
--     would be wasteful) and the mechanism is identical on the local Bun server
--     and Vercel serverless. Trade-off: sessions can't be revoked server-side
--     before expiry (30 days); acceptable for this site. If revocation is ever
--     needed, add a sessions table + a "revoked_at" flag in a later migration.
--   * `purchases` has a UNIQUE (user_id, product_slug) so there is at most one
--     purchase row per product per user. unlockCodeForUser() relies on this for
--     its idempotent upsert (never overwrites an already-assigned code), and
--     recordPurchase() tolerates duplicate Stripe webhook deliveries.
--   * status lifecycle: 'pending' (checkout session created) -> 'paid' (Stripe
--     webhook confirms payment) -> 'unlocked' (confirmation code assigned).
--     The CHECK constraint below forbids anything else.
-- ============================================================================

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  -- Stored lowercase (the app normalizes on write). Uniqueness is therefore
  -- case-insensitive in practice.
  email         text not null unique,
  name          text not null default '',
  -- scrypt(password, salt) -> hex; see src/lib/accounts.ts hashPassword().
  password_hash text not null,
  salt          text not null,
  created_at    timestamptz not null default now()
);

create table if not exists purchases (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  product_slug      text not null,
  stripe_session_id text,           -- set by the Stripe delegation; NULL until then
  status            text not null default 'pending',
  confirmation_code text,           -- assigned by unlockCodeForUser() after payment
  created_at        timestamptz not null default now(),
  constraint purchases_user_product_unique unique (user_id, product_slug),
  constraint purchases_status_check check (status in ('pending', 'paid', 'unlocked'))
);

create index if not exists purchases_user_id_idx
  on purchases (user_id);
create index if not exists purchases_stripe_session_id_idx
  on purchases (stripe_session_id);

-- ============================================================================
-- Blamo Closing — migration 004: refund flow + download tracking
--
-- Applied by hand against the owner's Neon database (same method as 001-003):
-- each statement below is executed as its own query via the Neon serverless
-- driver (no multi-statement prepared calls, no comment lines inside chunks).
-- Idempotent (IF NOT EXISTS / DROP IF EXISTS + re-ADD).
--
-- What this adds to `purchases`:
--   * stripe_payment_intent — the Stripe PaymentIntent for the checkout
--     session (set by the webhook from checkout.session.completed). Used by
--     the admin refund-approve endpoint to issue the refund via
--     POST /v1/refunds (payment_intent=...). NULL for pre-migration rows.
--   * downloaded_at — set by /api/download on the FIRST successful download
--     (coalesce keeps the first timestamp). This is the refund policy line:
--     if it's set, the 30-day refund is declined.
--   * refund_status — NULL (no request) | 'pending' | 'approved' | 'rejected'
--     | 'refunded' (approve goes straight to 'refunded' when Stripe confirms).
--   * refund_requested_at — when the buyer submitted the request.
--   * refund_stripe_refund_id — the Stripe refund object id on success.
--   * refund_resolved_at — when approve/reject was decided.
--
-- `status` CHECK constraint is recreated to allow 'refunded' (revoked) so the
-- approve endpoint can flip the whole unlock set off (status='refunded' fails
-- /api/download's status === 'unlocked' check and stops /api/me from treating
-- a bundle/team license as an active entitlement).
-- ============================================================================
alter table purchases add column if not exists stripe_payment_intent text;
alter table purchases add column if not exists downloaded_at timestamptz;
alter table purchases add column if not exists refund_status text;
alter table purchases add column if not exists refund_requested_at timestamptz;
alter table purchases add column if not exists refund_stripe_refund_id text;
alter table purchases add column if not exists refund_resolved_at timestamptz;
alter table purchases drop constraint if exists purchases_status_check;
alter table purchases add constraint purchases_status_check check (status in ('pending', 'paid', 'unlocked', 'refunded'));
alter table purchases add constraint purchases_refund_status_check check (refund_status is null or refund_status in ('pending', 'approved', 'rejected', 'refunded'));
create index if not exists purchases_refund_pending_idx on purchases (refund_status) where refund_status = 'pending';

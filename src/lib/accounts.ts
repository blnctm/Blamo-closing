// ============================================================================
// ACCOUNTS + PURCHASES DATA LAYER — SERVER-ONLY.
//
// ⚠️  DO NOT import this file from any client-rendered route (index.tsx,
// thanks.tsx, etc.). It uses `node:crypto` and `process.env`, so importing it
// into a route would break (and leak server concerns into) the client bundle.
// Import it only from `createServerFn()` handlers or `src/routes/api/*` routes
// (and future server entry points), exactly like src/db.ts and
// src/lib/product-downloads.ts.
//
// Purpose: durable store for buyer accounts and purchases, ready for the
// customer-accounts + Stripe flow to be built on top (Stripe is deliberately
// NOT in this module). Everything here reads env vars lazily (per call, not at
// module load), matching src/db.ts — the site still builds and serves before a
// database is connected or a SESSION_SECRET is set; the error only surfaces if
// a function that needs them actually runs.
//
//   - DATABASE_URL  → sql() in ../db (existing lazy helper). Error message if
//                     missing: "DATABASE_URL is not set — …".
//   - SESSION_SECRET → HMAC key for the stateless session cookie (see the
//                     Session section below). Clear error when missing.
//
// Passwords: scrypt (node:crypto) with a per-user random salt; only the hex
// hash + salt are stored — never the plaintext. Node's default scrypt cost
// (N=16384, r=8, p=1) is used; no new dependencies.
//
// Sessions: stateless signed cookie. createSession() returns a
// `<base64url(payload)>.<base64url(hmac-sha256)>` token where payload is
// { uid: <user id>, exp: <unix seconds> }. validateSession() recomputes the
// HMAC (timing-safe) and checks expiry — zero DB round-trips, and it works
// identically on the local Bun server (serve.ts) and the Vercel render
// function (vercel-entry.ts). See db/migrations/001_init.sql for the trade-off
// note (no sessions table; no server-side revocation until expiry).
// ============================================================================

import {
  createHmac,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { sql } from "../db";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  /** ISO-8601 string (coerced so the value is safe to return to the client). */
  createdAt: string;
}

/** Full users row — includes credentials. Never return this to the client. */
export interface UserRecord extends PublicUser {
  passwordHash: string;
  salt: string;
}

export type PurchaseStatus = "pending" | "paid" | "unlocked";

export type RefundStatus = "pending" | "approved" | "rejected" | "refunded";

export interface Purchase {
  id: string;
  userId: string;
  productSlug: string;
  stripeSessionId: string | null;
  /** Stripe PaymentIntent id for the checkout session (migration 004). */
  stripePaymentIntent: string | null;
  status: PurchaseStatus | "refunded";
  confirmationCode: string | null;
  /** ISO-8601 string. */
  createdAt: string;
  /** ISO-8601 string | null — set on the FIRST successful download. */
  downloadedAt: string | null;
  refundStatus: RefundStatus | null;
  refundRequestedAt: string | null;
  refundStripeRefundId: string | null;
  refundResolvedAt: string | null;
}

// ---------------------------------------------------------------------------
// Password hashing — node:crypto scrypt, per-user salt, timing-safe compare
// ---------------------------------------------------------------------------

const SCRYPT_KEYLEN = 64;
const SCRYPT_SALT_BYTES = 16;

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

export async function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(SCRYPT_SALT_BYTES).toString("hex");
  const hash = (await scrypt(password, salt, SCRYPT_KEYLEN)).toString("hex");
  return { hash, salt };
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await scrypt(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(expectedHash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

// ---------------------------------------------------------------------------
// Row mappers (coerce neon's `Record<string, any>` rows into typed values)
// ---------------------------------------------------------------------------

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  // Neon (HTTP driver) returns timestamptz as a string like
  // "2026-08-02 14:23:45.123456+00" — JS Date can't parse the space, so
  // normalize to ISO 8601 first.
  const s = String(value).replace(" ", "T");
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString();
}

function toPublicUser(row: UserRecord | Record<string, unknown>): PublicUser {
  // Accepts BOTH raw DB rows (created_at) and already-mapped UserRecord rows
  // (createdAt) — authenticateUser() passes a mapped UserRecord back through
  // this mapper, and without the fallback createdAt would serialize as
  // "undefined" in API responses.
  const r = row as Record<string, unknown>;
  const createdAt = (r.created_at ?? r.createdAt) as unknown;
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    createdAt: toIso(createdAt),
  };
}

function toUserRecord(row: Record<string, unknown>): UserRecord {
  return {
    ...toPublicUser(row),
    passwordHash: String(row.password_hash),
    salt: String(row.salt),
  };
}

function toPurchase(row: Record<string, unknown>): Purchase {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    productSlug: String(row.product_slug),
    stripeSessionId: row.stripe_session_id == null ? null : String(row.stripe_session_id),
    stripePaymentIntent: row.stripe_payment_intent == null ? null : String(row.stripe_payment_intent),
    status: String(row.status) as Purchase["status"],
    confirmationCode: row.confirmation_code == null ? null : String(row.confirmation_code),
    createdAt: toIso(row.created_at),
    downloadedAt: row.downloaded_at == null ? null : toIso(row.downloaded_at),
    refundStatus: row.refund_status == null ? null : String(row.refund_status) as RefundStatus,
    refundRequestedAt: row.refund_requested_at == null ? null : toIso(row.refund_requested_at),
    refundStripeRefundId: row.refund_stripe_refund_id == null ? null : String(row.refund_stripe_refund_id),
    refundResolvedAt: row.refund_resolved_at == null ? null : toIso(row.refund_resolved_at),
  };
}

/** Columns shared by every purchase SELECT — keep in sync with toPurchase(). */
const PURCHASE_COLUMNS = `
  id, user_id, product_slug, stripe_session_id, stripe_payment_intent, status,
  confirmation_code, created_at, downloaded_at, refund_status, refund_requested_at,
  refund_stripe_refund_id, refund_resolved_at
`;

/**
 * Run a query that needs PURCHASE_COLUMNS inlined. The Neon tagged template
 * binds every `${}` interpolation as a parameter, so the static column list
 * can NEVER go inside one — it must be part of the SQL text. Values go in as
 * positional $1/$2 params via the documented `sql.query(text, params)` path.
 */
function purchaseQuery<T extends Record<string, unknown>>(
  text: string,
  params: unknown[],
): Promise<T[]> {
  return sql().query(text, params) as Promise<T[]>;
}

/** True when a Postgres unique-violation error mentions the constraint. */
function isUniqueViolation(error: unknown, constraint: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: unknown; message?: unknown };
  if (e.code === "23505") return true;
  return typeof e.message === "string" && e.message.includes(constraint);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!email || !email.includes("@")) {
    throw new Error("A valid email address is required.");
  }
  if (!name) throw new Error("Name is required.");
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
  const { hash, salt } = await hashPassword(input.password);
  try {
    const rows = await sql()`
      insert into users (email, name, password_hash, salt)
      values (${email}, ${name}, ${hash}, ${salt})
      returning id, email, name, created_at
    `;
    const row = rows[0] as Record<string, unknown> | undefined;
    if (!row) throw new Error("Account creation failed — no row returned.");
    return toPublicUser(row);
  } catch (error) {
    if (isUniqueViolation(error, "users_email_key")) {
      throw new Error("An account with this email already exists.");
    }
    throw error;
  }
}

/** Public (credential-free) user by email, or null. */
export async function findUserByEmail(email: string): Promise<PublicUser | null> {
  const rows = await sql()`
    select id, email, name, created_at from users
    where email = ${email.trim().toLowerCase()}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? toPublicUser(row) : null;
}

/** Full row including password_hash + salt — for login verification only. */
export async function findUserWithCredentials(
  email: string,
): Promise<UserRecord | null> {
  const rows = await sql()`
    select id, email, name, password_hash, salt, created_at from users
    where email = ${email.trim().toLowerCase()}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? toUserRecord(row) : null;
}

export async function getUserById(userId: string): Promise<PublicUser | null> {
  const rows = await sql()`
    select id, email, name, created_at from users
    where id = ${userId}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? toPublicUser(row) : null;
}

/**
 * Verify email + password and return the public user, or null on bad
 * credentials. Callers decide how to respond (401 etc.).
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const record = await findUserWithCredentials(email);
  if (!record) return null;
  const ok = await verifyPassword(password, record.salt, record.passwordHash);
  return ok ? toPublicUser(record) : null;
}

// ---------------------------------------------------------------------------
// Sessions — stateless HMAC-signed cookie
// ---------------------------------------------------------------------------

export const SESSION_COOKIE_NAME = "blamo_session";
/** 30 days, in seconds — matches Max-Age on the cookie. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set — add it to .env (and the host's environment) before using sessions.",
    );
  }
  return secret;
}

interface SessionPayload {
  uid: string;
  exp: number; // unix seconds
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

/** Create a signed session token for the given user id. */
export function createSession(userId: string): string {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${encoded}.${signPayload(encoded)}`;
}

export interface ValidSession {
  userId: string;
  expiresAt: number; // unix seconds
}

/** Verify signature + expiry. Returns null for missing/malformed/expired tokens. */
export function validateSession(
  token: string | null | undefined,
): ValidSession | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot === -1) return null;
  const encoded = token.slice(0, dot);
  const provided = token.slice(dot + 1);
  const expected = signPayload(encoded);
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }
  let payload: SessionPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as SessionPayload;
  } catch {
    return null;
  }
  if (typeof payload.uid !== "string" || typeof payload.exp !== "number") {
    return null;
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
  return { userId: payload.uid, expiresAt: payload.exp };
}

// --- cookie helpers ---------------------------------------------------------
// `Secure` is intentionally omitted so the cookie works over plain HTTP on the
// local dev server (serve.ts on :3000). Vercel serves HTTPS, where the cookie
// is equally valid; a later delegation can add `Secure` behind an env flag.

/** Read the session token out of a request's Cookie header. */
export function getSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === SESSION_COOKIE_NAME) {
      const value = part.slice(eq + 1).trim();
      if (value) return value;
    }
  }
  return null;
}

/** Set-Cookie value for a fresh session. */
export function makeSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

/** Set-Cookie value that clears the session cookie (logout). */
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/**
 * Convenience: resolve the current user from a request, or null when
 * unauthenticated / token invalid. (One DB lookup for the user row.)
 */
export async function currentUser(request: Request): Promise<PublicUser | null> {
  const session = validateSession(getSessionToken(request));
  if (!session) return null;
  return getUserById(session.userId);
}

// ---------------------------------------------------------------------------
// Purchases
// ---------------------------------------------------------------------------

/**
 * Record (or update) a user's purchase of a product. Idempotent: safe to call
 * repeatedly (e.g. Stripe webhook re-deliveries). One row per (user, product);
 * a re-purchase of the same product updates that row.
 *
 * Status never regresses: pending < paid < unlocked. unlockCodeForUser()
 * moves a row to 'unlocked' and re-delivering a 'paid' event afterwards won't
 * knock it back.
 */
export async function recordPurchase(input: {
  userId: string;
  productSlug: string;
  stripeSessionId?: string | null;
  stripePaymentIntent?: string | null;
  status?: PurchaseStatus;
}): Promise<Purchase> {
  const status = input.status ?? "pending";
  const rows = await purchaseQuery<Record<string, unknown>>(
    `insert into purchases (user_id, product_slug, stripe_session_id, stripe_payment_intent, status)
     values ($1, $2, $3, $4, $5)
     on conflict (user_id, product_slug) do update
       set stripe_session_id = coalesce(excluded.stripe_session_id, purchases.stripe_session_id),
           stripe_payment_intent = coalesce(excluded.stripe_payment_intent, purchases.stripe_payment_intent),
           status = case
             when purchases.status in ('unlocked', 'refunded') then purchases.status
             when excluded.status = 'unlocked' then 'unlocked'
             when purchases.status = 'paid' then purchases.status
             else excluded.status
           end
     returning ${PURCHASE_COLUMNS}`,
    [input.userId, input.productSlug, input.stripeSessionId ?? null, input.stripePaymentIntent ?? null, status],
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) throw new Error("Failed to record purchase.");
  return toPurchase(row);
}

export async function getPurchasesForUser(userId: string): Promise<Purchase[]> {
  const rows = await purchaseQuery<Record<string, unknown>>(
    `select ${PURCHASE_COLUMNS} from purchases where user_id = $1 order by created_at desc`,
    [userId],
  );
  return rows.map(toPurchase);
}

export async function getPurchase(
  userId: string,
  productSlug: string,
): Promise<Purchase | null> {
  const rows = await purchaseQuery<Record<string, unknown>>(
    `select ${PURCHASE_COLUMNS} from purchases where user_id = $1 and product_slug = $2`,
    [userId, productSlug],
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? toPurchase(row) : null;
}

/** Full purchase row by id (admin use — refund approve/reject). */
export async function getPurchaseById(purchaseId: string): Promise<Purchase | null> {
  const rows = await purchaseQuery<Record<string, unknown>>(
    `select ${PURCHASE_COLUMNS} from purchases where id = $1`,
    [purchaseId],
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? toPurchase(row) : null;
}

// ---------------------------------------------------------------------------
// Refund flow + download tracking (migration 004)
// ---------------------------------------------------------------------------

/**
 * Record the FIRST download timestamp for a purchase row (never overwrites —
 * `coalesce` keeps the original, so the policy line is the first download).
 */
export async function markDownloaded(purchaseId: string): Promise<void> {
  await sql()`
    update purchases
    set downloaded_at = coalesce(downloaded_at, now())
    where id = ${purchaseId}
  `;
}

/**
 * True when ANY row of the buyer's unlock set for a given Stripe session has
 * been downloaded. The webhook writes the same session id to the ownership row
 * (single guide / bundle / team license) AND every title row it unlocks, so
 * this is exactly "has the buyer downloaded this purchase's product (or any
 * title of it)". NULL session → false (cannot prove a download).
 */
export async function hasDownloadedInSession(
  userId: string,
  sessionId: string | null,
): Promise<boolean> {
  if (!sessionId) return false;
  const rows = await sql()`
    select 1 from purchases
    where user_id = ${userId} and stripe_session_id = ${sessionId} and downloaded_at is not null
    limit 1
  `;
  return rows.length > 0;
}

/** Open a refund request: refund_status='pending', refund_requested_at=now(). */
export async function markRefundRequested(purchaseId: string): Promise<void> {
  await sql()`
    update purchases
    set refund_status = 'pending', refund_requested_at = now()
    where id = ${purchaseId}
  `;
}

/**
 * Revoke the whole unlock set of a purchase (all rows sharing its Stripe
 * session): status -> 'refunded', which fails the download handler's
 * status === 'unlocked' check and stops /api/me's bundle/team synthesis.
 */
export async function revokePurchaseSession(
  userId: string,
  sessionId: string | null,
): Promise<void> {
  if (!sessionId) return;
  await sql()`
    update purchases
    set status = 'refunded'
    where user_id = ${userId} and stripe_session_id = ${sessionId} and status = 'unlocked'
  `;
}

/** Resolve a pending refund request on one row (approve → 'refunded'). */
export async function resolveRefund(
  purchaseId: string,
  status: "refunded" | "rejected",
  stripeRefundId?: string,
): Promise<void> {
  await sql()`
    update purchases
    set refund_status = ${status},
        refund_stripe_refund_id = ${stripeRefundId ?? null},
        refund_resolved_at = now()
    where id = ${purchaseId}
  `;
}

export interface PendingRefundRow {
  id: string;
  userEmail: string;
  productSlug: string;
  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  requestedAt: string;
  purchasedAt: string;
}

/** Admin listing: every row with refund_status='pending', newest first. */
export async function getPendingRefundRequests(): Promise<PendingRefundRow[]> {
  const rows = await sql()`
    select p.id, u.email as user_email, p.product_slug, p.stripe_session_id,
           p.stripe_payment_intent, p.refund_requested_at, p.created_at as purchased_at
    from purchases p
    join users u on u.id = p.user_id
    where p.refund_status = 'pending'
    order by p.refund_requested_at asc
  `;
  return (rows as Record<string, unknown>[]).map((r) => ({
    id: String(r.id),
    userEmail: String(r.user_email),
    productSlug: String(r.product_slug),
    stripeSessionId: r.stripe_session_id == null ? null : String(r.stripe_session_id),
    stripePaymentIntent: r.stripe_payment_intent == null ? null : String(r.stripe_payment_intent),
    requestedAt: toIso(r.refund_requested_at),
    purchasedAt: toIso(r.purchased_at),
  }));
}

/**
 * Assign the confirmation code for a product to a user, marking the purchase
 * 'unlocked'. IDEMPOTENT: if the row already has a code, it is returned
 * unchanged — a different code NEVER overwrites an existing one. Returns the
 * effective code.
 *
 * Expected flow (Stripe delegation): webhook records the purchase ('paid'),
 * then calls this with the product's code from src/lib/product-downloads.ts.
 */
export async function unlockCodeForUser(
  userId: string,
  productSlug: string,
  code: string,
): Promise<string> {
  const rows = await sql()`
    insert into purchases (user_id, product_slug, status, confirmation_code)
    values (${userId}, ${productSlug}, 'unlocked', ${code})
    on conflict (user_id, product_slug) do update
      set confirmation_code = coalesce(purchases.confirmation_code, excluded.confirmation_code),
          status = 'unlocked'
    returning confirmation_code
  `;
  const row = rows[0] as { confirmation_code: string | null } | undefined;
  const effective = row?.confirmation_code;
  if (!effective) {
    throw new Error("Failed to unlock the product code.");
  }
  return effective;
}

export interface TeamCode { code: string; ownerUserId: string; maxSeats: number; seatsUsed: number; }
export async function getTeamCodeForOwner(userId: string): Promise<TeamCode | null> {
 const rows=await sql()`select code, owner_user_id, max_seats, seats_used from team_codes where owner_user_id=${userId} limit 1`;
 const r=rows[0] as any; return r ? {code:String(r.code),ownerUserId:String(r.owner_user_id),maxSeats:Number(r.max_seats),seatsUsed:Number(r.seats_used)} : null;
}
export async function createTeamCode(userId:string):Promise<TeamCode>{
 const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code=''; for(let i=0;i<6;i++) code+=chars[Math.floor(Math.random()*chars.length)];
 const rows=await sql()`insert into team_codes(code,owner_user_id) values(${'TEAM-'+code},${userId}) returning code,owner_user_id,max_seats,seats_used`; const r=rows[0] as any;
 return {code:String(r.code),ownerUserId:String(r.owner_user_id),maxSeats:Number(r.max_seats),seatsUsed:Number(r.seats_used)};
}
export async function redeemTeamCode(userId:string, codeInput:string):Promise<'ok'|'invalid_team_code'|'team_code_full'>{
 const code=codeInput.trim().toUpperCase(); const existing=await getPurchase(userId,'team-license'); if(existing?.status==='unlocked') return 'ok';
 const found=await sql()`select code from team_codes where code=${code}`; if(!found[0]) return 'invalid_team_code';
 const updated=await sql()`update team_codes set seats_used=seats_used+1 where code=${code} and seats_used < max_seats returning code`;
 if(!updated[0]) return 'team_code_full';
 await recordPurchase({userId,productSlug:'team-license',status:'paid'}); await unlockCodeForUser(userId,'team-license','TEAM-LICENSE-ALL');
 for(const p of (await import('./product-downloads')).PRODUCT_DOWNLOADS){ await recordPurchase({userId,productSlug:p.slug,status:'paid'}); await unlockCodeForUser(userId,p.slug,p.code); }
 return 'ok';
}

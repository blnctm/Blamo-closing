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

export interface Purchase {
  id: string;
  userId: string;
  productSlug: string;
  stripeSessionId: string | null;
  status: PurchaseStatus;
  confirmationCode: string | null;
  /** ISO-8601 string. */
  createdAt: string;
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
    status: String(row.status) as PurchaseStatus,
    confirmationCode: row.confirmation_code == null ? null : String(row.confirmation_code),
    createdAt: toIso(row.created_at),
  };
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
  status?: PurchaseStatus;
}): Promise<Purchase> {
  const status = input.status ?? "pending";
  const rows = await sql()`
    insert into purchases (user_id, product_slug, stripe_session_id, status)
    values (${input.userId}, ${input.productSlug}, ${input.stripeSessionId ?? null}, ${status})
    on conflict (user_id, product_slug) do update
      set stripe_session_id = coalesce(excluded.stripe_session_id, purchases.stripe_session_id),
          status = case
            when purchases.status = 'unlocked' then purchases.status
            when excluded.status = 'unlocked' then 'unlocked'
            when purchases.status = 'paid' then purchases.status
            else excluded.status
          end
    returning id, user_id, product_slug, stripe_session_id, status, confirmation_code, created_at
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) throw new Error("Failed to record purchase.");
  return toPurchase(row);
}

export async function getPurchasesForUser(userId: string): Promise<Purchase[]> {
  const rows = await sql()`
    select id, user_id, product_slug, stripe_session_id, status, confirmation_code, created_at
    from purchases
    where user_id = ${userId}
    order by created_at desc
  `;
  return (rows as Record<string, unknown>[]).map(toPurchase);
}

export async function getPurchase(
  userId: string,
  productSlug: string,
): Promise<Purchase | null> {
  const rows = await sql()`
    select id, user_id, product_slug, stripe_session_id, status, confirmation_code, created_at
    from purchases
    where user_id = ${userId} and product_slug = ${productSlug}
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? toPurchase(row) : null;
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

// ============================================================================
// CLIENT-SIDE API HELPERS — safe to import from any route/page.
//
// This file must NEVER import server-only modules (src/lib/accounts.ts,
// src/db.ts, src/lib/product-downloads.ts, src/lib/catalog.ts) — those pull in
// node:crypto / process.env and would leak server concerns (and confirmation
// codes) into the public JavaScript bundle. Everything here is plain fetch.
//
// Error convention: every helper throws an Error whose `.message` is the API's
// machine-readable error code (e.g. "email_taken", "invalid_credentials",
// "login_required") when the server returns JSON {error}, so callers can branch
// on it; otherwise it is a human-readable fallback.
// ============================================================================

export interface ClientUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type ClientPurchaseStatus = "pending" | "paid" | "unlocked" | "refunded";

export interface ClientPurchase {
  id: string;
  userId: string;
  productSlug: string;
  stripeSessionId: string | null;
  status: ClientPurchaseStatus;
  confirmationCode: string | null;
  createdAt: string;
  /** ISO-8601 of the FIRST download — the refund policy line. */
  downloadedAt?: string | null;
  refundStatus?: "pending" | "approved" | "rejected" | "refunded" | null;
  refundRequestedAt?: string | null;
}

export interface ClientTeamCode { code: string; ownerUserId: string; maxSeats: number; seatsUsed: number; }
export interface MeResponse {
  user: ClientUser;
  purchases: ClientPurchase[];
  teamCode?: ClientTeamCode | null;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => null) as
    | { error?: unknown }
    | Record<string, unknown>
    | null;
  if (!response.ok) {
    const code =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `http_${response.status}`;
    throw new ApiError(code, response.status);
  }
  return data;
}

export function apiPost(path: string, body: unknown): Promise<unknown> {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

export function apiGet(path: string): Promise<unknown> {
  return request(path, { method: "GET" });
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  teamCode?: string;
}): Promise<{ user: ClientUser; teamCodeRedemption?: string }> {
  return (await apiPost("/api/register", input)) as { user: ClientUser; teamCodeRedemption?: string };
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<{ user: ClientUser }> {
  return (await apiPost("/api/login", input)) as { user: ClientUser };
}

export async function logoutAccount(): Promise<void> {
  await apiPost("/api/logout", {});
}

/** Current user + purchases, or null when logged out (401). */
export async function me(): Promise<MeResponse | null> {
  try {
    return (await apiGet("/api/me")) as MeResponse;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/**
 * Start Stripe checkout for a product. Returns the Stripe Checkout URL.
 * Throws ApiError("login_required", 401) when the buyer isn't logged in —
 * callers redirect to /login?next=… in that case.
 */
export async function startCheckout(productSlug: string, promoCode?: string): Promise<string> {
  const data = (await apiPost("/api/checkout", { productSlug, promoCode })) as { url?: string };
  if (typeof data.url !== "string" || !data.url) throw new ApiError("checkout_unavailable", 502);
  return data.url;
}

/**
 * POST the confirmation code to /api/download and trigger the browser to save
 * the returned file. Throws on a bad code / unknown product / server error.
 */
export async function downloadWithCode(
  product: string,
  code: string,
  fileName: string,
): Promise<void> {
  const response = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product, code }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(data?.error ?? "download_failed", response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
export async function redeemTeamCode(code: string): Promise<void> { await apiPost('/api/redeem-team-code', { code }); }

/**
 * Request a refund for a purchase (30-day / not-downloaded policy is enforced
 * server-side). Throws an ApiError whose message is the server's human-readable
 * explanation (e.g. "You've downloaded this guide, so it can't be refunded
 * under our 30-day policy.") so the account page can show it inline.
 */
export async function requestRefund(productSlug: string): Promise<{ ok: true; refundStatus: string }> {
  const response = await fetch("/api/refund-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productSlug }),
  });
  const data = (await response.json().catch(() => null)) as
    | { ok?: boolean; refundStatus?: string; error?: string; message?: string }
    | null;
  if (!response.ok) {
    const message =
      data && typeof data.message === "string"
        ? data.message
        : "Unable to request a refund right now — please email us from the Contact page.";
    throw new ApiError(message, response.status);
  }
  return { ok: true, refundStatus: data?.refundStatus ?? "pending" };
}

// ============================================================================
// TESTIMONIALS — verified-buyer reviews + owner moderation.
// ============================================================================

export interface ClientTestimonial {
  id: string;
  text: string;
  status: string;
  createdAt: string;
  productSlug?: string | null;
  productName?: string | null;
  /** Public wall: "Marcus J." style attribution ("Verified buyer" fallback). */
  reviewerName?: string;
  /** Moderation queue only: */
  userEmail?: string;
  userName?: string;
}

/**
 * Current user's latest testimonial, or null when they have none (or are
 * logged out). Used by /thanks to decide whether to show the review block.
 */
export async function myTestimonial(): Promise<ClientTestimonial | null> {
  try {
    const data = (await apiGet("/api/testimonial")) as {
      ok?: boolean;
      testimonial?: ClientTestimonial | null;
    };
    return data?.testimonial ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/** Submit a review (verified buyers only). Throws ApiError("too_short"|"too_long"|"not_verified"|"already_submitted", …). */
export async function submitTestimonial(text: string): Promise<ClientTestimonial> {
  const data = (await apiPost("/api/testimonial", { text })) as {
    ok?: boolean;
    testimonial: ClientTestimonial;
  };
  return data.testimonial;
}

/** Owner-only moderation queue. Non-owners get ApiError("unauthorized", 401). */
export async function fetchPendingTestimonials(): Promise<ClientTestimonial[]> {
  const data = (await apiGet("/api/testimonials/pending")) as {
    ok?: boolean;
    testimonials?: ClientTestimonial[];
  };
  return data?.testimonials ?? [];
}

/** Owner-only: approve or reject a pending review. */
export async function resolveTestimonial(
  id: string,
  action: "approve" | "reject",
): Promise<void> {
  await apiPost(`/api/testimonials/${action}`, { id });
}

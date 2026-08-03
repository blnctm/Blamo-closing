// ============================================================================
// REFUND API — SERVER-ONLY. Manual route registration (same pattern as
// -auth.ts / -checkout.ts / -lead-magnet.ts): the `-` prefix keeps TanStack
// from auto-routing this file; the handlers are wired into serve.ts and
// vercel-entry.ts:
//
//   POST /api/refund-request   {productSlug}   → buyer (session cookie)
//       Creates a refund request for one of the buyer's purchases.
//       200 {ok, refundStatus:'pending'}       → request created
//       401                                    → not logged in
//       404                                    → no purchase for that slug
//       403                                    → purchase not unlocked yet
//       400 already_downloaded                 → downloaded → policy declines
//       400 outside_refund_window              → older than 30 days
//       409 refund_already_requested {status}  → request already exists
//
//   GET  /api/refunds/pending                  → admin (X-Admin-Key)
//       {ok, refunds:[{id, userEmail, productSlug, productName,
//                      amountPaidCents, requestedAt, purchasedAt}]}
//
//   POST /api/refunds/approve  {purchaseId}    → admin (X-Admin-Key)
//       Issues the Stripe refund (payment_intent from the stored session),
//       marks refund_status='refunded' and revokes the unlock set.
//       200 {ok, refundId, refundStatus:'refunded'}
//       502 if Stripe rejects the refund (row left pending, nothing revoked)
//
//   POST /api/refunds/reject   {purchaseId}    → admin (X-Admin-Key)
//       200 {ok, refundStatus:'rejected'}      (unlock NOT revoked)
//
// Every admin endpoint requires X-Admin-Key == ADMIN_KEY (same pattern as
// GET /api/lead-magnet/due); missing/wrong key → 401.
//
// Policy enforcement (copy in /home/team/shared/refund-policy/, must not be
// weakened):
//   * 30 days from date of purchase — full refund ONLY if not downloaded.
//   * For the Complete Package / Team License: if ANY title was downloaded,
//     the refund is declined. The webhook writes the same Stripe session id
//     to the ownership row AND every title row, so the downloaded check is
//     "any row in this purchase's unlock set has downloaded_at set".
//   * Refund goes to the original payment method via Stripe; the unlock is
//     revoked on approval.
// ============================================================================

import {
  getPendingRefundRequests,
  getPurchase,
  getPurchaseById,
  hasDownloadedInSession,
  markRefundRequested,
  resolveRefund,
  revokePurchaseSession,
  currentUser,
} from "../../lib/accounts";
import { BUNDLE_SLUG } from "../../lib/store-products";
import { findCatalogProduct } from "../../lib/catalog";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

/** 30 days, in milliseconds — the refund window from date of purchase. */
export const REFUND_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/** Same constant-time compare as /api/lead-magnet/due. */
function adminAuthorized(request: Request): boolean {
  const configured = process.env.ADMIN_KEY;
  if (!configured) return false;
  const supplied = request.headers.get("x-admin-key") ?? "";
  if (supplied.length !== configured.length) return false;
  let diff = 0;
  for (let i = 0; i < supplied.length; i++) diff |= supplied.charCodeAt(i) ^ configured.charCodeAt(i);
  return diff === 0;
}

async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Buyer-facing: POST /api/refund-request {productSlug}
// ---------------------------------------------------------------------------
export async function handleRefundRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const user = await currentUser(request);
  if (!user) {
    return json(
      { error: "login_required", message: "Log in to request a refund." },
      401,
    );
  }
  const body = await readJsonBody(request);
  const slug = typeof body?.productSlug === "string" ? body.productSlug : "";
  if (!slug) return json({ error: "invalid_request" }, 400);

  const purchase = await getPurchase(user.id, slug);
  if (!purchase) {
    return json(
      { error: "purchase_not_found", message: "We couldn't find this purchase on your account." },
      404,
    );
  }
  if (purchase.status !== "unlocked") {
    return json(
      { error: "not_unlocked", message: "This purchase isn't unlocked yet — refunds are available once the guide is in your account." },
      403,
    );
  }

  // Existing request → 409 with its status (never create a second one).
  if (purchase.refundStatus) {
    const message =
      purchase.refundStatus === "pending"
        ? "A refund request for this purchase is already pending — we'll review it shortly."
        : "This purchase's refund request was already resolved.";
    return json({ error: "refund_already_requested", status: purchase.refundStatus, message }, 409);
  }

  // 30-day window (from date of purchase).
  const purchasedAt = new Date(purchase.createdAt).getTime();
  if (Number.isFinite(purchasedAt) && Date.now() - purchasedAt > REFUND_WINDOW_MS) {
    return json(
      { error: "outside_refund_window", message: "This purchase is outside the 30-day refund window." },
      400,
    );
  }

  // The policy line: downloaded (or any title, for bundle/license) → declined.
  // The session-wide check covers the single guide, the Complete Package and
  // the Team License in one query (the webhook stamps every unlocked row with
  // the same session id).
  const downloaded = await hasDownloadedInSession(user.id, purchase.stripeSessionId);
  if (downloaded) {
    const isLibrary = slug === BUNDLE_SLUG || slug === "team-license";
    const message = isLibrary
      ? "You've downloaded a title from this package, so it can't be refunded under our 30-day policy."
      : "You've downloaded this guide, so it can't be refunded under our 30-day policy.";
    return json({ error: "already_downloaded", message }, 400);
  }

  await markRefundRequested(purchase.id);
  return json({ ok: true, refundStatus: "pending" });
}

// ---------------------------------------------------------------------------
// Stripe helpers (no SDK — plain fetch, same as the checkout handler)
// ---------------------------------------------------------------------------

function stripeAuth(): { secret: string } | { error: Response } {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return { error: json({ error: "stripe_not_configured" }, 503) };
  return { secret };
}

/**
 * Resolve the PaymentIntent for a purchase: prefer the stored
 * stripe_payment_intent (migration 004); fall back to retrieving the Stripe
 * Checkout session (for rows recorded before the column existed).
 */
async function resolvePaymentIntent(
  stored: string | null,
  sessionId: string | null,
): Promise<string | null> {
  if (stored) return stored;
  if (!sessionId) return null;
  const auth = stripeAuth();
  if ("error" in auth) return null;
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { authorization: `Bearer ${auth.secret}` },
    });
    if (!res.ok) return null;
    const session = (await res.json()) as { payment_intent?: unknown };
    return typeof session.payment_intent === "string" ? session.payment_intent : null;
  } catch (error) {
    console.error("[refunds] failed to retrieve Stripe session", error);
    return null;
  }
}

async function createStripeRefund(paymentIntent: string): Promise<{ id: string; status: string }> {
  const auth = stripeAuth();
  if ("error" in auth) throw auth.error;
  const params = new URLSearchParams();
  params.set("payment_intent", paymentIntent);
  params.set("reason", "requested_by_customer");
  const res = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      authorization: `Bearer ${auth.secret}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[refunds] Stripe refund rejected (${res.status})`, text.slice(0, 400));
    throw new Error(`Stripe rejected the refund request (${res.status}).`);
  }
  return (await res.json()) as { id: string; status: string };
}

// ---------------------------------------------------------------------------
// Admin: GET /api/refunds/pending
// ---------------------------------------------------------------------------
export async function handleRefundsPending(request: Request): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!adminAuthorized(request)) return json({ error: "unauthorized" }, 401);
  try {
    const rows = await getPendingRefundRequests();
    const refunds = await Promise.all(
      rows.map(async (row) => {
        const product = findCatalogProduct(row.productSlug);
        // Amount paid: the real Stripe amount when we can read it (promo
        // codes make the paid amount differ from list price); fall back to
        // the catalog price for rows without a resolvable PaymentIntent.
        let amountPaidCents = product?.unitAmountCents ?? 0;
        const auth = stripeAuth();
        if (!("error" in auth) && row.stripePaymentIntent) {
          try {
            const res = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(row.stripePaymentIntent)}`, {
              headers: { authorization: `Bearer ${auth.secret}` },
            });
            if (res.ok) {
              const pi = (await res.json()) as { amount_received?: unknown };
              if (typeof pi.amount_received === "number") amountPaidCents = pi.amount_received;
            }
          } catch {
            // best-effort — keep the catalog price
          }
        }
        return {
          id: row.id,
          userEmail: row.userEmail,
          productSlug: row.productSlug,
          productName: product?.name ?? row.productSlug,
          amountPaidCents,
          requestedAt: row.requestedAt,
          purchasedAt: row.purchasedAt,
        };
      }),
    );
    return json({ ok: true, refunds });
  } catch (error) {
    console.error("[refunds] pending listing failed", error);
    return json({ error: "pending_failed" }, 500);
  }
}

// ---------------------------------------------------------------------------
// Admin: POST /api/refunds/approve {purchaseId}
// ---------------------------------------------------------------------------
export async function handleRefundApprove(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!adminAuthorized(request)) return json({ error: "unauthorized" }, 401);
  const body = await readJsonBody(request);
  const purchaseId = typeof body?.purchaseId === "string" ? body.purchaseId : "";
  if (!purchaseId) return json({ error: "invalid_request" }, 400);

  const purchase = await getPurchaseById(purchaseId);
  if (!purchase) return json({ error: "purchase_not_found" }, 404);
  if (purchase.refundStatus !== "pending") {
    return json({ error: "not_pending", message: "No pending refund request for this purchase." }, 400);
  }

  const paymentIntent = await resolvePaymentIntent(
    purchase.stripePaymentIntent,
    purchase.stripeSessionId,
  );
  if (!paymentIntent) {
    return json(
      { error: "no_payment_intent", message: "No Stripe payment intent found for this purchase — nothing to refund." },
      502,
    );
  }

  // Issue the refund FIRST; only on Stripe success do we mark + revoke, so a
  // failed refund never destroys the buyer's unlock.
  let refund: { id: string; status: string };
  try {
    refund = await createStripeRefund(paymentIntent);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe rejected the refund request.";
    return json({ error: "refund_failed", message }, 502);
  }

  try {
    // Revoke the ENTIRE unlock set of this purchase (all rows sharing the
    // session: the ownership row + every title row for bundle/team license).
    await revokePurchaseSession(purchase.userId, purchase.stripeSessionId);
    await resolveRefund(purchase.id, "refunded", refund.id);
  } catch (error) {
    console.error("[refunds] DB update after Stripe refund failed", error);
    // Stripe already refunded the money — surface the failure so the admin
    // can re-run (revoke/resolve are idempotent by construction).
    return json(
      { error: "mark_failed", message: "Refund issued, but marking the purchase failed — please re-run approve." },
      502,
    );
  }

  return json({ ok: true, refundId: refund.id, refundStatus: "refunded" });
}

// ---------------------------------------------------------------------------
// Admin: POST /api/refunds/reject {purchaseId}
// ---------------------------------------------------------------------------
export async function handleRefundReject(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!adminAuthorized(request)) return json({ error: "unauthorized" }, 401);
  const body = await readJsonBody(request);
  const purchaseId = typeof body?.purchaseId === "string" ? body.purchaseId : "";
  if (!purchaseId) return json({ error: "invalid_request" }, 400);

  const purchase = await getPurchaseById(purchaseId);
  if (!purchase) return json({ error: "purchase_not_found" }, 404);
  if (purchase.refundStatus !== "pending") {
    return json({ error: "not_pending", message: "No pending refund request for this purchase." }, 400);
  }

  // Reject NEVER revokes the unlock — the buyer keeps their purchase.
  await resolveRefund(purchase.id, "rejected");
  return json({ ok: true, refundStatus: "rejected" });
}

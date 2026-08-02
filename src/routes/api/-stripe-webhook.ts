import { createHmac, timingSafeEqual } from "node:crypto";
import { recordPurchase, unlockCodeForUser } from "../../lib/accounts";
import { BUNDLE_CONFIRMATION_CODE, findCatalogProduct } from "../../lib/catalog";
import { BUNDLE_SLUG } from "../../lib/store-products";
import { PRODUCT_DOWNLOADS } from "../../lib/product-downloads";
const MAX_AGE_SECONDS = 5 * 60;
export function verifyStripeSignature(payload: string, header: string | null, secret = process.env.STRIPE_WEBHOOK_SECRET): boolean {
  if (!secret || !header) return false;
  const values = new Map(header.split(",").map((part) => part.split("=", 2) as [string, string]));
  const timestamp = Number(values.get("t"));
  const signature = values.get("v1");
  if (!Number.isFinite(timestamp) || !signature || Math.abs(Date.now() / 1000 - timestamp) > MAX_AGE_SECONDS) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const actual = Buffer.from(signature, "hex");
  const wanted = Buffer.from(expected, "hex");
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}
export async function handleStripeWebhook(request: Request): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"))) return new Response("Invalid signature", { status: 400 });
  let event: { type?: string; data?: { object?: { id?: string; metadata?: { userId?: string; productSlug?: string } } } };
  try { event = JSON.parse(payload) as typeof event; } catch { return new Response("Invalid payload", { status: 400 }); }
  if (event.type === "checkout.session.expired") {
    console.log("Stripe checkout session expired", event.data?.object?.id);
    return new Response("ok");
  }
  if (event.type !== "checkout.session.completed") return new Response("ok");
  const session = event.data?.object;
  const userId = session?.metadata?.userId;
  const productSlug = session?.metadata?.productSlug;
  const product = findCatalogProduct(productSlug);
  if (!userId || !product || !session?.id) return new Response("Invalid session metadata", { status: 400 });

  if (product.slug === BUNDLE_SLUG) {
    // ── Complete Package: one purchase, every title (present AND future). ──
    // Record the ownership row (productSlug "complete-package", code
    // "BUNDLE-ALL") plus an unlocked row for EVERY downloadable product, so
    // /api/me and /thanks list all codes immediately. Both helpers are
    // idempotent, so webhook re-deliveries are safe.
    await recordPurchase({ userId, productSlug: BUNDLE_SLUG, stripeSessionId: session.id, status: "paid" });
    await unlockCodeForUser(userId, BUNDLE_SLUG, BUNDLE_CONFIRMATION_CODE);
    for (const downloadable of PRODUCT_DOWNLOADS) {
      // recordPurchase("paid") first keeps the Stripe session id on each row;
      // unlockCodeForUser then marks it unlocked with the product's code.
      await recordPurchase({ userId, productSlug: downloadable.slug, stripeSessionId: session.id, status: "paid" });
      await unlockCodeForUser(userId, downloadable.slug, downloadable.code);
    }
    return new Response("ok");
  }

  await recordPurchase({ userId, productSlug: product.slug, stripeSessionId: session.id, status: "paid" });
  await unlockCodeForUser(userId, product.slug, product.confirmationCode);
  return new Response("ok");
}

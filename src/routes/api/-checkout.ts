import { currentUser, recordPurchase } from "../../lib/accounts";
import { findCatalogProduct } from "../../lib/catalog";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function originFor(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  return host ? `${proto || new URL(request.url).protocol.replace(":", "")}://${host}` : new URL(request.url).origin;
}

export async function handleCheckout(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: { productSlug?: unknown };
  try { body = await request.json() as { productSlug?: unknown }; } catch { return json({ error: "invalid_json" }, 400); }
  const slug = typeof body.productSlug === "string" ? body.productSlug : "";
  const product = findCatalogProduct(slug);
  if (!product) return json({ error: "unknown_product" }, 400);
  const user = await currentUser(request);
  if (!user) return json({ error: "login_required" }, 401);
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return json({ error: "stripe_not_configured" }, 503);

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][product_data][name]", product.name);
  params.set("line_items[0][price_data][unit_amount]", String(product.unitAmountCents));
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${originFor(request)}/thanks?product=${encodeURIComponent(slug)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${originFor(request)}/`);
  params.set("metadata[userId]", user.id);
  params.set("metadata[productSlug]", slug);
  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { authorization: `Bearer ${secret}`, "content-type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!stripeResponse.ok) {
    console.error("Stripe checkout session failed", stripeResponse.status, await stripeResponse.text());
    return json({ error: "checkout_unavailable" }, 502);
  }
  const session = await stripeResponse.json() as { id?: string; url?: string };
  if (!session.id || !session.url) return json({ error: "checkout_unavailable" }, 502);
  await recordPurchase({ userId: user.id, productSlug: slug, stripeSessionId: session.id, status: "pending" });
  return json({ url: session.url });
}


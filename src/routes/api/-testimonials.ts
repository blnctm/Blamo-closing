// ============================================================================
// TESTIMONIALS API — SERVER-ONLY. Manual route registration (like -auth.ts /
// -lead-magnet.ts): the `-` prefix keeps TanStack from auto-routing this file;
// the handlers are wired into serve.ts and vercel-entry.ts:
//
//   POST /api/testimonial {text}            → submit a review (verified buyer)
//   GET  /api/testimonial                   → current user's latest review (or null)
//   GET  /api/testimonials                  → public wall: approved only
//   GET  /api/testimonials/pending          → owner/admin: pending reviews
//   POST /api/testimonials/approve {id}     → owner/admin: approve
//   POST /api/testimonials/reject {id}      → owner/admin: reject
//
// Rules:
//   * Only logged-in users with at least one Stripe-confirmed purchase
//     ('unlocked' or 'paid') can submit ("verified buyer").
//   * One review per user: an existing pending/approved review blocks a new
//     submission (409); a rejected review may be resubmitted (updates the same
//     row back to pending).
//   * Text length 20–600 (mirrored by the DB CHECK constraint).
//   * Moderation (pending list + approve/reject) is limited to the owner's
//     email (blnctm@gmail.com) or a caller with the X-Admin-Key header.
// ============================================================================
import { currentUser } from "../../lib/accounts";
import { sql as makeSql } from "../../db";
import { findCatalogProduct } from "../../lib/catalog";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const OWNER_EMAIL = "blnctm@gmail.com";

/** X-Admin-Key matches ADMIN_KEY from the environment (admin batching etc.). */
function hasAdminKey(request: Request): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return false;
  const given = request.headers.get("x-admin-key") ?? "";
  return given === expected;
}

/** Owner session (email match) or admin key — either grants moderation. */
async function isOwner(request: Request): Promise<boolean> {
  if (hasAdminKey(request)) return true;
  const user = await currentUser(request);
  return user?.email.toLowerCase() === OWNER_EMAIL;
}

async function readJsonBody(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** "marcus jones" / "Marcus Jones" → "Marcus J." ; empty → "Verified buyer". */
function reviewerDisplayName(rawName: string): string {
  const parts = rawName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Verified buyer";
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (parts.length === 1) return first;
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

function mapRow(row: Record<string, unknown>) {
  const slug = row.product_slug ? String(row.product_slug) : null;
  return {
    id: String(row.id),
    text: String(row.text),
    status: String(row.status),
    createdAt: new Date(String(row.created_at)).toISOString(),
    productSlug: slug,
    productName: slug
      ? findCatalogProduct(slug)?.name ?? slug
      : null,
  };
}

/** POST (submit) + GET (own latest) for /api/testimonial. */
export async function handleTestimonial(request: Request): Promise<Response> {
  const db = makeSql();
  const user = await currentUser(request);

  if (request.method === "GET") {
    if (!user) return json({ error: "unauthorized" }, 401);
    const rows = await db`select t.id, t.text, t.status, t.created_at, p.product_slug
      from testimonials t
      left join purchases p on p.id = t.purchase_id
      where t.user_id = ${user.id}
      order by t.submitted_at desc
      limit 1`;
    if (!rows[0]) return json({ ok: true, testimonial: null });
    return json({ ok: true, testimonial: mapRow(rows[0] as Record<string, unknown>) });
  }

  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!user) return json({ error: "unauthorized" }, 401);

  const body = await readJsonBody(request);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 20) {
    return json(
      { error: "too_short", message: "Tell us a little more — at least 20 characters." },
      400,
    );
  }
  if (text.length > 600) {
    return json(
      { error: "too_long", message: "Reviews must be 600 characters or fewer." },
      400,
    );
  }

  // Verified buyer: at least one Stripe-confirmed purchase.
  const purchases = await db`select id from purchases
    where user_id = ${user.id} and status in ('unlocked', 'paid')
    order by created_at desc
    limit 1`;
  if (!purchases[0]) {
    return json(
      { error: "not_verified", message: "Only verified buyers can leave a review." },
      403,
    );
  }

  // One review per user: pending/approved blocks; rejected may be resubmitted.
  const existing = await db`select id, status from testimonials
    where user_id = ${user.id}
    order by submitted_at desc
    limit 1`;
  if (existing[0] && String((existing[0] as Record<string, unknown>).status) !== "rejected") {
    return json(
      { error: "already_submitted", status: String((existing[0] as Record<string, unknown>).status) },
      409,
    );
  }

  const purchaseId = String((purchases[0] as Record<string, unknown>).id);
  const rows = existing[0]
    ? await db`update testimonials
        set text = ${text}, purchase_id = ${purchaseId}, status = 'pending',
            submitted_at = now(), created_at = now(), resolved_at = null
        where id = ${String((existing[0] as Record<string, unknown>).id)}
        returning id, text, status, created_at, purchase_id`
    : await db`insert into testimonials (user_id, purchase_id, text)
        values (${user.id}, ${purchaseId}, ${text})
        returning id, text, status, created_at, purchase_id`;

  // The insert/update RETURNING doesn't carry the product slug — resolve it
  // from the purchase so the response includes productName like the other
  // endpoints.
  const row = rows[0] as Record<string, unknown>;
  let productSlug: string | null = null;
  if (row.purchase_id) {
    const purchase = await db`select product_slug from purchases where id = ${String(row.purchase_id)}`;
    if (purchase[0]) {
      productSlug = String((purchase[0] as Record<string, unknown>).product_slug);
    }
  }

  return json({
    ok: true,
    testimonial: mapRow({ ...row, product_slug: productSlug }),
  });
}

/** Public wall — approved only, with reviewer first name + last initial. */
export async function handleTestimonialsPublic(request: Request): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  const db = makeSql();
  const rows = await db`select t.text, t.created_at, p.product_slug, u.name as user_name
    from testimonials t
    left join purchases p on p.id = t.purchase_id
    left join users u on u.id = t.user_id
    where t.status = 'approved'
    order by t.created_at desc`;
  return json({
    ok: true,
    testimonials: (rows as Record<string, unknown>[]).map((x) => ({
      text: String(x.text),
      createdAt: new Date(String(x.created_at)).toISOString(),
      productName: x.product_slug
        ? findCatalogProduct(String(x.product_slug))?.name ?? String(x.product_slug)
        : undefined,
      reviewerName: reviewerDisplayName(String(x.user_name ?? "")),
    })),
  });
}

/** Owner/admin moderation queue. */
export async function handleTestimonialsPending(request: Request): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!(await isOwner(request))) return json({ error: "unauthorized" }, 401);
  const db = makeSql();
  const rows = await db`select t.id, t.text, t.status, t.created_at,
      u.email as user_email, u.name as user_name, p.product_slug
    from testimonials t
    join users u on u.id = t.user_id
    left join purchases p on p.id = t.purchase_id
    where t.status = 'pending'
    order by t.created_at asc`;
  return json({
    ok: true,
    testimonials: (rows as Record<string, unknown>[]).map((row) => ({
      ...mapRow(row),
      userEmail: String(row.user_email ?? ""),
      userName: String(row.user_name ?? ""),
    })),
  });
}

async function resolveTestimonial(
  request: Request,
  status: "approved" | "rejected",
): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!(await isOwner(request))) return json({ error: "unauthorized" }, 401);
  const body = await readJsonBody(request);
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) return json({ error: "invalid_request" }, 400);
  const db = makeSql();
  const found = await db`select id, status from testimonials where id = ${id}`;
  if (!found[0]) return json({ error: "not_found" }, 404);
  if (String((found[0] as Record<string, unknown>).status) !== "pending") {
    return json({ error: "not_pending" }, 400);
  }
  const updated = await db`update testimonials
    set status = ${status}, resolved_at = now()
    where id = ${id}
    returning id, status`;
  return json({ ok: true, testimonial: updated[0] });
}

export const handleTestimonialApprove = (r: Request) =>
  resolveTestimonial(r, "approved");
export const handleTestimonialReject = (r: Request) =>
  resolveTestimonial(r, "rejected");

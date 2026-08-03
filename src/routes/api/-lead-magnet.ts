// ============================================================================
// LEAD-MAGNET API — SERVER-ONLY. Manual route registration (same pattern as
// -auth.ts / -checkout.ts): the `-` prefix keeps TanStack from auto-routing
// this file; the handlers are wired into serve.ts and vercel-entry.ts:
//
//   POST /api/lead-magnet {email}          → {ok, downloadUrl}  (upsert by email)
//   GET  /api/lead-magnet/due?day=0|3|7|14 → {subscribers:[...]} (admin-only,
//                                             requires X-Admin-Key == ADMIN_KEY)
//   POST /api/unsubscribe {email}          → {ok}
//   GET  /unsubscribe?email=...            → one-line "You're unsubscribed" page
//                                             (flips subscribed=false)
//
// The free PDF itself is a PUBLIC static asset (public/3-closes-that-work.pdf,
// served at /3-closes-that-work.pdf) — NO login, NO code gate. This module only
// records the opt-in so the team can batch-send the 4-email nurture sequence
// later. NO email is ever sent from code: delivery is instant-on-page; the team
// reads /api/lead-magnet/due with the admin key and sends from the inbox.
// ============================================================================

import { sql } from "../../db";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

// Same regex as src/routes/api/-auth.ts (rough but honest: something@something.tld).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public free-PDF asset — the [PDF_LINK] the email sequence will use.
export const FREE_PDF_URL = "/3-closes-that-work.pdf";

const VALID_DAYS = [0, 3, 7, 14] as const;
type SequenceDay = (typeof VALID_DAYS)[number];

function isSequenceDay(value: number): value is SequenceDay {
  return (VALID_DAYS as readonly number[]).includes(value);
}

function adminAuthorized(request: Request): boolean {
  const configured = process.env.ADMIN_KEY;
  if (!configured) return false;
  const supplied = request.headers.get("x-admin-key") ?? "";
  // Constant-time-ish compare; lengths differ → fail fast, no early return leak.
  if (supplied.length !== configured.length) return false;
  let diff = 0;
  for (let i = 0; i < supplied.length; i++) diff |= supplied.charCodeAt(i) ^ configured.charCodeAt(i);
  return diff === 0;
}

/** POST /api/lead-magnet {email} → {ok:true, downloadUrl} */
export async function handleLeadMagnetCapture(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);

  try {
    const db = sql();
    // Upsert by email. On conflict (existing subscriber) keep the ORIGINAL
    // subscribed_at and re-opt the person in (subscribed=true, clear
    // unsubscribed_at) — they actively submitted the form again. Sent
    // timestamps are left untouched so previously-delivered emails are not
    // re-sent by the batching query.
    await db`
      insert into lead_magnet_subscribers (email)
      values (${email})
      on conflict (email) do update
        set subscribed = true,
            unsubscribed_at = null
    `;
  } catch (error) {
    console.error("[lead-magnet] capture failed", error);
    return json({ error: "capture_failed" }, 500);
  }
  return json({ ok: true, downloadUrl: FREE_PDF_URL });
}

/** GET /api/lead-magnet/due?day=0|3|7|14 — admin-only batching query. */
export async function handleLeadMagnetDue(request: Request): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (!adminAuthorized(request)) return json({ error: "unauthorized" }, 401);

  const rawDay = Number(new URL(request.url).searchParams.get("day"));
  if (!Number.isInteger(rawDay) || !isSequenceDay(rawDay)) {
    return json({ error: "invalid_day" }, 400);
  }
  const day = rawDay as SequenceDay;

  try {
    const db = sql();
    // day is whitelisted (0|3|7|14) so building the column name and interval
    // literal from it is injection-safe. Day 0 is immediately due
    // (subscribed_at < now()); later days wait their interval. The query is
    // built as a plain string because the driver would otherwise bind the
    // dynamic column/window text as a parameter — executed via the documented
    // conventional call path (sql.query), same single-statement requirement.
    const window =
      day === 0 ? "subscribed_at < now()" : `subscribed_at <= now() - interval '${day} days'`;
    const rows = await db.query(
      `select id, email, subscribed_at
       from lead_magnet_subscribers
       where subscribed = true
         and day${day}_sent_at is null
         and ${window}
       order by subscribed_at asc
       limit 500`,
    );
    const subscribers = rows.map((r) => ({
      id: String(r.id),
      email: String(r.email),
      subscribedAt: new Date(r.subscribed_at as string).toISOString(),
    }));
    return json({ ok: true, day, subscribers });
  } catch (error) {
    console.error("[lead-magnet] due query failed", error);
    return json({ error: "due_failed" }, 500);
  }
}

/** POST /api/unsubscribe {email} → {ok:true} (idempotent; unknown email → ok). */
export async function handleUnsubscribeApi(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);

  try {
    const db = sql();
    await db`
      update lead_magnet_subscribers
      set subscribed = false, unsubscribed_at = now()
      where email = ${email}
    `;
  } catch (error) {
    console.error("[lead-magnet] unsubscribe failed", error);
    return json({ error: "unsubscribe_failed" }, 500);
  }
  // Always ok: never reveal whether an email is on the list.
  return json({ ok: true });
}

/** GET /unsubscribe?email=... — one-click page that flips the flag. */
export async function handleUnsubscribePage(request: Request): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  const email = (new URL(request.url).searchParams.get("email") ?? "").trim().toLowerCase();
  if (EMAIL_RE.test(email)) {
    try {
      const db = sql();
      await db`
        update lead_magnet_subscribers
        set subscribed = false, unsubscribed_at = now()
        where email = ${email}
      `;
    } catch (error) {
      console.error("[lead-magnet] unsubscribe page flip failed", error);
    }
  }
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>You're unsubscribed — Blamo Closing</title>
<style>
  body{margin:0;background:#0f172a;color:#f8fafc;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center}
  .card{max-width:26rem;margin:2rem;padding:2.5rem;border-radius:1.25rem;background:#1e293b;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.4)}
  .check{display:inline-flex;align-items:center;justify-content:center;width:3.5rem;height:3.5rem;border-radius:9999px;background:#f59e0b;color:#0f172a;font-size:1.75rem;font-weight:800}
  h1{margin:.9rem 0 .4rem;font-size:1.5rem}
  p{margin:.4rem 0 1.4rem;color:#cbd5e1;line-height:1.5}
  a{display:inline-block;color:#f59e0b;font-weight:700;text-decoration:none}
  a:hover{text-decoration:underline}
</style>
</head>
<body>
  <main class="card">
    <div class="check" aria-hidden="true">✓</div>
    <h1>You're unsubscribed.</h1>
    <p>No hard feelings — the free PDF still works if you want it. Come back to the lot anytime: <a href="https://blamoclosing.com">blamoclosing.com</a></p>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

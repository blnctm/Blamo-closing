// ============================================================================
// AUTH API — SERVER-ONLY. Manual route registration (like -checkout.ts /
// -stripe-webhook.ts): the `-` prefix keeps TanStack from auto-routing this
// file; the handlers are wired into serve.ts and vercel-entry.ts:
//
//   POST /api/register {name, email, password} → sets session cookie, {user}
//   POST /api/login    {email, password}        → sets session cookie, {user}
//   POST /api/logout                            → clears session cookie, {ok}
//   GET  /api/me                                → {user, purchases} or 401
//
// Passwords are hashed/verified through src/lib/accounts.ts (scrypt + per-user
// salt). Sessions are the existing HMAC-signed stateless cookie, so the
// checkout endpoint's `currentUser(request)` picks the same session up with no
// changes. /api/me also returns the user's purchase rows (including their
// unlocked confirmation codes) so the thanks page and /account can show codes
// and download links without a second round-trip.
// ============================================================================

import {
  authenticateUser,
  clearSessionCookie,
  createSession,
  createUser,
  currentUser,
  getPurchasesForUser,
  makeSessionCookie,
} from "../../lib/accounts";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

// Same shape as src/lib/accounts.ts PublicUser/Purchase, declared here so this
// module can be imported by API wiring without pulling in node:crypto types.
// (The real interfaces live in accounts.ts; JSON round-trips don't care.)
interface PublicUserShape {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Rough but honest: something@something.tld. createUser() validates more.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function withSessionCookie(payload: unknown, token: string): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": makeSessionCookie(token),
    },
  });
}

export async function handleRegister(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const body = await readJsonBody(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) return json({ error: "name_required" }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);
  if (password.length < 8) return json({ error: "password_too_short" }, 400);

  let user: PublicUserShape;
  try {
    user = await createUser({ name, email, password });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return json({ error: "email_taken" }, 409);
    }
    console.error("[auth] register failed", error);
    return json({ error: "register_failed" }, 500);
  }

  const token = createSession(user.id);
  return withSessionCookie({ user }, token);
}

export async function handleLogin(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const body = await readJsonBody(request);
  if (!body) return json({ error: "invalid_json" }, 400);

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return json({ error: "invalid_credentials" }, 401);

  // authenticateUser returns null for BOTH unknown email and wrong password,
  // so a login attempt never reveals whether an account exists.
  const user = await authenticateUser(email, password);
  if (!user) return json({ error: "invalid_credentials" }, 401);

  const token = createSession(user.id);
  return withSessionCookie({ user }, token);
}

export async function handleLogout(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": clearSessionCookie(),
    },
  });
}

export async function handleMe(request: Request): Promise<Response> {
  if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  const user = await currentUser(request);
  if (!user) return json({ error: "unauthorized" }, 401);
  const purchases = await getPurchasesForUser(user.id);
  return json({ user, purchases });
}

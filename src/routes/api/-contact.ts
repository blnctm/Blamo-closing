import { sql } from "../../db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function handleContact(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: Record<string, unknown>;
  try { const parsed = await request.json(); if (!parsed || typeof parsed !== "object") return json({ error: "invalid_json" }, 400); body = parsed as Record<string, unknown>; }
  catch { return json({ error: "invalid_json" }, 400); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!name) return json({ error: "name_required", field: "name" }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email", field: "email" }, 400);
  if (!message) return json({ error: "message_required", field: "message" }, 400);
  if (message.length > 5000) return json({ error: "message_too_long", field: "message" }, 400);
  try {
    await sql()`insert into contact_messages (name, email, message) values (${name}, ${email}, ${message})`;
    return json({ ok: true });
  } catch (error) {
    console.error("[contact] insert failed", error);
    return json({ error: "contact_failed" }, 500);
  }
}

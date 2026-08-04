// ============================================================================
// Confirmation-code download endpoint — SERVER-ONLY.
//
// Wired into BOTH server entry points so the gate works identically on the
// local Bun server (serve.ts) and the Vercel render function (vercel-entry.ts,
// bundled into .vercel/output/functions/render.func/index.mjs by build-vercel.sh):
//
//   POST /api/download  { product: "<slug>", code: "<confirmation code>" }
//
//   - 200 → the product file (Content-Disposition: attachment), so the browser
//     downloads it. The file is read from /private, which is NEVER exposed as a
//     static path.
//   - 400 → malformed body or missing fields
//   - 401 → not logged in, no unlocked purchase for this product, or the
//     confirmation code doesn't match
//   - 404 → unknown product slug
//   - 405 → non-POST method
//   - 500 → private dir/file missing on the server (shouldn't happen if the
//     build copied /private next to the bundle)
//
// OWNERSHIP GATE (security fix 2026-08-03): a matching code alone is NO LONGER
// sufficient — a code can be learned (screenshots, sharing) or, before this
// fix, extracted from the public JS bundle. The caller must be logged in AND
// hold an UNLOCKED purchase row for the requested product slug:
//   * single-product buyers  → their one purchase row (unlocked by the Stripe
//     webhook),
//   * Complete Package owners → every title row is unlocked at purchase, so the
//     per-product row check covers current titles; for FUTURE titles the
//     bundle-owner branch below lets them use any valid catalog code,
//   * Team License owners & redeemed reps → the webhook/redemption unlock a row
//     for every product, so the same per-product check covers them with no
//     special-casing.
// The exact-code match still applies ON TOP of ownership (both must hold): the
// entered code must match the requested product's confirmation code, unless the
// caller is a Complete Package owner (then any valid catalog code is accepted).
//
// Only POST is accepted so codes never travel in URLs (no log/analytics leak).
// ============================================================================
import fs from "node:fs";
import path from "node:path";

import { currentUser, getPurchase, markDownloaded } from "../src/lib/accounts";
import { BUNDLE_SLUG } from "../src/lib/store-products";
import {
  codeMatches,
  findProduct,
  PRODUCT_DOWNLOADS,
} from "../src/lib/product-downloads";

export const DOWNLOAD_PATH = "/api/download";
export const AUDIO_PATH = "/api/audio";

/**
 * Locate the /private directory at runtime. The files are NOT bundled by
 * Vite/bun — they are copied next to the running server:
 *   - local:   /home/team/shared/site/private            (cwd when serve.ts runs)
 *   - Vercel:  .vercel/output/functions/render.func/private  (copied by
 *              build-vercel.sh; Vercel runs functions with cwd = function dir,
 *              so both process.cwd() and import.meta.dirname point there)
 * Returns undefined if none of the candidates exist.
 */
function findPrivateDir(): string | undefined {
  const candidates = [
    path.join(process.cwd(), "private"),
    typeof import.meta.dirname === "string"
      ? path.join(import.meta.dirname, "private")
      : undefined,
    // Vercel functions convention (belt & braces)
    "/var/task/private",
  ].filter((c): c is string => typeof c === "string");

  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isDirectory()) return candidate;
    } catch {
      // keep looking
    }
  }
  return undefined;
}

function jsonResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleDownloadRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse(405, "Use POST with a JSON body.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, "Invalid request body.");
  }

  const { product, code, audio } = (body ?? {}) as Record<string, unknown>;
  const wantsAudio = audio === true;
  if (typeof product !== "string" || typeof code !== "string") {
    return jsonResponse(400, "Both 'product' and 'code' are required.");
  }

  // The bundle has no single PDF — its files are the individual titles. Guard
  // BEFORE findProduct(), which silently falls back to the Starter Kit for
  // unknown slugs.
  if (product === BUNDLE_SLUG) {
    return jsonResponse(
      404,
      "The Complete Package has no single file — download each title from My Account.",
    );
  }

  const entry = findProduct(product);
  if (!entry) {
    return jsonResponse(404, "Unknown product.");
  }

  // ── OWNERSHIP GATE (security fix 2026-08-03) ──────────────────────────────
  // A matching code alone is no longer enough: the caller must be logged in
  // AND hold an unlocked purchase row for this product (single purchase,
  // Complete Package, or Team License owner/rep all unlock per-product rows
  // via the Stripe webhook or team-code redemption, so one check covers every
  // legitimate path). Complete Package owners may additionally download any
  // title — including future ones — with any valid catalog code (their bundle
  // purchase is the ownership marker). The exact-code match still applies on
  // top of ownership.
  const user = await currentUser(request);
  if (!user) {
    return jsonResponse(
      401,
      "Log in to download your purchase — your unlock codes live in your account.",
    );
  }

  const ownPurchase = await getPurchase(user.id, entry.slug);
  const isOwner = ownPurchase?.status === "unlocked";

  const bundlePurchase = await getPurchase(user.id, BUNDLE_SLUG);
  const isBundleOwner = bundlePurchase?.status === "unlocked";

  if (!isOwner && !isBundleOwner) {
    return jsonResponse(
      401,
      "This code isn’t linked to a purchase on your account. Log in with the account you bought with, or buy the product to unlock it.",
    );
  }

  const matchesRequested = codeMatches(entry, code);
  const matchesAnyProduct = PRODUCT_DOWNLOADS.some((p) => codeMatches(p, code));

  if (!matchesRequested && !(isBundleOwner && matchesAnyProduct)) {
    return jsonResponse(
      401,
      "That code didn’t match for this product. Check the confirmation email you received after purchase.",
    );
  }

  const privateDir = findPrivateDir();
  if (!privateDir) {
    console.error("[download] private/ directory not found at runtime");
    return jsonResponse(500, "Downloads are temporarily unavailable.");
  }

  const filePath = path.join(privateDir, wantsAudio ? entry.audioFile : entry.file);
  let data: Buffer;
  try {
    data = fs.readFileSync(filePath);
  } catch (error) {
    console.error(`[download] failed to read ${wantsAudio ? entry.audioFile : entry.file}`, error);
    return jsonResponse(500, "Downloads are temporarily unavailable.");
  }

  // ── DOWNLOAD TRACKING (refund policy line, migration 004) ────────────────
  // Record the FIRST successful download on the buyer's purchase row(s):
  //  * single product → the product row (ownPurchase),
  //  * bundle owner   → ALSO the bundle ownership row, so a bundle refund is
  //    declined once ANY title has been pulled (including future titles that
  //    have no per-product row yet).
  // markDownloaded uses coalesce(downloaded_at, now()) — the first timestamp
  // is kept, later re-downloads never overwrite it. A tracking failure must
  // never block the actual download, so errors are logged and swallowed.
  try {
    if (ownPurchase) await markDownloaded(ownPurchase.id);
    if (bundlePurchase) await markDownloaded(bundlePurchase.id);
  } catch (error) {
    console.error("[download] failed to record downloaded_at", error);
  }

  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": wantsAudio ? "audio/mpeg" : entry.mime,
      "Content-Disposition": wantsAudio ? `inline; filename="${entry.audioFile.split("/").pop()}"` : `attachment; filename="${entry.file}"`,
      "Content-Length": String(data.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}


/** Session-gated native audio stream. GET is intentional so <audio src> can play it. */
export async function handleAudioRequest(request: Request): Promise<Response> {
  if (request.method !== "GET") return jsonResponse(405, "Use GET.");
  const slug = new URL(request.url).searchParams.get("product");
  const entry = findProduct(slug);
  if (!entry || slug === BUNDLE_SLUG) return jsonResponse(404, "Unknown product.");
  const user = await currentUser(request);
  if (!user) return jsonResponse(401, "Log in to play your audio companion.");
  const own = await getPurchase(user.id, entry.slug);
  const bundle = await getPurchase(user.id, BUNDLE_SLUG);
  if (own?.status !== "unlocked" && bundle?.status !== "unlocked") return jsonResponse(401, "This audio is not unlocked on your account.");
  const dir = findPrivateDir();
  if (!dir) return jsonResponse(500, "Downloads are temporarily unavailable.");
  try {
    const data = fs.readFileSync(path.join(dir, entry.audioFile));
    return new Response(new Uint8Array(data), { status: 200, headers: {
      "Content-Type": "audio/mpeg", "Content-Length": String(data.byteLength), "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    }});
  } catch { return jsonResponse(500, "Downloads are temporarily unavailable."); }
}

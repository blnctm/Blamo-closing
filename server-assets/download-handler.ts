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
//   - 401 → wrong confirmation code
//   - 404 → unknown product slug
//   - 405 → non-POST method
//   - 500 → private dir/file missing on the server (shouldn't happen if the
//     build copied /private next to the bundle)
//
// Only POST is accepted so codes never travel in URLs (no log/analytics leak).
// ============================================================================
import fs from "node:fs";
import path from "node:path";

import {
  codeMatches,
  findProduct,
} from "../src/lib/product-downloads";

export const DOWNLOAD_PATH = "/api/download";

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

  const { product, code } = (body ?? {}) as Record<string, unknown>;
  if (typeof product !== "string" || typeof code !== "string") {
    return jsonResponse(400, "Both 'product' and 'code' are required.");
  }

  const entry = findProduct(product);
  if (!entry) {
    return jsonResponse(404, "Unknown product.");
  }

  if (!codeMatches(entry, code)) {
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

  const filePath = path.join(privateDir, entry.file);
  let data: Buffer;
  try {
    data = fs.readFileSync(filePath);
  } catch (error) {
    console.error(`[download] failed to read ${entry.file}`, error);
    return jsonResponse(500, "Downloads are temporarily unavailable.");
  }

  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": entry.mime,
      "Content-Disposition": `attachment; filename="${entry.file}"`,
      "Content-Length": String(data.byteLength),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

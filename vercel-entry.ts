// Vercel Build Output API function entry.
//
// The Build Output Node launcher invokes the default export as a classic Node
// `(req, res)` handler — NOT a web handler. TanStack Start emits a portable web
// fetch handler (dist/server/server.js), so we adapt: Node IncomingMessage → web
// Request, run the fetch handler, stream the web Response back onto ServerResponse.
// Node 22 has global Request/Response/Headers/ReadableStream.
//
// Bundled (with its deps + the SSR handler's dynamic ./assets chunks) into
// .vercel/output/functions/render.func/index.mjs by build-vercel.sh.
import type { IncomingMessage, ServerResponse } from "node:http";

import handler from "./dist/server/server.js";
import {
  DOWNLOAD_PATH,
  handleDownloadRequest,
} from "./server-assets/download-handler";
import { handleCheckout } from "./src/routes/api/-checkout";
import { handleRedeemTeamCode } from "./src/routes/api/-redeem-team-code";
import { handleStripeWebhook } from "./src/routes/api/-stripe-webhook";
import {
  handleRefundApprove,
  handleRefundReject,
  handleRefundRequest,
  handleRefundsPending,
} from "./src/routes/api/-refunds";
import {
  handleLeadMagnetCapture,
  handleLeadMagnetDue,
  handleUnsubscribeApi,
  handleUnsubscribePage,
} from "./src/routes/api/-lead-magnet";
import {
  handleLogin,
  handleLogout,
  handleMe,
  handleRegister,
} from "./src/routes/api/-auth";

const fetchHandler = handler as {
  fetch: (request: Request) => Response | Promise<Response>;
};

const toWebRequest = (req: IncomingMessage): Request => {
  const host = req.headers.host ?? "localhost";
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) ?? "https";
  const url = `${proto}://${host}${req.url ?? "/"}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else if (value != null) headers.set(key, value);
  }
  const method = req.method ?? "GET";
  const hasBody = method !== "GET" && method !== "HEAD";
  return new Request(url, {
    method,
    headers,
    ...(hasBody
      ? { body: req as unknown as ReadableStream, duplex: "half" }
      : {}),
  } as RequestInit);
};

export default async function vercelHandler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  try {
    const webRequest = toWebRequest(req);
    // API endpoints are handled before the SSR handler.
    const pathname = new URL(webRequest.url).pathname;
    const webRes = pathname === "/api/checkout"
      ? await handleCheckout(webRequest)
      : pathname === "/api/redeem-team-code"
        ? await handleRedeemTeamCode(webRequest)
      : pathname === "/api/stripe-webhook"
        ? await handleStripeWebhook(webRequest)
        : pathname === "/api/register"
          ? await handleRegister(webRequest)
          : pathname === "/api/login"
            ? await handleLogin(webRequest)
            : pathname === "/api/logout"
              ? await handleLogout(webRequest)
              : pathname === "/api/me"
                ? await handleMe(webRequest)
                : pathname === "/api/lead-magnet"
                  ? await handleLeadMagnetCapture(webRequest)
                  : pathname === "/api/lead-magnet/due"
                    ? await handleLeadMagnetDue(webRequest)
                    : pathname === "/api/unsubscribe"
                      ? await handleUnsubscribeApi(webRequest)
                    : pathname === "/unsubscribe"
                      ? await handleUnsubscribePage(webRequest)
                      : pathname === "/api/refund-request"
                        ? await handleRefundRequest(webRequest)
                      : pathname === "/api/refunds/pending"
                        ? await handleRefundsPending(webRequest)
                      : pathname === "/api/refunds/approve"
                        ? await handleRefundApprove(webRequest)
                      : pathname === "/api/refunds/reject"
                        ? await handleRefundReject(webRequest)
                      : pathname === DOWNLOAD_PATH
                        ? await handleDownloadRequest(webRequest)
                        : await fetchHandler.fetch(webRequest);
    res.statusCode = webRes.status;
    webRes.headers.forEach((value, key) => res.setHeader(key, value));
    if (webRes.body) {
      const reader = webRes.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    // Log the detail server-side (captured by the host's function logs); never
    // return a stack trace to the public visitor of the site.
    console.error("[team-site] SSR request failed", error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain");
    res.end("Internal Server Error");
  }
}

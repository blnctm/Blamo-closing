import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  downloadWithCode,
  gatedAudioUrl,
  fetchPendingTestimonials,
  logoutAccount,
  me,
  redeemTeamCode,
  requestRefund,
  resolveTestimonial,
  startCheckout,
} from "~/lib/client-api";
import type {
  ClientPurchase,
  ClientTestimonial,
  ClientUser,
} from "~/lib/client-api";
import {
  STORE_PRODUCTS,
  findStoreProduct,
  formatPrice,
} from "~/lib/store-products";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: Account,
});

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#0F172A" />
      <path
        d="M12 21l5.5 5.5L28 14"
        stroke="#F59E0B"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const STATUS_LABEL: Record<ClientPurchase["status"], string> = {
  pending: "Payment pending",
  paid: "Confirming payment",
  unlocked: "Unlocked",
  refunded: "Refunded",
};

/** 30 days, in milliseconds — mirrors REFUND_WINDOW_MS in src/routes/api/-refunds.ts. */
const REFUND_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const REFUND_STATE_LABEL: Record<string, string> = {
  pending: "Refund requested — we're reviewing it.",
  approved: "Refund approved.",
  rejected: "Refund request declined.",
  refunded: "Refunded — the unlock has been revoked.",
};

function DownloadButton({
  purchase,
}: {
  purchase: ClientPurchase;
}) {
  const product = findStoreProduct(purchase.productSlug);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDownload() {
    if (!product || !product.fileName || !purchase.confirmationCode || busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      await downloadWithCode(
        purchase.productSlug,
        purchase.confirmationCode,
        product.fileName,
      );
    } catch {
      setErrorMsg("Download failed — please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (!product || !product.fileName || !purchase.confirmationCode) return null;
  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400 disabled:opacity-60"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
          <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
        </svg>
        Download
      </button>
      <div className="mt-3 rounded-lg bg-slate-50 p-3"><p className="mb-2 text-xs font-semibold text-slate-600">Included MP3 audio</p><audio controls preload="none" className="h-11 w-full" src={gatedAudioUrl(purchase.productSlug)} aria-label={`Play ${product.name} audio`} /></div>
      {errorMsg && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {errorMsg}
        </p>
      )}
    </div>
  );
}

/**
 * Inline "Request refund" control for one purchase. Rendered only for
 * unlocked purchases with no existing request that are still inside the
 * 30-day window. On success the parent refreshes /api/me so the row shows
 * the new refund_status.
 */
function RefundControl({
  purchase,
  onRefunded,
}: {
  purchase: ClientPurchase;
  onRefunded: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const outsideWindow =
    Date.now() - new Date(purchase.createdAt).getTime() > REFUND_WINDOW_MS;

  // Only unlocked purchases can request a refund (revoked/refunded rows and
  // not-yet-unlocked rows get no control at all).
  if (purchase.status !== "unlocked") return null;

  // Existing request → show its state, no button.
  if (purchase.refundStatus) {
    return (
      <p className="mt-2 text-sm font-medium text-slate-500">
        {REFUND_STATE_LABEL[purchase.refundStatus] ?? "Refund request on file."}
      </p>
    );
  }
  // Outside the window → muted text, no button.
  if (outsideWindow) {
    return (
      <p className="mt-2 text-sm text-slate-400">
        Outside 30-day refund window
      </p>
    );
  }

  async function handleRequest() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      await requestRefund(purchase.productSlug);
      setMsg({
        kind: "ok",
        text: "Refund requested — we'll review it and reply to the email on your account.",
      });
      onRefunded();
    } catch (error) {
      setMsg({
        kind: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to request a refund right now.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRequest}
        disabled={busy}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
      >
        {busy ? "Requesting…" : "Request refund"}
      </button>
      {msg && (
        <p
          role="alert"
          className={`mt-2 text-sm ${msg.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}

function BuyNowButton({ slug }: { slug: string }) {
  const product = findStoreProduct(slug);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleBuy() {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const url = await startCheckout(slug);
      window.location.href = url;
    } catch (error) {
      // Shouldn't happen on /account (the buyer is logged in), but if a
      // session expired mid-page, send them through login and back here.
      if (error instanceof Error && error.message === "login_required") {
        window.location.href = `/login?next=${encodeURIComponent("/account")}`;
        return;
      }
      setErrorMsg(
        "Checkout is temporarily unavailable — please try again in a moment.",
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleBuy}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
      >
        {busy ? "Starting checkout…" : `Buy now — ${formatPrice(product?.priceCents ?? 2499)}`}
      </button>
      {errorMsg && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {errorMsg}
        </p>
      )}
    </div>
  );
}

function PurchaseCard({
  purchase,
  onRefunded,
}: {
  purchase: ClientPurchase;
  onRefunded: () => void;
}) {
  const product = findStoreProduct(purchase.productSlug);
  const isBundle = product?.isBundle === true;
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">
          {product?.name ?? purchase.productSlug}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">
          Status:{" "}
          <span className="font-medium text-slate-700">
            {STATUS_LABEL[purchase.status] ?? purchase.status}
          </span>
        </p>
        {isBundle ? (
          <p className="mt-2 text-sm text-slate-600">
            One purchase unlocks every title —{" "}
            <span className="font-medium text-slate-800">
              all current and future releases
            </span>
            . Download each title from the list below.
          </p>
        ) : (
          <>
            {purchase.status === "unlocked" && purchase.confirmationCode && (
              <p className="mt-2 text-sm text-slate-600">
                Your unlock code:{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm font-semibold tracking-wider text-slate-900">
                  {purchase.confirmationCode}
                </code>
              </p>
            )}
            {purchase.status !== "unlocked" && (
              <p className="mt-2 text-sm text-slate-500">
                {purchase.status === "refunded"
                  ? "This purchase was refunded — the download has been revoked."
                  : "Your unlock code appears here the moment payment confirms."}
              </p>
            )}
          </>
        )}
        {/* Refund control: unlocked + no request + inside 30 days → button;
            otherwise state text or nothing (see RefundControl). */}
        <RefundControl purchase={purchase} onRefunded={onRefunded} />
      </div>
      {purchase.status === "unlocked" && !isBundle && (
        <DownloadButton purchase={purchase} />
      )}
    </li>
  );
}

function TeamCodeCard({ purchases, onRedeemed }: { purchases: ClientPurchase[]; onRedeemed: () => void }) {
 const [code,setCode]=useState(""); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);
 const own=purchases.find(p=>p.productSlug==='team-license' && p.status==='unlocked');
 async function submit(){setBusy(true);setMsg("");try{await redeemTeamCode(code);setMsg("Team license activated — the whole library is unlocked");onRedeemed();}catch(e){setMsg(e instanceof Error && e.message==='team_code_full'?'This team code is full.':e instanceof Error && e.message==='invalid_team_code'?'That team code is not valid.':'Unable to redeem this code.');}finally{setBusy(false);}}
 return <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-xl font-bold text-slate-900">{own?'Your Team License':'Redeem a team code'}</h2><p className="mt-2 text-sm text-slate-600">Share or enter a manager’s code to unlock the entire library.</p><div className="mt-4 flex gap-2"><input value={code} onChange={e=>setCode(e.target.value)} placeholder="TEAM-ABC123" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5"/><button onClick={submit} disabled={busy||!code} className="rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white">{busy?'Activating…':'Redeem'}</button></div>{own&&<p className="mt-3 font-mono font-bold">Your team code is available from your purchase confirmation.</p>}{msg&&<p className="mt-3 text-sm font-semibold text-slate-700">{msg}</p>}</section>;
}

const OWNER_EMAIL = "blnctm@gmail.com";

/**
 * Owner-only moderation panel for buyer testimonials. Rendered on /account
 * ONLY when the logged-in user's email is the owner's; the server endpoints
 * independently enforce the same check (401 for anyone else).
 */
function PendingReviewsAdmin() {
  const [reviews, setReviews] = useState<ClientTestimonial[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPendingTestimonials()
      .then((rows) => {
        if (!cancelled) setReviews(rows);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    const rows = await fetchPendingTestimonials();
    setReviews(rows);
  }

  async function handleResolve(id: string, action: "approve" | "reject") {
    if (busyId) return;
    setBusyId(id);
    setMsg(null);
    try {
      await resolveTestimonial(id, action);
      await refresh();
    } catch {
      setMsg("Unable to update that review right now.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        Pending reviews
      </h2>
      {reviews === null ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
          Loading reviews…
        </p>
      ) : reviews.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">
          No pending reviews
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">
                  {review.userName || review.userEmail || "Anonymous"}
                </p>
                <time className="text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
              </div>
              {review.productName && (
                <p className="mt-0.5 text-sm font-medium text-amber-700">
                  {review.productName}
                </p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                “{review.text}”
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleResolve(review.id, "approve")}
                  disabled={busyId === review.id}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve(review.id, "reject")}
                  disabled={busyId === review.id}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {msg && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {msg}
        </p>
      )}
    </section>
  );
}

function Account() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [purchases, setPurchases] = useState<ClientPurchase[]>([]);
  const [teamCode, setTeamCode] = useState<{code:string;maxSeats:number;seatsUsed:number} | null>(null);

  useEffect(() => {
    let cancelled = false;
    me()
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setUser(data.user);
          setPurchases(data.purchases);
          setTeamCode(data.teamCode ? { code: data.teamCode.code, maxSeats: data.teamCode.maxSeats, seatsUsed: data.teamCode.seatsUsed } : null);
        }
      })
      .catch(() => {
        // Network hiccup — treat as logged out so the page stays usable.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await logoutAccount();
    } catch {
      // Even if the request fails, bounce to home; the cookie expires on its own.
    }
    window.location.href = "/";
  }

  const purchasedSlugs = new Set(purchases.map((purchase) => purchase.productSlug));
  const available = STORE_PRODUCTS.filter(
    (product) => !purchasedSlugs.has(product.slug),
  );
  const isOwner = !!user && user.email.toLowerCase() === OWNER_EMAIL;

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Blamo<span className="text-slate-400"> Closing</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-lg py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Store
            </a>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        {loading ? (
          <p className="text-center text-slate-500">Loading your account…</p>
        ) : !user ? (
          /* Logged out */
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <LogoMark className="mx-auto h-12 w-12" />
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
              You’re not logged in
            </h1>
            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Log in to see your purchases, unlock codes, and downloads.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/login?next=/account"
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400"
              >
                Log in
              </a>
              <a
                href="/register?next=/account"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
              >
                Create an account
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Profile */}
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Hi, {user.name.split(" ")[0] || "there"} 👋
              </h1>
              <p className="mt-2 text-slate-600">
                <span className="font-medium text-slate-800">{user.name}</span>{" "}
                · {user.email}
              </p>
            </section>

            <>{teamCode && <section className="mt-8 rounded-2xl border-2 border-amber-300 bg-slate-900 p-6 text-white"><h2 className="text-xl font-bold">Your Team License</h2><p className="mt-2 text-slate-300">Share this code with your reps — they redeem it at registration or here.</p><div className="mt-4 flex flex-wrap items-center gap-3"><input readOnly value={teamCode.code} onFocus={(e) => e.currentTarget.select()} className="w-56 rounded-lg border border-amber-300 bg-white px-3 py-2.5 font-mono font-bold tracking-wider text-slate-900" aria-label="Your team code" /><button type="button" onClick={() => navigator.clipboard?.writeText(teamCode.code)} className="rounded-lg bg-amber-400 px-4 py-2.5 font-bold text-slate-950">Copy code</button></div><p className="mt-4 font-semibold text-amber-300">{teamCode.seatsUsed} of {teamCode.maxSeats} seats used</p></section>}</>
      <TeamCodeCard purchases={purchases} onRedeemed={() => me().then(d => d && setPurchases(d.purchases))} />

            {/* Purchases */}
            <section className="mt-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Your purchases
              </h2>
              {purchases.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">
                  You haven’t bought anything yet — grab a guide below and your
                  download shows up here instantly.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {purchases.map((purchase) => (
                    <PurchaseCard
                      key={purchase.id}
                      purchase={purchase}
                      onRefunded={() =>
                        me().then((d) => d && setPurchases(d.purchases))
                      }
                    />
                  ))}
                </ul>
              )}
            </section>

            {/* Owner moderation: pending reviews (owner email only) */}
            {isOwner && <PendingReviewsAdmin />}

            {/* Available products */}
            {available.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  More training to buy
                </h2>
                <ul className="mt-4 space-y-3">
                  {available.map((product) => (
                    <li
                      key={product.slug}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {product.kindLabel} · {formatPrice(product.priceCents)}
                        </p>
                      </div>
                      <BuyNowButton slug={product.slug} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-6 w-6" />
            <span className="text-sm font-semibold text-slate-700">
              Blamo Closing
            </span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Blamo Closing · Original training
            material
          </p>
        </div>
      </footer>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/* ════════════════════════════════════════════════════════════════════
 * CONFIG — buy button destination
 * ---------------------------------------------------------------------
 * The buy buttons point to the owner's PayPal checkout (paypal.me link).
 * To change the payment destination, replace PAYMENT_LINK below with
 * any checkout URL (PayPal button, Stripe, etc.) — this is the ONE-LINE
 * CHANGE. While it reads PAYMENT_LINK_PLACEHOLDER, clicking the button
 * shows a "store opening soon" notice instead of navigating.
 * ════════════════════════════════════════════════════════════════════ */
const PAYMENT_LINK = "https://py.pl/6MxgCaYORDvb1AAoaxma7Q";
/* ════════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════════
 * CONFIG — The 10 Steps of the Sale buy button destination
 * ---------------------------------------------------------------------
 * The owner will provide a dedicated payment link for this product;
 * when it arrives, swap TEN_STEPS_PAYMENT_LINK below (ONE-LINE CHANGE).
 * Until then it intentionally points at the same PayPal link as the
 * Starter Kit.
 * ════════════════════════════════════════════════════════════════════ */
const TEN_STEPS_PAYMENT_LINK = "https://py.pl/6MxgCaYORDvb1AAoaxma7Q";
/* ════════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════════
 * CONFIG — The Five Closes in Action buy button destination
 * ---------------------------------------------------------------------
 * The owner will provide a dedicated payment link for this video product;
 * when it arrives, swap VIDEO_PAYMENT_LINK below (ONE-LINE CHANGE).
 * Until then it intentionally points at the same PayPal link as the
 * other products.
 * ════════════════════════════════════════════════════════════════════ */
const VIDEO_PAYMENT_LINK = "https://py.pl/6MxgCaYORDvb1AAoaxma7Q";
/* ════════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════════
 * CONFIG — The 10 Steps to the Internet Sale buy button destination
 * ---------------------------------------------------------------------
 * The owner will provide a dedicated payment link for this product;
 * when it arrives, swap INTERNET_SALES_PAYMENT_LINK below (ONE-LINE
 * CHANGE). Until then it intentionally points at the same PayPal link
 * as the other products.
 * ════════════════════════════════════════════════════════════════════ */
const INTERNET_SALES_PAYMENT_LINK = "https://py.pl/6MxgCaYORDvb1AAoaxma7Q";
/* ════════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════════
 * CONFIG — The Spouse Objection Playbook buy button destination
 * ---------------------------------------------------------------------
 * $2.99 entry-tier playbook. Uses the OWNER-SUPPLIED DEDICATED $2.99
 * PayPal link (ratified 2026-08-02) — used for ALL $2.99 playbook sales.
 * ════════════════════════════════════════════════════════════════════ */
const SPOUSE_PAYMENT_LINK = "https://py.pl/bzHDNbxFYtCgfznaIlxIRg";
/* ════════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════════
 * CONFIG — The "Pray About It" Objection Playbook buy button destination
 * ---------------------------------------------------------------------
 * $2.99 entry-tier playbook. Uses the owner-supplied dedicated $2.99
 * PayPal link (ratified 2026-08-02) — used for ALL $2.99 playbook sales.
 * ════════════════════════════════════════════════════════════════════ */
const PRAY_ABOUT_IT_PAYMENT_LINK = "https://py.pl/bzHDNbxFYtCgfznaIlxIRg";
/* ════════════════════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════════════
 * CONFIG — The "I Want More for My Trade-In" Playbook buy button
 * ---------------------------------------------------------------------
 * $2.99 entry-tier playbook. Uses the owner-supplied dedicated $2.99
 * PayPal link (ratified 2026-08-02) — used for ALL $2.99 playbook sales.
 * ════════════════════════════════════════════════════════════════════ */
const TRADE_IN_PAYMENT_LINK = "https://py.pl/bzHDNbxFYtCgfznaIlxIRg";
/* ════════════════════════════════════════════════════════════════════ */

export const Route = createFileRoute("/")({
  component: Home,
});

/* ---------- Brand ---------- */

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

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span
      className={
        light
          ? "text-lg font-bold tracking-tight text-white"
          : "text-lg font-bold tracking-tight text-slate-900"
      }
    >
      Blamo<span className="text-slate-400"> Closing</span>
    </span>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.7 12.585l6.59-6.59a1 1 0 0 1 1.415-.006Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
      {children}
    </p>
  );
}

/* ---------- Buy button ---------- */

function BuyButton({
  size = "lg",
  href = PAYMENT_LINK,
  label = "Get the Starter Kit — $9.99",
  ariaLabel = "Get the Starter Kit — $9.99",
}: {
  size?: "lg" | "sm";
  href?: string;
  label?: string;
  ariaLabel?: string;
}) {
  const [showNotice, setShowNotice] = useState(false);
  const placeholder = href === "PAYMENT_LINK_PLACEHOLDER";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (placeholder) {
      e.preventDefault();
      setShowNotice(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <a
        href={href}
        onClick={handleClick}
        aria-label={ariaLabel}
        className={
          size === "lg"
            ? "group inline-flex items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            : "inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        }
      >
        {label}
        <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </a>
      {showNotice && (
        <p
          role="status"
          className="rounded-lg border border-amber-200/40 bg-amber-400/10 px-3.5 py-2 text-sm font-medium text-amber-200"
        >
          Store opening soon — checkout will be available shortly.
        </p>
      )}
    </div>
  );
}

/* ---------- Hero product mockup (pure CSS — no image assets) ---------- */

function ProductCard() {
  return (
    <div
      className="relative mx-auto w-full max-w-xs lg:max-w-sm"
      aria-hidden="true"
    >
      {/* Quick-reference card peeking from behind */}
      <div className="absolute -top-4 -right-3 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Quick card
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded-full bg-amber-300/80" />
        </div>
      </div>

      {/* The guide itself */}
      <div className="relative -rotate-1 rounded-2xl bg-slate-900 p-7 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between gap-3">
          <LogoMark className="h-8 w-8" />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
            PDF · 12 pages
          </span>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          The Sales Rep
        </p>
        <h3 className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-white">
          Starter Kit
        </h3>
        <div className="mt-10 border-t border-white/10 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Five closes · word-for-word scripts
            <br />
            Readiness checks · follow-through plan
          </p>
          <p className="mt-4 text-2xl font-bold text-amber-300">$9.99</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            one-time · downloadable PDF · intro price
          </p>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">
          Close with clarity—not pressure.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Built for same-day use
        </p>
      </div>
    </div>
  );
}

/* ---------- 10 Steps product mockup (pure CSS — no image assets) ---------- */

function TenStepsProductCard() {
  return (
    <div
      className="relative mx-auto w-full max-w-xs lg:max-w-sm"
      aria-hidden="true"
    >
      {/* Quick-reference card peeking from behind */}
      <div className="absolute -top-4 -right-3 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Quick card
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded-full bg-amber-300/80" />
        </div>
      </div>

      {/* The guide itself */}
      <div className="relative -rotate-1 rounded-2xl bg-slate-900 p-7 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between gap-3">
          <LogoMark className="h-8 w-8" />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
            PDF · 14 pages
          </span>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          The 10 Steps
        </p>
        <h3 className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-white">
          of the Sale
        </h3>
        <div className="mt-10 border-t border-white/10 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Meet & Greet → Follow-up
            <br />
            Word-for-word scripts · checklists
          </p>
          <p className="mt-4 text-2xl font-bold text-amber-300">$9.99</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            one-time · downloadable PDF · intro price
          </p>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">
          Run the whole sale, start to finish.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Built for the dealership floor
        </p>
      </div>
    </div>
  );
}

/* ---------- Five Closes video product card (poster art) ---------- */

function VideoProductCard() {
  return (
    <div
      className="relative mx-auto w-full max-w-xs lg:max-w-sm"
      aria-hidden="true"
    >
      {/* Play badge peeking from behind */}
      <div className="absolute -top-4 -right-3 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Watch it
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-slate-950" aria-hidden="true">
              <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.84Z" />
            </svg>
          </span>
          <span className="text-[11px] font-semibold text-slate-900">
            ~10 min
          </span>
        </div>
      </div>

      {/* The poster itself */}
      <div className="relative -rotate-1 overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <img
          src="/video-poster.png"
          alt="The Five Closes in Action — video poster"
          className="w-full"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent px-5 pb-4 pt-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
            Video · ~10 min · MP4
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-white">
            The Five Closes in Action
          </p>
          <p className="mt-2 text-lg font-bold text-amber-300">$9.99</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-300">
            one-time · downloadable MP4 · intro price
          </p>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">
          Hear it before you use it.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Five closes, realistic dialogue
        </p>
      </div>
    </div>
  );
}

/* ---------- 10 Steps to the Internet Sale product mockup (pure CSS — no image assets) ---------- */

function InternetSalesProductCard() {
  return (
    <div
      className="relative mx-auto w-full max-w-xs lg:max-w-sm"
      aria-hidden="true"
    >
      {/* Quick-reference card peeking from behind */}
      <div className="absolute -top-4 -right-3 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Quick card
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded-full bg-amber-300/80" />
        </div>
      </div>

      {/* The guide itself */}
      <div className="relative -rotate-1 rounded-2xl bg-slate-900 p-7 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between gap-3">
          <LogoMark className="h-8 w-8" />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
            PDF · 15 pages
          </span>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          The 10 Steps to
        </p>
        <h3 className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-white">
          the Internet Sale
        </h3>
        <div className="mt-10 border-t border-white/10 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Respond in 5 min → close before they walk in
            <br />
            Scripts · BLAMO Video Formula
          </p>
          <p className="mt-4 text-2xl font-bold text-amber-300">$9.99</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            one-time · downloadable PDF · intro price
          </p>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">
          Win the lead before they walk in.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Built for internet sales & BDC
        </p>
      </div>
    </div>
  );
}

/* ---------- Spouse Objection Playbook product mockup (pure CSS — no image assets) ---------- */

function SpouseProductCard() {
  return (
    <div
      className="relative mx-auto w-full max-w-xs lg:max-w-sm"
      aria-hidden="true"
    >
      {/* Quick-reference card peeking from behind */}
      <div className="absolute -top-4 -right-3 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Quick card
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded-full bg-amber-300/80" />
        </div>
      </div>

      {/* The guide itself */}
      <div className="relative -rotate-1 rounded-2xl bg-slate-900 p-7 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between gap-3">
          <LogoMark className="h-8 w-8" />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
            PDF · 14 pages
          </span>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          The Spouse Objection
        </p>
        <h3 className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-white">
          Playbook
        </h3>
        <div className="mt-10 border-t border-white/10 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Ten closes · word-for-word scripts
            <br />
            Partnership → Gentle · diagnosis guide
          </p>
          <p className="mt-4 text-2xl font-bold text-amber-300">$2.99</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            one-time · downloadable PDF · entry tier
          </p>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">
          Respect the partnership. Save the deal.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Ten closes, zero pressure
        </p>
      </div>
    </div>
  );
}

/* ---------- Pray About It Objection Playbook product mockup (pure CSS — no image assets) ---------- */

function PrayAboutItProductCard() {
  return (
    <div
      className="relative mx-auto w-full max-w-xs lg:max-w-sm"
      aria-hidden="true"
    >
      {/* Quick-reference card peeking from behind */}
      <div className="absolute -top-4 -right-3 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Quick card
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded-full bg-amber-300/80" />
        </div>
      </div>

      {/* The guide itself */}
      <div className="relative -rotate-1 rounded-2xl bg-slate-900 p-7 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between gap-3">
          <LogoMark className="h-8 w-8" />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
            PDF · 13 pages
          </span>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          The “Pray About It”
        </p>
        <h3 className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-white">
          Objection Playbook
        </h3>
        <div className="mt-10 border-t border-white/10 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Eight closes · word-for-word scripts
            <br />
            Clarifying → Respect · what to avoid
          </p>
          <p className="mt-4 text-2xl font-bold text-amber-300">$2.99</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            one-time · downloadable PDF · entry tier
          </p>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">
          Honor the belief. Never weaponize it.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Eight respectful closes
        </p>
      </div>
    </div>
  );
}

/* ---------- Trade-In Objection Playbook product mockup (pure CSS — no image assets) ---------- */

function TradeInProductCard() {
  return (
    <div
      className="relative mx-auto w-full max-w-xs lg:max-w-sm"
      aria-hidden="true"
    >
      {/* Quick-reference card peeking from behind */}
      <div className="absolute -top-4 -right-3 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Quick card
        </p>
        <div className="mt-2 space-y-1.5">
          <div className="h-1.5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
          <div className="h-1.5 w-3/5 rounded-full bg-amber-300/80" />
        </div>
      </div>

      {/* The guide itself */}
      <div className="relative -rotate-1 rounded-2xl bg-slate-900 p-7 text-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <div className="flex items-center justify-between gap-3">
          <LogoMark className="h-8 w-8" />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-amber-300">
            PDF · 15 pages
          </span>
        </div>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          The “I Want More
        </p>
        <h3 className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-white">
          for My Trade-In”
        </h3>
        <div className="mt-10 border-t border-white/10 pt-4">
          <p className="text-[11px] leading-relaxed text-slate-400">
            Ten closes · word-for-word scripts
            <br />
            Isolation → Commitment · favorite close
          </p>
          <p className="mt-4 text-2xl font-bold text-amber-300">$2.99</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">
            one-time · downloadable PDF · entry tier
          </p>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">
          Win the whole deal, not one number.
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          The owner’s favorite trade close
        </p>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

function Home() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <Wordmark />
          </a>
          <div className="hidden items-center gap-5 sm:flex">
            <a
              href="#ten-steps"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              The 10 Steps
            </a>
            <a
              href="#five-closes"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              The Five Closes
            </a>
            <a
              href="#internet-sales"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              The Internet Sale
            </a>
            <a
              href="#spouse"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Spouse
            </a>
            <a
              href="#pray-about-it"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Pray About It
            </a>
            <a
              href="#trade-in"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Trade-In
            </a>
            <a
              href="#buy"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Get the Starter Kit
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_75%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <img src="/blamo-mascot.svg" alt="" aria-hidden="true" className="mascot-float pointer-events-none absolute -right-8 bottom-5 hidden w-40 opacity-[0.16] lg:block" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 pt-16 pb-24 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:pt-28 lg:pb-32">
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              New · The Sales Rep Starter Kit
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Close with clarity—{" "}
              <span className="whitespace-nowrap underline decoration-amber-400 decoration-[6px] underline-offset-8">
                not pressure.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:mx-0">
              A practical, script-first guide to leading qualified buyers to a
              clear next step, with five adaptable closes,
              business-understanding prompts, and a repeatable follow-through
              checklist.
            </p>
            <div className="mt-9 flex justify-center sm:justify-start">
              <BuyButton />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 12-page PDF · Same-day use
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/thanks"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Already purchased? Enter your code to download
              </a>
            </p>
          </div>
          <div className="mt-6 pb-6 lg:mt-0">
            <ProductCard />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What it does for you</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sound like a professional, not a closer
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              The Starter Kit turns closing into a clear, repeatable skill — so
              you can ask for the next step with confidence.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              "Use five core closes in real conversations without sounding robotic or pushy.",
              "Recognize buying signals and test for readiness before asking for a decision.",
              "Translate your offer into the buyer’s business priorities, risks, and next steps.",
              "Leave every call with a clear owner, date, and action instead of a vague “I’ll follow up.”",
              "Adapt the words to your voice while keeping the structure that makes a close useful.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What's inside */}
      <section id="inside" className="bg-slate-50 scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What’s inside</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need for the next conversation
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "A grounded definition of closing as a natural next step—not a pressure trick.",
                "The Assumptive, Alternative-Choice, Summary, Trial, and Honest Urgency closes.",
                "Word-for-word scripts, best-use moments, cautions, and adaptations for each close.",
                "A short framework for understanding the business you sell and the buyer’s business.",
                "A pre-close readiness check, conversation checklist, objection prompts, and follow-through plan.",
                "Practice drills and a one-page quick-reference card.",
              ].map((item) => (
                <li
                  key={item}
                  className="product-card flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[0.95rem] leading-relaxed text-slate-700">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            <aside className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Delivered as a PDF
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                One downloadable 12-page PDF with practical explanations,
                scripts, checklists, and exercises designed for same-day use.
                Download it right after checkout and keep it forever.
              </p>
              <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">
                The Starter Kit is the first release from Blamo Closing —
                video training is coming next.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="audience" className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            New reps and mid-level reps alike
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            This kit is for new sales reps who want a usable structure for
            their next conversation and mid-level reps who want to make their
            closing language clearer and more consistent. It works across many
            consultative B2B and B2C sales settings; adapt the examples to your
            offer, market, authority, and actual terms.
          </p>
        </div>
      </section>

      {/* CTA band */}
      <section id="buy" className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Close your next conversation with clarity
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get the Starter Kit — a 12-page PDF you can put to work today.
            Download it instantly after purchase.
          </p>
          <div className="mt-9 flex justify-center">
            <BuyButton />
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/thanks"
              className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
            >
              Already purchased? Enter your code to download
            </a>
          </p>
          <p className="mt-6 text-sm text-slate-400">
            No manufactured urgency. No pressure tactics. Just clear next
            steps.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Questions, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Is this a script to memorize?",
                a: "No. The scripts are starting points. Learn the intent and structure, then use language that sounds like you and accurately reflects your offer.",
              },
              {
                q: "Does it teach high-pressure or manipulative tactics?",
                a: "No. The guide treats a close as a clear next step for a qualified buyer. It does not recommend misleading claims, manufactured scarcity, or pushing someone who is not a fit.",
              },
              {
                q: "Can I use it for my industry?",
                a: "Yes, if you adapt the examples to your product, buying process, compliance requirements, and customer. The questions and close structures are intentionally broad.",
              },
              {
                q: "What do I receive?",
                a: "A downloadable PDF guide with practical explanations, scripts, checklists, and exercises designed for same-day use. Pay securely via PayPal, then open the download page, enter the confirmation code we email you, and get your PDF — the \"Download your PDF\" link in the footer takes you there.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900">{q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * THE 10 STEPS OF THE SALE — SECOND PRODUCT
       * ═══════════════════════════════════════════════════════════ */}

      {/* 10 Steps — product hero */}
      <section
        id="ten-steps"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_25%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <img src="/blamo-car.svg" alt="" aria-hidden="true" className="mascot-float pointer-events-none absolute -bottom-3 -left-16 hidden w-56 opacity-[0.12] lg:block" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-28">
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              New · The 10 Steps of the Sale
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Sell the whole sale—{" "}
              <span className="whitespace-nowrap underline decoration-amber-400 decoration-[6px] underline-offset-8">
                from the handshake to the follow-up call.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:mx-0">
              The complete car dealership sales process in one guide: the
              owner’s own ten-step method for building trust, matching the
              right car, handling objections honestly, and turning first-time
              buyers into repeat customers and referrals — with word-for-word
              scripts for every step.
            </p>
            <div className="mt-9 flex justify-center sm:justify-start">
              <BuyButton
                href={TEN_STEPS_PAYMENT_LINK}
                label="Get The 10 Steps of the Sale — $9.99"
                ariaLabel="Get The 10 Steps of the Sale — $9.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 14-page PDF · Same-day use
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/thanks?product=ten-steps"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Already purchased? Enter your code to download
              </a>
            </p>
          </div>
          <div className="mt-6 pb-6 lg:mt-0">
            <TenStepsProductCard />
          </div>
        </div>
      </section>

      {/* 10 Steps — benefits */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What it does for you</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A complete process, not a bag of tricks
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Run every customer through the same ten steps in order — so you
              never skip a step, never guess what comes next, and always know
              what to say.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              "Run every customer through the full process in order — no skipped steps, no guessing what comes next.",
              "Know exactly what to say at every moment: greeting lines and ice-breakers, needs-discovery questions, the walk-around talk track, test-drive guidance, and the paperwork walkthrough.",
              "Handle price, financing, and feature objections with honest, no-pressure responses that keep the trust intact.",
              "Negotiate to a genuine win-win: set your range before you sit down, trade value for value, and close deals both sides feel good about.",
              "Turn one sale into many — delivery-day details and follow-up scripts that earn reviews, referrals, and repeat buyers.",
              "Use it same-day: a checklist for every step, a one-page quick reference for the lot, and a 7-day practice plan.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 10 Steps — what's inside */}
      <section className="bg-slate-50 scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What’s inside</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every step, every script, every checklist
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "All 10 steps in order: Meet & Greet, Understand Needs, Showcase Features, Test Drive, Review Feedback, Address Objections, Negotiations, Paperwork, Delivery, and Follow-up.",
                "The goal of each step, the process in the owner’s own words, and the one common mistake to avoid.",
                "Word-for-word what-to-say lines and scripts for every step — from the first “Hi there, welcome in” to the follow-up call and email template.",
                "A negotiation planning framework: know your range, listen for what the customer actually cares about, and find the win-win.",
                "A checklist for every step, a 7-day first-week practice plan, and a quick-reference one-pager you can keep in your pocket.",
              ].map((item) => (
                <li
                  key={item}
                  className="product-card flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[0.95rem] leading-relaxed text-slate-700">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            <aside className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Delivered as a PDF
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                One downloadable 14-page PDF with the owner’s full ten-step
                sales process, word-for-word scripts, checklists, a 7-day
                practice plan, and a pocket quick-reference one-pager. Download
                it right after checkout and keep it forever.
              </p>
              <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">
                Pairs with the Starter Kit: use the 10 Steps to run the sale,
                and the Starter Kit to sharpen the close.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* 10 Steps — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Car dealership sales reps
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            New reps who want a complete process to follow from their very
            first greeting, and experienced reps who want to plug the gaps in
            their current approach. The process is built on real dealership
            sales floor work and applies to new and used cars alike.
          </p>
        </div>
      </section>

      {/* 10 Steps — CTA band */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Run the whole sale, start to finish
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get The 10 Steps of the Sale — a 14-page PDF you can put to work
            today. Download it instantly after purchase.
          </p>
          <div className="mt-9 flex justify-center">
            <BuyButton
              href={TEN_STEPS_PAYMENT_LINK}
              label="Get The 10 Steps of the Sale — $9.99"
              ariaLabel="Get The 10 Steps of the Sale — $9.99"
            />
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/thanks?product=ten-steps"
              className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
            >
              Already purchased? Enter your code to download
            </a>
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Honest scripts. No-pressure objections. Win-win negotiations.
          </p>
        </div>
      </section>

      {/* 10 Steps — FAQs */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The 10 Steps, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Is this the same as the Sales Rep Starter Kit?",
                a: "No. The Starter Kit teaches five closing techniques. This guide is the complete sales process — all ten steps from meeting the customer to following up after delivery. They pair well: use the 10 Steps to run the sale, and the Starter Kit to sharpen the close.",
              },
              {
                q: "Does it work for used cars too?",
                a: "Yes. The ten steps apply to any car sale, new or used. Adapt the feature talk to the specific car in front of you and the process holds up.",
              },
              {
                q: "What do I receive?",
                a: "A downloadable PDF guide with word-for-word scripts, checklists, a 7-day practice plan, and a quick-reference one-pager — built for same-day use. Your confirmation code is emailed to you after checkout — enter it on the download page. Already purchased? ",
                link: true,
              },
              {
                q: "Is this high-pressure sales training?",
                a: "No. Every script in the guide is honest and pressure-free: real features, real numbers, real availability, and win-win negotiations. It teaches you to build trust and help people decide with confidence — never to manipulate.",
              },
            ].map(({ q, a, link }) => (
              <details
                key={q}
                className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900">{q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">
                  {a}
                  {link && (
                    <>
                      <a
                        href="/thanks?product=ten-steps"
                        className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
                      >
                        Enter your code to download
                      </a>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * THE FIVE CLOSES IN ACTION — THIRD PRODUCT (TRAINING VIDEO)
       * ═══════════════════════════════════════════════════════════ */}

      {/* Five Closes — product hero */}
      <section
        id="five-closes"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_75%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-28">
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              New · The Five Closes in Action
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Watch the five closes—{" "}
              <span className="whitespace-nowrap underline decoration-amber-400 decoration-[6px] underline-offset-8">
                in action.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:mx-0">
              A ~10-minute training video with realistic buyer/seller dialogue
              that shows exactly how each of the five core closes sounds in a
              real conversation — word-for-word. Built for car dealership sales
              reps who want to hear it before they use it.
            </p>
            <div className="mt-9 flex justify-center sm:justify-start">
              <BuyButton
                href={VIDEO_PAYMENT_LINK}
                label="Get The Five Closes in Action — $9.99"
                ariaLabel="Get The Five Closes in Action — $9.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · MP4 video · ~10 minutes · Same-day use
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/thanks?product=five-closes"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Already purchased? Enter your code to download
              </a>
            </p>
          </div>
          <div className="mt-6 pb-6 lg:mt-0">
            <VideoProductCard />
          </div>
        </div>
      </section>

      {/* Five Closes — what's inside / benefits */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What’s inside</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Hear every close, word-for-word
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Realistic dialogue, real situations, and a clear look at how each
              close is supposed to sound — so you can recognize it and use it
              yourself.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              "All five closes demonstrated with realistic dialogue: Assumptive, Alternative-Choice, Summary, Trial, and Honest Urgency.",
              "The three common closing mistakes — and how to avoid them.",
              "A recap and practice prompt so you can rehearse the same day.",
              "~10 minutes long — watch it in one sitting, keep it on your phone.",
              "Produced by Blamo Closing, fully branded, no filler.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Five Closes — who it's for */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dealership sales reps, new and experienced
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            This video is for dealership sales reps (new and experienced) who
            want to hear how the closes actually sound in a real conversation
            before they try them on the lot.
          </p>
        </div>
      </section>

      {/* Five Closes — CTA band */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Hear the closes before you use them
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get The Five Closes in Action — a ~10-minute MP4 you can watch in
            one sitting and keep on your phone. Download it instantly after
            purchase.
          </p>
          <div className="mt-9 flex justify-center">
            <BuyButton
              href={VIDEO_PAYMENT_LINK}
              label="Get The Five Closes in Action — $9.99"
              ariaLabel="Get The Five Closes in Action — $9.99"
            />
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/thanks?product=five-closes"
              className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
            >
              Already purchased? Enter your code to download
            </a>
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Honest closes. Realistic dialogue. No manipulation.
          </p>
        </div>
      </section>

      {/* Five Closes — FAQs */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The video, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Is this the same as the Sales Rep Starter Kit?",
                a: "No. The Starter Kit is a PDF guide with the scripts written out; this video shows the closes in action with realistic dialogue. They pair well: read the scripts, then watch them come to life.",
              },
              {
                q: "How do I receive it?",
                a: "Pay securely via PayPal, then open the download page, enter the confirmation code we email you, and get your video file (MP4, ~15 MB) — watch it on any device. The \"Download your video\" link in the footer also takes you there.",
                link: true,
              },
              {
                q: "Is this high-pressure sales training?",
                a: "No. Every close in the video is honest and pressure-free — realistic dialogue, real situations, no manipulation.",
              },
            ].map(({ q, a, link }) => (
              <details
                key={q}
                className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900">{q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">
                  {a}
                  {link && (
                    <>
                      <a
                        href="/thanks?product=five-closes"
                        className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
                      >
                        Enter your code to download
                      </a>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * THE 10 STEPS TO THE INTERNET SALE — FOURTH PRODUCT
       * ═══════════════════════════════════════════════════════════ */}

      {/* Internet Sale — product hero */}
      <section
        id="internet-sales"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_75%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <img src="/blamo-car.svg" alt="" aria-hidden="true" className="mascot-float pointer-events-none absolute -bottom-3 -left-16 hidden w-56 opacity-[0.12] lg:block" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-28">
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              New · The 10 Steps to the Internet Sale
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Win the internet lead—{" "}
              <span className="whitespace-nowrap underline decoration-amber-400 decoration-[6px] underline-offset-8">
                before they walk into another dealership.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:mx-0">
              A practical BLAMO Internet Sales field guide for responding
              fast, building trust, using personalized video, booking the
              appointment, and making the customer feel ready to meet you.
            </p>
            <div className="mt-9 flex justify-center sm:justify-start">
              <BuyButton
                href={INTERNET_SALES_PAYMENT_LINK}
                label="Get The 10 Steps to the Internet Sale — $9.99"
                ariaLabel="Get The 10 Steps to the Internet Sale — $9.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 15-page PDF · Same-day use
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/thanks?product=internet-sales"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Already purchased? Enter your code to download
              </a>
            </p>
          </div>
          <div className="mt-6 pb-6 lg:mt-0">
            <InternetSalesProductCard />
          </div>
        </div>
      </section>

      {/* Internet Sale — what you'll learn */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What you’ll learn</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A repeatable process for online leads
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Go from slow, generic responses to fast, human, video-first
              follow-up that gets the customer to the showroom — ready to buy.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              "The owner’s exact 10-step internet sales process, from Respond in Under 5 Minutes to Close Before They Walk In.",
              "Word-for-word first-response, rapport, appointment, confirmation, follow-up, and objection-handling templates.",
              "The complete BLAMO Video Formula, including the six steps and the 45-second structure.",
              "The nine best moments to send a personalized video, plus the BLAMO Rule of three videos per lead.",
              "The signature 3-3-3 Rule: name and introduction, vehicle and benefits, then a clear appointment ask.",
              "A seven-day internet lead follow-up plan and a quick-reference page for daily practice.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Internet Sale — what's inside */}
      <section className="bg-slate-50 scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What’s inside</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              From first response to a booked appointment
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "Opening guidance on why internet sales are different, how to use the guide, and the honesty rule.",
                "All 10 steps in the owner’s exact order, each with a goal, process, scripts, common mistake, checklist, drill, and bridge to the next step.",
                "The BLAMO Video Formula: Personalize, Introduce, Show the vehicle, Give one valuable reason to buy, Invite them in, Finish with confidence.",
                "The 45-second formula, video rules, nine send-moments, BLAMO Rule, and 3-3-3 Rule.",
                "The 7-Day Internet Lead Follow-Up bonus and a one-page reference.",
              ].map((item) => (
                <li
                  key={item}
                  className="product-card flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[0.95rem] leading-relaxed text-slate-700">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            <aside className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Delivered as a PDF
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                One downloadable 15-page PDF with the owner’s full internet
                sales process, word-for-word templates, the BLAMO Video
                Formula, and a 7-day follow-up plan. Download it right after
                checkout and keep it forever.
              </p>
              <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">
                Pairs with The 10 Steps of the Sale: use this guide to win the
                lead online, then run the in-store process when they arrive.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Internet Sale — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Internet sales reps, BDC reps & desk managers
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Internet sales reps, BDC representatives, product specialists, and
            desk managers at automotive dealerships who want a consistent,
            human process for working online leads.
          </p>
        </div>
      </section>

      {/* Internet Sale — CTA band */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Win the lead before they walk in
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get The 10 Steps to the Internet Sale — a 15-page PDF you can put
            to work today. Download it instantly after purchase.
          </p>
          <div className="mt-9 flex justify-center">
            <BuyButton
              href={INTERNET_SALES_PAYMENT_LINK}
              label="Get The 10 Steps to the Internet Sale — $9.99"
              ariaLabel="Get The 10 Steps to the Internet Sale — $9.99"
            />
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/thanks?product=internet-sales"
              className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
            >
              Already purchased? Enter your code to download
            </a>
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Respond fast. Build trust. Book the appointment.
          </p>
        </div>
      </section>

      {/* Internet Sale — FAQs */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The Internet Sale, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Is this the same as The 10 Steps of the Sale?",
                a: "No. The 10 Steps of the Sale covers the in-store floor process. This guide covers the internet-lead process before the customer arrives, and includes the complete BLAMO Video Formula.",
              },
              {
                q: "Is this the same as the Starter Kit?",
                a: "No. The Sales Rep Starter Kit focuses on five core closing techniques, scripts, objections, and practice. This guide focuses on speed-to-lead, rapport, video, value, appointments, and follow-up.",
              },
              {
                q: "Do I need video equipment?",
                a: "No. A phone camera is enough. The guide gives you the exact 45-second structure, what to show, the nine send-moments, and the rules for making the video feel natural.",
              },
              {
                q: "Does the guide promise a certain number of sales?",
                a: "No. It provides a practical process and honest templates. Results depend on the customer, inventory, dealership policies, and how consistently you practice and follow through.",
              },
              {
                q: "Can a new internet sales rep use it right away?",
                a: "Yes. Start with the under-five-minute response, practice the scripts out loud, and use the checklists and seven-day plan to build the habit one lead at a time.",
              },
              {
                q: "What do I receive?",
                a: "A downloadable PDF guide with the owner’s 10-step internet sales process, word-for-word templates, the BLAMO Video Formula, and a 7-day follow-up plan — built for same-day use. Your confirmation code is emailed to you after checkout — enter it on the download page. Already purchased? ",
                link: true,
              },
            ].map(({ q, a, link }) => (
              <details
                key={q}
                className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900">{q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">
                  {a}
                  {link && (
                    <>
                      <a
                        href="/thanks?product=internet-sales"
                        className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
                      >
                        Enter your code to download
                      </a>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * THE SPOUSE OBJECTION PLAYBOOK — FIFTH PRODUCT ($2.99)
       * ═══════════════════════════════════════════════════════════ */}

      {/* Spouse — product hero */}
      <section
        id="spouse"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_25%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <img src="/blamo-car.svg" alt="" aria-hidden="true" className="mascot-float pointer-events-none absolute -bottom-3 -left-16 hidden w-56 opacity-[0.12] lg:block" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-28">
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              New · The Spouse Objection Playbook
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Turn “I need to ask my spouse” into a conversation you can help
              win—{" "}
              <span className="whitespace-nowrap underline decoration-amber-400 decoration-[6px] underline-offset-8">
                not a dead end.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:mx-0">
              Ten word-for-word closes for the spouse objection, delivered with
              respect: validate the partnership, uncover the real concern, and
              keep the deal moving without pressure.
            </p>
            <div className="mt-9 flex justify-center sm:justify-start">
              <BuyButton
                href={SPOUSE_PAYMENT_LINK}
                label="Get The Spouse Objection Playbook — $2.99"
                ariaLabel="Get The Spouse Objection Playbook — $2.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 14-page PDF · $2.99 · Same-day use
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/thanks?product=spouse"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Already purchased? Enter your code to download
              </a>
            </p>
          </div>
          <div className="mt-6 pb-6 lg:mt-0">
            <SpouseProductCard />
          </div>
        </div>
      </section>

      {/* Spouse — what you'll learn */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What you’ll learn</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Respond to the spouse objection with confidence
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Know exactly what to say the moment the spouse objection comes
              up — and which close fits the real situation.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              "The owner’s ten closes in order — from the Partnership Close to the Gentle Close — each with a word-for-word script.",
              "How to tell whether the spouse is the true decision-maker or a polite cover for another concern: price, payment, trade value, or uncertainty.",
              "The Partnership Close, the best default for almost every spouse objection, and why it works.",
              "The Permission Close, the Reality Check, and the Test Close — the fastest ways to find out what’s really holding the deal back.",
              "How to offer the call or FaceTime without sounding pushy, and how to make a reservation offer you can actually honor.",
              "The four signals that separate a genuine partnership decision from a delay tactic.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Spouse — what's inside */}
      <section className="bg-slate-50 scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What’s inside</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every close, every script, every checklist
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "A 14-page playbook (PDF) with every close on its own page: goal, when to use it, the word-for-word script, why it works, and a checklist.",
                "The owner’s real-objection-versus-delay diagnosis guidance, with the four signals to listen for.",
                "A 7-day practice plan and a one-page quick reference of all ten closes.",
                "The honesty rule: no fake deadlines, no pressure — closes that respect the customer and the spouse.",
                "A PDF that works on any device, written for reading at the desk between customers.",
              ].map((item) => (
                <li
                  key={item}
                  className="product-card flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[0.95rem] leading-relaxed text-slate-700">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            <aside className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Delivered as a PDF
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                One downloadable 14-page PDF with every close on its own page,
                word-for-word scripts, the real-objection-versus-delay
                diagnosis guidance, a 7-day practice plan, and a
                quick-reference one-pager. Download it right after checkout
                and keep it forever.
              </p>
              <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">
                Sold separately at $2.99 — pairs with the Starter Kit to
                sharpen your objection handling.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Spouse — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dealership reps, internet teams & specialists
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            New and veteran dealership sales reps, internet sales teams, and
            product specialists who hear “I need to ask my spouse” and want to
            respond with confidence instead of pressure.
          </p>
        </div>
      </section>

      {/* Spouse — CTA band */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Turn “I need to ask my spouse” into a win
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get The Spouse Objection Playbook — a 14-page PDF with ten
            word-for-word closes you can put to work today. Download it
            instantly after purchase.
          </p>
          <div className="mt-9 flex justify-center">
            <BuyButton
              href={SPOUSE_PAYMENT_LINK}
              label="Get The Spouse Objection Playbook — $2.99"
              ariaLabel="Get The Spouse Objection Playbook — $2.99"
            />
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/thanks?product=spouse"
              className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
            >
              Already purchased? Enter your code to download
            </a>
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Respect the partnership. Uncover the real concern. Keep the deal
            moving.
          </p>
        </div>
      </section>

      {/* Spouse — FAQs */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The Spouse Objection, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Do I need experience to use this?",
                a: "No. Every close has a word-for-word script, a goal, and a checklist. Read the page, say it out loud once, and try it on the next spouse objection.",
              },
              {
                q: "Is this about manipulating the customer?",
                a: "No. Every close in this playbook respects the spouse’s role and the customer’s right to decide. The goal is to find out what’s really holding the deal back and address it honestly.",
              },
              {
                q: "What if the customer still wants to talk to their spouse first?",
                a: "That’s a legitimate outcome. Several of the closes — the Future Pace Close, the Reservation Close, and the Gentle Close — are built for exactly that. The playbook shows you how to make it easy for them to come back.",
              },
              {
                q: "Does it promise a certain number of sales?",
                a: "No. It gives you a practical, respectful response system and the owner’s exact scripts. Results depend on the customer, the inventory, the dealership, and how consistently you practice.",
              },
              {
                q: "Is it a PDF I can use on my phone?",
                a: "Yes. It’s a PDF that works on any device, and it’s written for reading at the desk between customers.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900">{q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * THE "PRAY ABOUT IT" OBJECTION PLAYBOOK — SIXTH PRODUCT ($2.99)
       * ═══════════════════════════════════════════════════════════ */}

      {/* Pray About It — product hero */}
      <section
        id="pray-about-it"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_75%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <img src="/blamo-car.svg" alt="" aria-hidden="true" className="mascot-float pointer-events-none absolute -bottom-3 -left-16 hidden w-56 opacity-[0.12] lg:block" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-28">
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              New · The “Pray About It” Objection Playbook
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Honor their faith—{" "}
              <span className="whitespace-nowrap underline decoration-amber-400 decoration-[6px] underline-offset-8">
                and find out what’s really behind “I need to pray about it.”
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:mx-0">
              Eight word-for-word closes for the faith-based objection, built
              on respect: never challenge a customer’s beliefs, never use faith
              as a sales tool — and never lose the deal to an unanswered
              question.
            </p>
            <div className="mt-9 flex justify-center sm:justify-start">
              <BuyButton
                href={PRAY_ABOUT_IT_PAYMENT_LINK}
                label="Get The “Pray About It” Objection Playbook — $2.99"
                ariaLabel="Get The “Pray About It” Objection Playbook — $2.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 13-page PDF · $2.99 · Same-day use
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/thanks?product=pray-about-it"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Already purchased? Enter your code to download
              </a>
            </p>
          </div>
          <div className="mt-6 pb-6 lg:mt-0">
            <PrayAboutItProductCard />
          </div>
        </div>
      </section>

      {/* Pray About It — what you'll learn */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What you’ll learn</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Respond to the faith-based objection the right way
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Know exactly what to say when the customer asks for time to
              pray — and how to keep the door open with respect.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              "The owner’s eight closes in order — from the Clarifying Close to the Respect Close — each with a word-for-word script.",
              "How to ask “what answer are you hoping to receive?” without sounding pushy — and what to do with the answer.",
              "How to uncover a hidden objection hiding behind a prayer request.",
              "The Follow-Up Close, a respectful way to keep the door open for tomorrow.",
              "The lines you never cross — including the phrases that sound well-intended but come across as manipulative.",
              "How to tell whether “I need to pray about it” is genuine or a polite way of saying there are still unresolved concerns.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pray About It — what's inside */}
      <section className="bg-slate-50 scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What’s inside</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Eight respectful closes, from script to practice
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "A 13-page playbook (PDF) with every close on its own page: goal, when to use it, the word-for-word script, why it works, and a checklist.",
                "The “What to Avoid” section — the three phrases never to say, and why they’re dangerous.",
                "The owner’s guidance on reading the customer: four signals that separate a genuine faith decision from a polite cover.",
                "A 7-day practice plan and a one-page quick reference of all eight closes.",
                "Sincere, neutral scripts you can use even if you don’t share the customer’s faith — the playbook never presumes the customer’s beliefs or yours.",
              ].map((item) => (
                <li
                  key={item}
                  className="product-card flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[0.95rem] leading-relaxed text-slate-700">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            <aside className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Delivered as a PDF
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                One downloadable 13-page PDF with every close on its own page,
                word-for-word scripts, the “What to Avoid” section, a 7-day
                practice plan, and a quick-reference one-pager. Download it
                right after checkout and keep it forever.
              </p>
              <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">
                Sold separately at $2.99 — pairs with the Starter Kit to keep
                the door open without pressure.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Pray About It — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sales reps & internet teams
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Sales reps and internet teams who want to respond to the
            faith-based objection the right way — with the respect it
            deserves — while still serving the customer’s real needs.
          </p>
        </div>
      </section>

      {/* Pray About It — CTA band */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Honor their faith — and the decision
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get The “Pray About It” Objection Playbook — a 13-page PDF with
            eight word-for-word closes you can put to work today. Download it
            instantly after purchase.
          </p>
          <div className="mt-9 flex justify-center">
            <BuyButton
              href={PRAY_ABOUT_IT_PAYMENT_LINK}
              label="Get The “Pray About It” Objection Playbook — $2.99"
              ariaLabel="Get The “Pray About It” Objection Playbook — $2.99"
            />
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/thanks?product=pray-about-it"
              className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
            >
              Already purchased? Enter your code to download
            </a>
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Honor the belief. Never weaponize it. Keep the door open.
          </p>
        </div>
      </section>

      {/* Pray About It — FAQs */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The Pray About It objection, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Is this about talking customers out of praying?",
                a: "No. The playbook assumes the customer may genuinely pray about the decision. The closes are about making sure they have everything they need — information, answers, peace of mind — before they leave.",
              },
              {
                q: "Are any of these closes manipulative toward someone’s faith?",
                a: "No — and the “What to Avoid” section is explicit about it. The playbook’s rule: honor the belief, never weaponize it. The scripts never suggest God is telling anyone to buy.",
              },
              {
                q: "I’m not religious myself. Can I still use these?",
                a: "Yes. You don’t need to share the customer’s faith to respect it. The scripts are sincere and neutral — they never presume the customer’s beliefs or yours.",
              },
              {
                q: "What if the customer says no and leaves?",
                a: "The Follow-Up Close and the Decision Close are built for that. You’ll know exactly what to say tomorrow, and the customer will remember that you treated them with respect.",
              },
              {
                q: "Does it promise a certain number of sales?",
                a: "No. It provides a respectful response system and the owner’s exact scripts. Results depend on the customer, the inventory, the dealership, and how genuinely you deliver the words.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900">{q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
       * THE "I WANT MORE FOR MY TRADE-IN" PLAYBOOK — SEVENTH PRODUCT ($2.99)
       * ═══════════════════════════════════════════════════════════ */}

      {/* Trade-In — product hero */}
      <section
        id="trade-in"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_25%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <img src="/blamo-car.svg" alt="" aria-hidden="true" className="mascot-float pointer-events-none absolute -bottom-3 -left-16 hidden w-56 opacity-[0.12] lg:block" />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-20 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-28">
          <div className="text-center sm:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              New · The “I Want More for My Trade-In” Playbook
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              Stop arguing over one number.{" "}
              <span className="whitespace-nowrap underline decoration-amber-400 decoration-[6px] underline-offset-8">
                Win the whole deal.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:mx-0">
              Ten word-for-word closes for the trade-in standoff — plus the
              owner’s personal favorite trade close, the one he reaches for
              when the numbers get sticky.
            </p>
            <div className="mt-9 flex justify-center sm:justify-start">
              <BuyButton
                href={TRADE_IN_PAYMENT_LINK}
                label="Get The “I Want More for My Trade-In” Playbook — $2.99"
                ariaLabel="Get The “I Want More for My Trade-In” Playbook — $2.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 15-page PDF · $2.99 · Same-day use
            </p>
            <p className="mt-3 text-sm">
              <a
                href="/thanks?product=trade-in"
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Already purchased? Enter your code to download
              </a>
            </p>
          </div>
          <div className="mt-6 pb-6 lg:mt-0">
            <TradeInProductCard />
          </div>
        </div>
      </section>

      {/* Trade-In — what you'll learn */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What you’ll learn</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ten closes — plus the owner’s favorite
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Turn the trade-in standoff into a conversation about the whole
              deal — honestly and without friction.
            </p>
          </div>
          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {[
              "The owner’s ten closes in order — from the Isolation Close to the Commitment Close — each with a word-for-word script.",
              "The owner’s favorite trade close, front and center: how to validate, set realistic expectations, and get a commitment before you go back to the manager.",
              "How to shift the conversation from trade value to the cost of the overall deal.",
              "The Difference Close, which turns “I want more” into a number you can work with.",
              "How to find out whether you’re competing with a real offer or an expectation — the Comparison Close.",
              "When waiting for more costs more than it saves — the Cost of Waiting Close.",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <CheckIcon className="h-4 w-4" />
                </span>
                <p className="text-[1.05rem] leading-relaxed text-slate-700">
                  {benefit}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trade-In — what's inside */}
      <section className="bg-slate-50 scroll-reveal">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What’s inside</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Every close, every script, every checklist
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                "A 15-page playbook (PDF) with every close on its own page: goal, when to use it, the word-for-word script, why it works, and a checklist.",
                "The Favorite Trade Close featured on its own page, with the four reasons it works and how to deliver it.",
                "The owner’s guidance on real offers versus expectations, with the ground rules for keeping negotiations honest.",
                "A 7-day practice plan and a one-page quick reference of all ten closes.",
                "Scripts that translate directly to calls, texts, and walk-in appointments — trade-in tension happens on the phone and in the showroom.",
              ].map((item) => (
                <li
                  key={item}
                  className="product-card flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-amber-400">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[0.95rem] leading-relaxed text-slate-700">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
            <aside className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-bold tracking-tight text-slate-900">
                Delivered as a PDF
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                One downloadable 15-page PDF with every close on its own page,
                word-for-word scripts, the owner’s favorite trade close, real
                offers versus expectations guidance, a 7-day practice plan,
                and a quick-reference one-pager. Download it right after
                checkout and keep it forever.
              </p>
              <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-relaxed text-slate-500">
                Sold separately at $2.99 — pairs with The 10 Steps of the Sale
                to keep negotiations honest inside the full process.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Trade-In — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Floor reps, internet teams & desk managers
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Floor sales reps, internet sales teams, and desk managers who want
            to keep trade-in negotiations honest, calm, and focused on the
            whole deal instead of a single number.
          </p>
        </div>
      </section>

      {/* Trade-In — CTA band */}
      <section className="bg-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Win the whole deal, not one number
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get The “I Want More for My Trade-In” Playbook — a 15-page PDF
            with ten word-for-word closes plus the owner’s favorite trade
            close. Download it instantly after purchase.
          </p>
          <div className="mt-9 flex justify-center">
            <BuyButton
              href={TRADE_IN_PAYMENT_LINK}
              label="Get The “I Want More for My Trade-In” Playbook — $2.99"
              ariaLabel="Get The “I Want More for My Trade-In” Playbook — $2.99"
            />
          </div>
          <p className="mt-5 text-sm">
            <a
              href="/thanks?product=trade-in"
              className="font-medium text-slate-300 underline underline-offset-2 hover:text-white"
            >
              Already purchased? Enter your code to download
            </a>
          </p>
          <p className="mt-6 text-sm text-slate-400">
            Fair market value. Realistic expectations. Honest negotiations.
          </p>
        </div>
      </section>

      {/* Trade-In — FAQs */}
      <section className="border-t border-slate-100 bg-white scroll-reveal">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              The Trade-In objection, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "Will this help me pay customers more for their trades?",
                a: "No — and no playbook honestly can. What it does is give you a respectful way to explain how trade values are determined and keep the focus on the overall deal.",
              },
              {
                q: "The customer wants a specific number. Now what?",
                a: "That’s exactly what the Difference Close and the Commitment Close are for. You’ll get the number, set expectations honestly, and find out what “yes” looks like before you involve the manager.",
              },
              {
                q: "Is this about lowballing customers?",
                a: "No. The playbook’s approach is honesty: fair market value, realistic expectations, and a deal that makes sense overall. The closes work without a single misleading promise.",
              },
              {
                q: "I work the internet desk. Does this apply?",
                a: "Yes. Trade-in tension happens on the phone and in the showroom. The scripts translate directly to calls, texts, and walk-in appointments.",
              },
              {
                q: "Does it promise more gross or more sales?",
                a: "No. It gives you a proven response system and the owner’s favorite close. Results depend on inventory, market conditions, and how consistently you practice and deliver.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="font-semibold text-slate-900">{q}</span>
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-slate-500">
            <a href="#inside" className="hover:text-slate-900">
              What’s inside
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQs
            </a>
            <a href="/thanks" className="hover:text-slate-900">
              Download your PDF
            </a>
            <a href="#ten-steps" className="hover:text-slate-900">
              The 10 Steps
            </a>
            <a href="/thanks?product=ten-steps" className="hover:text-slate-900">
              Download the 10 Steps PDF
            </a>
            <a href="#five-closes" className="hover:text-slate-900">
              The Five Closes
            </a>
            <a href="/thanks?product=five-closes" className="hover:text-slate-900">
              Download your video
            </a>
            <a href="#internet-sales" className="hover:text-slate-900">
              The Internet Sale
            </a>
            <a href="/thanks?product=internet-sales" className="hover:text-slate-900">
              Download the Internet Sale PDF
            </a>
            <a href="#spouse" className="hover:text-slate-900">
              The Spouse Objection
            </a>
            <a href="/thanks?product=spouse" className="hover:text-slate-900">
              Download the Spouse Playbook PDF
            </a>
            <a href="#pray-about-it" className="hover:text-slate-900">
              The Pray About It Playbook
            </a>
            <a href="/thanks?product=pray-about-it" className="hover:text-slate-900">
              Download the Pray About It PDF
            </a>
            <a href="#trade-in" className="hover:text-slate-900">
              The Trade-In Playbook
            </a>
            <a href="/thanks?product=trade-in" className="hover:text-slate-900">
              Download the Trade-In Playbook PDF
            </a>
            <a href="#buy" className="font-medium text-slate-900">
              Get the Starter Kit
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

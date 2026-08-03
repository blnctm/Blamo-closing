import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { startCheckout } from "~/lib/client-api";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Preview: The Sales Rep Starter Kit — Blamo Closing" },
      {
        name: "description",
        content:
          "See three watermarked sample pages from The Sales Rep Starter Kit — real dealership training you can read on any device. Every guide follows this format.",
      },
    ],
  }),
  component: Preview,
});

/* Three real pages from private/sales-rep-starter-kit-10-steps.pdf (the 27-page
   flagship), rendered at ~935px wide and heavily watermarked so the format is
   visible but the content isn't usable. */
const SAMPLES = [
  {
    src: "/preview/preview-1.png",
    caption: "Why the 10 Steps Work — the introduction that explains the system",
  },
  {
    src: "/preview/preview-2.png",
    caption: "The 10 Steps overview — the whole process laid out at a glance",
  },
  {
    src: "/preview/preview-3.png",
    caption: "Step 1 field deep-dive — Meet & Greet scripts and practice drills",
  },
];

function BuyButton({
  slug,
  label,
  ariaLabel,
  variant = "primary",
}: {
  slug: string;
  label: string;
  ariaLabel: string;
  variant?: "primary" | "secondary";
}) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleCheckout() {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const url = await startCheckout(
        slug,
        localStorage.getItem("blamo-promo") || undefined,
      );
      window.location.href = url;
    } catch (error) {
      if (error instanceof Error && error.message === "login_required") {
        window.location.href = `/login?next=${encodeURIComponent("/preview")}`;
        return;
      }
      setErrorMsg(
        "Checkout is temporarily unavailable — please try again in a moment.",
      );
      setBusy(false);
    }
  }

  const base =
    "inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";
  const cls =
    variant === "primary"
      ? `${base} bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-400 focus-visible:outline-amber-500`
      : `${base} border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-500 hover:text-slate-950 focus-visible:outline-slate-500`;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={busy}
        aria-label={ariaLabel}
        className={cls}
      >
        {busy ? "Starting checkout…" : label}
      </button>
      {errorMsg && (
        <p
          role="status"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}

function Preview() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/" className="text-lg font-extrabold tracking-tight">
            Blamo<span className="text-slate-400"> Closing</span>
          </a>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <a href="/" className="text-slate-500 hover:text-slate-900">
              Home
            </a>
            <a href="/refunds" className="text-slate-500 hover:text-slate-900">
              Refunds
            </a>
            <a href="/contact" className="text-slate-500 hover:text-slate-900">
              Contact
            </a>
          </nav>
        </div>
      </header>
      <main className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(251,191,36,0.22),transparent)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
              Blamo Closing · Sample pages
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Preview: The Sales Rep Starter Kit
            </h1>
            <p className="mt-4 text-lg font-semibold text-slate-800">
              Every guide follows this format.
            </p>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">
              These are three real pages from the 27-page Sales Rep Starter Kit —
              the flagship guide to the 10 Steps of the Sale. They&rsquo;re shown
              with a heavy watermark so you can judge the quality and structure
              before you buy. The full guide — every script, checklist, and
              practice drill — unlocks in your account the moment payment goes
              through.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {SAMPLES.map((sample) => (
              <figure
                key={sample.src}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
              >
                <img
                  src={sample.src}
                  alt={sample.caption}
                  width={935}
                  height={1210}
                  loading="lazy"
                  className="w-full"
                />
                <figcaption className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-600">
                  {sample.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-slate-500">
            Sample pages are watermarked and shown to demonstrate format and
            structure. Every guide in the library follows the same format — a
            professionally designed PDF you read on any device.
          </p>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-900/5 sm:p-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Get the full 27-page Starter Kit
            </h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-600">
              Word-for-word scripts, mistakes-to-avoid checklists, role-play
              drills, and a 7-day practice plan — $24.99, yours to keep forever.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <BuyButton
                slug="starter-kit"
                label="Get the Starter Kit — $24.99"
                ariaLabel="Get the Sales Rep Starter Kit — $24.99"
                variant="primary"
              />
              <BuyButton
                slug="complete-package"
                label="Get the Complete Package — $79.99"
                ariaLabel="Get the Complete Package — $79.99"
                variant="secondary"
              />
            </div>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-slate-500">
              Prefer the whole library? The Complete Package unlocks every
              current and future title — English and Español — with a single
              purchase.
            </p>
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <span className="font-semibold text-slate-700">Blamo Closing</span>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <a href="/" className="hover:text-slate-900">
              Home
            </a>
            <a href="/preview" className="hover:text-slate-900">
              Preview
            </a>
            <a href="/refunds" className="hover:text-slate-900">
              Refunds
            </a>
            <a href="/contact" className="hover:text-slate-900">
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

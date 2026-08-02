import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";

export const Route = createFileRoute("/thanks")({
  validateSearch: (search: Record<string, unknown>) => ({
    product: typeof search.product === "string" ? search.product : undefined,
  }),
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: Thanks,
});

// Display-only metadata for the /thanks download pages.
// KEEP IN SYNC with src/lib/product-downloads.ts (the SERVER-ONLY config that
// holds the confirmation codes and file paths — never import that file into a
// route, or the codes would ship in the public JavaScript).
// To add a product: add one entry here AND one entry in product-downloads.ts.
const PRODUCT_META: Record<
  string,
  { name: string; fileName: string; label: string }
> = {
  "starter-kit": {
    name: "The Sales Rep Starter Kit",
    fileName: "close-academy-starter-kit.pdf",
    label: "Download your PDF",
  },
  "ten-steps": {
    name: "The 10 Steps of the Sale",
    fileName: "the-10-steps-of-the-sale.pdf",
    label: "Download your PDF",
  },
  "five-closes": {
    name: "The Five Closes in Action",
    fileName: "the-five-closes-in-action.mp4",
    label: "Download your video",
  },
  "internet-sales": {
    name: "The 10 Steps to the Internet Sale",
    fileName: "the-10-steps-to-the-internet-sale.pdf",
    label: "Download your PDF",
  },
};

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

type Status = "idle" | "checking" | "ready" | "error";

function Thanks() {
  const { product } = useSearch({ from: "/thanks" });
  // No param (or an unknown one) → Starter Kit, exactly as before.
  const meta = PRODUCT_META[product ?? "starter-kit"] ?? PRODUCT_META["starter-kit"];
  const effectiveSlug = PRODUCT_META[product ?? ""] ? product! : "starter-kit";

  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) {
      setStatus("error");
      setErrorMsg("Please enter the confirmation code you received.");
      return;
    }
    setStatus("checking");
    setErrorMsg(null);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: effectiveSlug, code }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setStatus("error");
        setErrorMsg(
          data?.error ??
            "Something went wrong. Please try again in a moment.",
        );
        return;
      }
      const blob = await response.blob();
      // Keep the code out of URLs: the file is held as an in-memory blob and
      // the button below downloads from it (no ?code= in any link or history).
      setDownloadUrl(URL.createObjectURL(blob));
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again in a moment.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Blamo<span className="text-slate-400"> Closing</span>
            </span>
          </a>
          <a
            href="/"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to home
          </a>
        </div>
      </header>

      {/* Confirmation / code unlock */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-8 w-8 text-emerald-600"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.7 12.585l6.59-6.59a1 1 0 0 1 1.415-.006Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900">
          Thank you for your purchase!
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Your copy of <strong>{meta.name}</strong> is ready. Enter your
          confirmation code below to unlock your download.
        </p>

        {status === "ready" && downloadUrl ? (
          <div className="mt-9 w-full">
            <a
              href={downloadUrl}
              download={meta.fileName}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              {meta.label}
            </a>
            <p className="mt-6 text-sm text-slate-500">
              It’s yours to keep. This page will keep the download available
              while it’s open — if you close it, just come back and enter your
              code again.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-9 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left"
          >
            <label
              htmlFor="confirmation-code"
              className="block text-sm font-semibold text-slate-800"
            >
              Your confirmation code
            </label>
            <input
              id="confirmation-code"
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="BLAMO-00-0000"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={status === "checking"}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-mono text-lg tracking-widest text-slate-900 placeholder-slate-300 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 disabled:opacity-60"
            />
            {status === "error" && errorMsg && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "checking"}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {status === "checking" ? "Checking…" : "Unlock my download"}
            </button>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Your confirmation code was sent to you by email right after you
              bought {meta.name} — the seller sends it by hand, so it can take a
              few minutes to arrive. Check your inbox (and spam folder) for the
              email from your purchase.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Didn’t receive a code? Just reply to your PayPal receipt — the
              seller responds directly.
            </p>
          </form>
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

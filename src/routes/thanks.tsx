import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/thanks")({
  validateSearch: (search: Record<string, unknown>) => ({
    product: typeof search.product === "string" ? search.product : undefined,
  }),
  component: Thanks,
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

function Thanks() {
  const { product } = useSearch({ from: "/thanks" });
  // No param (or product=starter-kit) → Starter Kit, exactly as before.
  // product=ten-steps → The 10 Steps of the Sale.
  // product=five-closes → The Five Closes in Action (video).
  const isTenSteps = product === "ten-steps";
  const isFiveCloses = product === "five-closes";

  const fileUrl = isFiveCloses
    ? "/the-five-closes-in-action.mp4"
    : isTenSteps
      ? "/the-10-steps-of-the-sale.pdf"
      : "/close-academy-starter-kit.pdf";
  const fileName = isFiveCloses
    ? "the-five-closes-in-action.mp4"
    : isTenSteps
      ? "the-10-steps-of-the-sale.pdf"
      : "close-academy-starter-kit.pdf";
  const productName = isFiveCloses
    ? "The Five Closes in Action"
    : isTenSteps
      ? "The 10 Steps of the Sale"
      : "The Sales Rep Starter Kit";
  const downloadLabel = isFiveCloses
    ? "Download your video"
    : "Download your PDF";

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

      {/* Confirmation */}
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
          Your copy of <strong>{productName}</strong> is ready. Download it
          below — it’s yours to keep.
        </p>

        <a
          href={fileUrl}
          download={fileName}
          className="mt-9 inline-flex items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400"
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
          {downloadLabel}
        </a>

        <p className="mt-6 text-sm text-slate-500">
          If the download doesn’t start, use this direct link:{" "}
          <a
            href={fileUrl}
            className="font-medium text-amber-700 underline underline-offset-2"
          >
            {fileName}
          </a>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Questions? Just reply to your PayPal receipt — the seller responds
          directly.
        </p>
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

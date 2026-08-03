import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";

import { loginAccount } from "~/lib/client-api";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: Login,
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

/** Only allow same-site relative paths — never an open redirect. */
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/account";
}

function Login() {
  const { next } = useSearch({ from: "/login" });
  const destination = safeNext(next);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg(null);
    try {
      await loginAccount({ email, password });
      window.location.href = destination;
    } catch (error) {
      const message =
        error instanceof Error && error.message === "invalid_credentials"
          ? "That email and password combination didn’t match. Double-check and try again."
          : "Something went wrong. Please try again in a moment.";
      setErrorMsg(message);
      setStatus("idle");
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
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to home
          </a>
        </div>
      </header>

      {/* Login card */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_30rem_at_50%_-20%,rgba(251,191,36,0.14),transparent)]" />
        <img src="/blamo-mascot.svg" alt="" aria-hidden="true" className="mascot-float pointer-events-none absolute -left-10 bottom-0 hidden w-44 opacity-[0.12] lg:block" />

        <div className="relative w-full max-w-md">
          <div className="text-center">
            <LogoMark className="mx-auto h-12 w-12" />
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-slate-600">
              Log in to buy training and see your downloads.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <label
              htmlFor="login-email"
              className="block text-sm font-semibold text-slate-800"
            >
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-300 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />

            <label
              htmlFor="login-password"
              className="mt-5 block text-sm font-semibold text-slate-800"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-300 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
            />

            {errorMsg && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 disabled:opacity-60"
            >
              {status === "submitting" ? "Logging in…" : "Log in"}
            </button>

            <p className="mt-5 text-center text-sm text-slate-600">
              New here?{" "}
              <a
                href={`/register?next=${encodeURIComponent(destination)}`}
                className="inline-block rounded-lg py-2.5 font-semibold text-slate-900 underline underline-offset-2 hover:text-amber-700"
              >
                Create a free account
              </a>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Your account keeps your purchased guides and unlock codes in one
            place.
          </p>
        </div>
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

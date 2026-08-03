import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refunds & Delivery — Blamo Closing" },
      {
        name: "description",
        content:
          "How Blamo Closing delivery works — your guide unlocks in your account after payment — and the 30-day refund policy if you haven't downloaded it.",
      },
    ],
  }),
  component: Refunds,
});

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 text-2xl font-bold tracking-tight text-slate-900">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-relaxed text-slate-600">{children}</p>;
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="mt-4 rounded-xl border border-slate-200 bg-white transition hover:border-slate-300">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold text-slate-900">{q}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          +
        </span>
      </summary>
      <p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p>
    </details>
  );
}

// Copy: /home/team/shared/refund-policy/refund-policy.md (verbatim except the
// "See the format before you buy" section — it links the live watermarked
// Starter Kit preview at /preview instead of the old "coming soon" line).
// Delivery FAQ Q&As appended verbatim from delivery-faq.md per the wiring notes.
function Refunds() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="rounded-lg py-2 text-lg font-extrabold tracking-tight">
            Blamo<span className="text-slate-400"> Closing</span>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-5 text-sm font-medium sm:flex">
            <a href="/" className="rounded-lg py-2.5 text-slate-500 hover:text-slate-900">
              Home
            </a>
            <a href="/testimonials" className="rounded-lg py-2.5 font-semibold text-amber-700">Reviews</a><a href="/contact" className="rounded-lg py-2.5 text-slate-500 hover:text-slate-900">
              Contact
            </a>
            <a href="/refunds" className="rounded-lg py-2.5 text-slate-900">
              Refunds
            </a>
          </nav>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="refunds-mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 sm:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div id="refunds-mobile-menu" className="border-t border-slate-200 bg-white shadow-xl sm:hidden">
            <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
              <div className="grid gap-1">
                {[["Home", "/"], ["Reviews", "/testimonials"], ["Contact", "/contact"], ["Refunds", "/refunds"]].map(([label, href]) => (
                  <a key={label} href={href} onClick={() => setMenuOpen(false)} className="flex items-center rounded-lg px-4 py-3.5 text-base font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900">
                    {label}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(251,191,36,0.22),transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
              Blamo Closing
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Refunds &amp; Delivery
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
              Straight answers about what you get when you buy from Blamo
              Closing — and what happens if it&rsquo;s not for you.
            </p>
          </div>

          <H2>What you get when you buy</H2>
          <P>
            Every guide is a PDF. When you pay, it unlocks in your account
            instantly. Here&rsquo;s the exact flow:
          </P>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-slate-600">
            <li>
              You check out through Stripe. Stripe emails you the receipt.
            </li>
            <li>
              The moment payment goes through, the guide unlocks in your
              account — no waiting, no code sent by email.
            </li>
            <li>
              Your download shows up on the thank-you page right after you pay,
              and it stays in your account under{" "}
              <span className="font-semibold text-slate-800">
                Your purchases
              </span>{" "}
              forever. Log in anytime to download it again.
            </li>
          </ul>
          <P>
            There is no code email.{" "}
            <span className="font-semibold text-slate-800">
              Delivery is the account unlock
            </span>{" "}
            — if the guide shows up under Your purchases, you have it. If you
            can&rsquo;t find it, log in and check Your purchases before
            anything else.
          </P>

          <H2>The refund policy</H2>
          <P>
            You have{" "}
            <span className="font-semibold text-slate-800">
              30 days from the date of purchase
            </span>{" "}
            to request a full refund — if you haven&rsquo;t downloaded the
            guide.
          </P>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-slate-600">
            <li>
              <span className="font-semibold text-slate-800">
                Single guide:
              </span>{" "}
              if you haven&rsquo;t downloaded it, you get a full refund.
            </li>
            <li>
              <span className="font-semibold text-slate-800">
                Complete Package or Team License:
              </span>{" "}
              if you haven&rsquo;t downloaded any of the unlocked titles, you
              get a full refund.
            </li>
            <li>
              <span className="font-semibold text-slate-800">
                If you&rsquo;ve downloaded the guide
              </span>{" "}
              (or any title, for a bundle or license), the refund is declined.
            </li>
          </ul>
          <P>
            Why the line at the download? Because the product is fully
            delivered the moment it downloads. A digital file can&rsquo;t be
            handed back, so the policy draws the line where it&rsquo;s fair to
            both sides: before you take the product, the money is yours again;
            after you take it, the sale is complete. That&rsquo;s the whole
            policy — no fine print beyond it.
          </P>

          <H2>See the format before you buy</H2>
          <P>
            Every guide follows the same format — a professionally designed PDF
            you can read on any device.{" "}
            <a
              href="/preview"
              className="font-semibold text-amber-700 underline-offset-2 transition hover:text-amber-800 hover:underline"
            >
              See a watermarked preview of the Sales Rep Starter Kit
            </a>{" "}
            — three real pages, so you can see exactly what you&rsquo;re buying
            before you spend anything. You should know what you&rsquo;re
            getting.
          </P>

          <H2>How to request a refund</H2>
          <P>Two ways:</P>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-slate-600">
            <li>From your account page.</li>
            <li>
              Email us from the Contact page (blnctm@gmail.com) — include the
              email address you used to buy.
            </li>
          </ul>
          <P>
            We review each request. If you haven&rsquo;t downloaded the guide,
            we issue the refund to your original payment method (Stripe handles
            the return) and revoke the unlock in your account.
          </P>

          <H2>Why this policy</H2>
          <P>
            We&rsquo;d rather you not buy than buy something you didn&rsquo;t
            want. Digital products can&rsquo;t be un-delivered — once a PDF is
            downloaded, it&rsquo;s yours and we can&rsquo;t take it back. This
            policy protects both sides: it gives you a full 30 days to decide,
            and it keeps the store honest so paid-for training stays paid-for.
            Nobody should feel stuck with something they didn&rsquo;t want, and
            nobody should expect a free library after taking the product.
            If you&rsquo;re on the fence, read the guide and decide with
            confidence.
          </P>

          <H2>Delivery FAQ</H2>
          <div className="mt-4">
            <FAQ
              q="How do I get my guide after paying?"
              a="Your guide unlocks in your account the moment payment goes through. The download button appears on the thank-you page right after checkout, and it's always waiting under Your purchases whenever you log back in. There's no code email — delivery is the account unlock. Stripe emails you the receipt, but the guide itself lives in your account."
            />
            <FAQ
              q="I didn't get a receipt — what now?"
              a="Receipts come from Stripe, and they usually arrive within a minute or two. Check your spam or promotions folder first. If it's still not there, email us from the Contact page and we'll sort it out. Either way, your guide is in your account under Your purchases — a missing receipt doesn't affect your download."
            />
            <FAQ
              q="Can I get a refund if I've downloaded the guide?"
              a="No — once the guide is downloaded, it's fully delivered and can't be taken back, so the refund is declined. If you haven't downloaded it, you have 30 days from purchase to request a full refund. See the full policy on the Refunds page."
            />
            <FAQ
              q="How does the Complete Package or Team License delivery work?"
              a="The Complete Package is one purchase that unlocks the entire library — every current title, English and Español, plus every future title, all in your account after a single checkout. The Team License gives a manager the whole library too, plus a team code that up to 10 reps can redeem when they register (or from their account page). Each rep who redeems gets the full library unlocked in their own account."
            />
            <FAQ
              q="Do you sell videos?"
              a="No — everything on the site is reading material: PDF guides, playbooks, and manuals you read on any device. No video, no audio courses."
            />
            <FAQ
              q="Is my payment secure?"
              a="Yes. All payments go through Stripe Checkout, the same payment processor used by millions of businesses. We never see or store your card details."
            />
            <FAQ
              q="Can I share a guide with my team?"
              a="Individual guides are for the buyer — that's what keeps the training affordable. If you want to train a whole team, the Team License covers up to 10 reps for a single price, and each rep gets their own account and downloads."
            />
          </div>

          <p className="mt-14 text-center text-sm text-slate-500">
            Questions?{" "}
            <a
              href="/contact"
              className="inline-block rounded-lg py-2.5 font-semibold text-amber-700 hover:text-amber-800"
            >
              Contact us
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

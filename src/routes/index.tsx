import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { logoutAccount, me, startCheckout } from "~/lib/client-api";
import { STORE_PRODUCTS } from "~/lib/store-products";

/* Product counts derive from the catalog itself (single source of truth), so
   the hero and catalog copy stay correct automatically as products are added. */
const SIX_NINETY_NINE_COUNT = STORE_PRODUCTS.filter(
  (p) => p.priceCents === 699
).length;
/* The Complete Package bundle is not an individual training product — count
   copy ("N standalone training products") must exclude it. */
const INDIVIDUAL_PRODUCT_COUNT = STORE_PRODUCTS.filter(
  (p) => !p.isBundle
).length;

export const Route = createFileRoute("/")({
  component: Home,
});

/* ---------- Hero copy (easy to swap when messaging evolves) ---------- */
const HERO_COPY = {
  tagline: "Real dealership training. Clearer closes.",
  credibility:
    "Over 20 years of hands-on dealership experience — a proven process that works.",
  headline: "Close More Clearly, Starting Today",
  opener:
    "Tired of being thrown to the wolves? No real on-the-job training? Let us help.",
  subheadline:
    "Blamo Closing gives dealership salespeople practical training they can use on the floor today: word-for-word closing scripts, objection playbooks, and PDF guides built around real sales conversations.",
  highlights: [
    "Word-for-word closing scripts",
    "Objection playbooks for tough stalls",
    `${SIX_NINETY_NINE_COUNT} training products for only $6.99`,
  ],
  primaryCta: "Browse the training",
  secondaryCta: "See how it works",
};

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

/* ---------- Decorative background mascot art ---------- */

/**
 * Decorative background art (salesman mascot or cartoon car) placed at the
 * bottom corner of a section. Visible on every viewport size (smaller +
 * edge-anchored on mobile/tablet, larger on desktop), always pointer-events-none
 * and aria-hidden so it never interferes with reading or clicking.
 * The `.mascot-float` class adds the gentle bob animation; `prefers-reduced-motion`
 * disables the animation while keeping the art visible.
 */
function BgArt({
  kind = "car",
  side = "left",
  dark = false,
  className = "",
}: {
  kind?: "mascot" | "car" | "handshake" | "driving" | "keys" | "happy-client" | "happy-rep" | "mascot-keys";
  side?: "left" | "right";
  /** Renders slightly more opaque so it reads on dark (slate-900) sections. */
  dark?: boolean;
  className?: string;
}) {
  const src = kind === "mascot" ? "/blamo-mascot.svg" : kind === "car" ? "/blamo-car.svg" : `/bg-${kind}.svg`;
  const size = kind === "mascot"
    ? "w-24 sm:w-32 lg:w-44"
    : kind === "car" || kind === "handshake" || kind === "driving" || kind === "happy-rep"
      ? (kind === "happy-rep" ? "w-24 sm:w-32 lg:w-44" : "w-24 sm:w-36 lg:w-52")
      : kind === "keys"
        ? "w-20 sm:w-28 lg:w-36"
        : "w-28 sm:w-40 lg:w-56";
  const horiz =
    side === "left"
      ? "-left-4 sm:-left-8 lg:-left-12"
      : "-right-4 sm:-right-8 lg:-right-12";
  const vert = kind === "mascot" ? "bottom-2" : "bottom-0";
  const opacity = dark
    ? "opacity-[0.26]"
    : kind === "mascot"
      ? "opacity-[0.22]"
      : "opacity-[0.2]";
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`mascot-float pointer-events-none absolute select-none ${size} ${horiz} ${vert} ${opacity} ${className}`}
    />
  );
}

/* ---------- Buy button ---------- */

function BuyButton({
  size = "lg",
  slug = "starter-kit",
  label = "Get the Starter Kit — $24.99",
  ariaLabel = "Get the Starter Kit — $24.99",
  promoCode,
}: {
  size?: "lg" | "sm";
  /** Product slug for the Stripe checkout (POST /api/checkout). */
  slug?: string;
  label?: string;
  ariaLabel?: string;
  promoCode?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleCheckout() {
    if (busy) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const url = await startCheckout(slug, promoCode || localStorage.getItem("blamo-promo") || undefined);
      window.location.href = url;
    } catch (error) {
      if (error instanceof Error && error.message === "login_required") {
        // Logged out → log in first, then come back to this product section.
        const anchor = slug === "starter-kit" ? "buy" : slug;
        window.location.href = `/login?next=${encodeURIComponent(`/#${anchor}`)}`;
        return;
      }
      setErrorMsg(
        "Checkout is temporarily unavailable — please try again in a moment.",
      );
      setBusy(false);
    }
  }

  const primaryClass =
    size === "lg"
      ? "group inline-flex items-center justify-center gap-2.5 rounded-xl bg-amber-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60"
      : "group inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:opacity-60";

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={busy}
          aria-label={ariaLabel}
          className={primaryClass}
        >
          {busy ? "Starting checkout…" : label}
          <ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
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

/* ---------- Header auth (Login/Register vs Account/Logout) ---------- */

function AuthNav() {
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    me()
      .then((data) => {
        if (cancelled || !data) return;
        setUser(data.user);
      })
      .catch(() => {
        // Network hiccup — leave the nav logged-out.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await logoutAccount();
    } catch {
      // Even if the request fails, reload; the cookie expires on its own.
    }
    window.location.reload();
  }

  if (!ready) {
    // Reserve space so the header doesn't jump when auth loads.
    return <span className="h-9 w-20" aria-hidden="true" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/account"
          className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
        >
          My account
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <a
        href="/login"
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        Log in
      </a>
      <a
        href="/register"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        Sign up
      </a>
    </div>
  );
}


/* ---------- Product cover cards (branded 600x800 thumbnails) ---------- */

/**
 * Shared product card: branded 3:4 cover thumbnail on top, then the product
 * title, price, and a Buy button below — all inside one rounded, shadowed,
 * hover-lifting card. Each card keeps its own peeking badge and tagline chip
 * (existing design language). The $6.99 playbooks remain standalone products:
 * every card carries its own price and its own Buy button.
 */
function ProductCoverCard({
  img,
  alt,
  badge,
  title,
  price,
  slug,
  ctaLabel,
  ctaAriaLabel,
  chipTitle,
  chipSub,
  desc,
}: {
  img: string;
  alt: string;
  badge: React.ReactNode;
  title: string;
  price: string;
  slug: string;
  ctaLabel: string;
  ctaAriaLabel: string;
  chipTitle: string;
  chipSub: string;
  desc?: string;
}) {
  return (
    <div className="product-card relative mx-auto w-full max-w-xs lg:max-w-sm">
      {/* Peeking badge from behind */}
      <div className="absolute -top-4 -right-3 z-20 w-28 rotate-6 rounded-xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/10">
        {badge}
      </div>

      {/* The card: cover on top, title/price/buy below */}
      <div className="relative -rotate-1 overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10">
        <img
          src={img}
          alt={alt}
          width={600}
          height={800}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover"
        />
        <div className="px-5 pb-5 pt-4">
          <h3 className="whitespace-normal text-base font-bold leading-snug tracking-tight text-slate-900">
            {title}
          </h3>
          {desc && (
            <p className="mt-2 text-sm leading-snug text-slate-600">{desc}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              {price}
            </span>
            <BuyButton
              size="sm"
              slug={slug}
              label={ctaLabel}
              ariaLabel={ctaAriaLabel}
            />
          </div>
        </div>
      </div>

      {/* Tagline chip */}
      <div className="absolute -bottom-6 -left-4 z-20 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-900/10">
        <p className="text-xs font-semibold text-slate-900">{chipTitle}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{chipSub}</p>
      </div>
    </div>
  );
}

function QuickCardBadge() {
  return (
    <>
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
        Quick card
      </p>
      <div className="mt-2 space-y-1.5">
        <div className="h-1.5 rounded-full bg-slate-200" />
        <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
        <div className="h-1.5 w-3/5 rounded-full bg-amber-300/80" />
      </div>
    </>
  );
}

/* ---------- Starter Kit cover card ---------- */

function ProductCard() {
  return (
    <ProductCoverCard
      img="/cover-thumbs/starter-kit.png"
      alt="The Sales Rep Starter Kit cover"
      badge={<QuickCardBadge />}
      title="The Sales Rep Starter Kit"
      desc="The complete 10 Steps of the Sale — 27 pages of word-for-word scripts, checklists, and a 7-day practice plan."
      price="$24.99"
      slug="starter-kit"
      ctaLabel="Buy now — $24.99"
      ctaAriaLabel="Get the Starter Kit — $24.99"
      chipTitle="The complete 10-step process"
      chipSub="27-page packet · Meet & Greet → Follow-up"
    />
  );
}

/* ---------- 10 Steps to the Internet Sale cover card ---------- */

function InternetSalesProductCard() {
  return (
    <ProductCoverCard
      img="/cover-thumbs/internet-sale.png"
      alt="The 10 Steps to the Internet Sale cover"
      badge={<QuickCardBadge />}
      title="The 10 Steps to the Internet Sale"
      desc="Win internet leads before they walk in: the 10-step online process, the BLAMO Video Formula, and 7-day follow-up."
      price="$6.99"
      slug="internet-sales"
      ctaLabel="Buy now — $6.99"
      ctaAriaLabel="Get The 10 Steps to the Internet Sale — $6.99"
      chipTitle="Win the lead before they walk in."
      chipSub="Built for internet sales & BDC"
    />
  );
}

/* ---------- Spouse Objection Playbook cover card ---------- */

function SpouseProductCard() {
  return (
    <ProductCoverCard
      img="/cover-thumbs/spouse-playbook.png"
      alt="The Spouse Objection Playbook cover"
      badge={<QuickCardBadge />}
      title="The Spouse Objection Playbook"
      desc="10 word-for-word closes for 'I need to ask my spouse' — and how to spot a real objection vs. a delay."
      price="$6.99"
      slug="spouse"
      ctaLabel="Buy now — $6.99"
      ctaAriaLabel="Get The Spouse Objection Playbook — $6.99"
      chipTitle="Respect the partnership. Save the deal."
      chipSub="Ten closes, zero pressure"
    />
  );
}

/* ---------- Pray About It Objection Playbook cover card ---------- */

function PrayAboutItProductCard() {
  return (
    <ProductCoverCard
      img="/cover-thumbs/pray-playbook.png"
      alt="The “Pray About It” Objection Playbook cover"
      badge={<QuickCardBadge />}
      title="The “Pray About It” Objection Playbook"
      desc="8 respectful closes for 'I want to pray about it' — plus a what-to-avoid page."
      price="$6.99"
      slug="pray-about-it"
      ctaLabel="Buy now — $6.99"
      ctaAriaLabel="Get The “Pray About It” Objection Playbook — $6.99"
      chipTitle="Honor the belief. Never weaponize it."
      chipSub="Eight respectful closes"
    />
  );
}

/* ---------- Trade-In Objection Playbook cover card ---------- */

function TradeInProductCard() {
  return (
    <ProductCoverCard
      img="/cover-thumbs/tradein-playbook.png"
      alt="The “I Want More for My Trade-In” Playbook cover"
      badge={<QuickCardBadge />}
      title="The “I Want More for My Trade-In” Playbook"
      desc="10 closes for 'I want more for my trade-in' — including the owner's favorite trade close."
      price="$6.99"
      slug="trade-in"
      ctaLabel="Buy now — $6.99"
      ctaAriaLabel="Get The “I Want More for My Trade-In” Playbook — $6.99"
      chipTitle="Win the whole deal, not one number."
      chipSub="The owner’s favorite trade close"
    />
  );
}

/* ---------- Qualifying Questions Guide cover card ---------- */

function QualifyingQuestionsProductCard() {
  return (
    <ProductCoverCard
      img="/cover-thumbs/qualifying-questions.png"
      alt="The Qualifying Questions Guide cover"
      badge={<QuickCardBadge />}
      title="The Qualifying Questions Guide"
      desc="75 questions in nine categories — the Golden 10 and the full Reason-to-Commitment flow."
      price="$6.99"
      slug="qualifying-questions"
      ctaLabel="Buy now — $6.99"
      ctaAriaLabel="Get The Qualifying Questions Guide — $6.99"
      chipTitle="Ask better questions."
      chipSub="75 questions · Golden 10"
    />
  );
}

/* ---------- New product cover cards ---------- */
function WalkAroundProductCard() { return <ProductCoverCard img="/cover-thumbs/walk-around-guide.png" alt="Vehicle Walk-Around Training Guide cover" badge={<QuickCardBadge />} title="Vehicle Walk-Around Training Guide" desc="The 11-step walk-around: engage the customer, build ownership, and flow into the test drive." price="$6.99" slug="walk-around" ctaLabel="Buy now — $6.99" ctaAriaLabel="Get Vehicle Walk-Around Training Guide — $6.99" chipTitle="Present every vehicle with confidence." chipSub="14-page PDF guide" />; }
function LeadershipProductCard() { return <ProductCoverCard img="/cover-thumbs/leadership-academy.png" alt="Blamo Closing Leadership Academy cover" badge={<QuickCardBadge />} title="Blamo Closing Leadership Academy" desc="A 40-page leadership course: coaching formula, daily meetings, scorecards, motivation, and the Blamo Standards." price="$24.99" slug="leadership" ctaLabel="Buy now — $24.99" ctaAriaLabel="Get Blamo Closing Leadership Academy — $24.99" chipTitle="Lead the floor. Raise the standard." chipSub="40-page PDF manual" />; }
function FIAwarenessProductCard() { return <ProductCoverCard img="/cover-thumbs/fi-awareness.png" alt="F&I Awareness Training Manual cover" badge={<QuickCardBadge />} title="F&I Awareness Training Manual" desc="8-chapter manual: prepare the customer for finance, present protection products, and hand off with confidence." price="$6.99" slug="fi-awareness" ctaLabel="Buy now — $6.99" ctaAriaLabel="Get F&I Awareness Training Manual — $6.99" chipTitle="Build trust through the finance process." chipSub="12-page PDF manual" />; }

function ProspectingProductCard() { return <ProductCoverCard img="/cover-thumbs/prospecting.png" alt="Prospecting Like a Professional cover" badge={<QuickCardBadge />} title="Prospecting Like a Professional" desc="Build your brand and fill your pipeline: the 100-person list, daily prospecting plan, scripts, and the 30-day challenge." price="$6.99" slug="prospecting" ctaLabel="Buy now — $6.99" ctaAriaLabel="Get Prospecting Like a Professional — $6.99" chipTitle="Stop waiting for traffic. Start bringing customers to you." chipSub="14-page PDF guide" />; }
function FollowUpProductCard() { return <ProductCoverCard img="/cover-thumbs/follow-up-that-creates-customers-for-life.png" alt="Follow-Up That Creates Customers for Life cover" badge={<QuickCardBadge />} title="Follow-Up That Creates Customers for Life" desc="A 14-page guide to the 10-day prospect plan, the SOLD customer process, and follow-up scripts that turn one sale into a customer for life." price="$6.99" slug="follow-up" ctaLabel="Buy now — $6.99" ctaAriaLabel="Get Follow-Up That Creates Customers for Life — $6.99" chipTitle="The sale doesn’t end when they leave." chipSub="14-page PDF guide" />; }
function MeetAndGreetProductCard() { return <ProductCoverCard img="/cover-thumbs/meet-and-greet-mastery.png" alt="Meet & Greet Mastery cover" badge={<QuickCardBadge />} title="Meet & Greet Mastery" desc="The 10-second rule, word-for-word opening scripts, body language DOs and DON'Ts, four personality types, and questions that open real conversations." price="$6.99" slug="meet-and-greet" ctaLabel="Buy now — $6.99" ctaAriaLabel="Get Meet & Greet Mastery — $6.99" chipTitle="The first five minutes determine the next five hours." chipSub="13-page PDF guide" />; }

/* ---------- Español (Phase 1) cover cards — Spanish versions ---------- */
function StarterKitEsProductCard() { return <ProductCoverCard img="/cover-thumbs/starter-kit-es.png" alt="Portada del Kit de Inicio del Vendedor" badge={<QuickCardBadge />} title="El Kit de Inicio del Vendedor" desc="El proceso completo de Los 10 Pasos de la Venta — 27 páginas con guiones palabra por palabra, listas de verificación y un plan de práctica de 7 días." price="$24.99" slug="starter-kit-es" ctaLabel="Comprar ahora — $24.99" ctaAriaLabel="Consigue El Kit de Inicio del Vendedor — $24.99" chipTitle="El proceso completo de 10 pasos" chipSub="Paquete de 27 páginas · Saludo → Seguimiento" />; }
function SpouseEsProductCard() { return <ProductCoverCard img="/cover-thumbs/spouse-es.png" alt="Portada del Manual de la Objeción del Cónyuge" badge={<QuickCardBadge />} title="El Manual de la Objeción del Cónyuge" desc="10 cierres palabra por palabra para “necesito consultarlo con mi esposo(a)” — y cómo distinguir una objeción real de una excusa para retrasar." price="$6.99" slug="spouse-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue El Manual de la Objeción del Cónyuge — $6.99" chipTitle="Respeta la pareja. Salva el trato." chipSub="Diez cierres, cero presión" />; }
function TradeInEsProductCard() { return <ProductCoverCard img="/cover-thumbs/trade-in-es.png" alt="Portada del Manual del “Quiero Más por Mi Trade-In”" badge={<QuickCardBadge />} title="El Manual del “Quiero Más por Mi Trade-In”" desc="10 cierres para “quiero más por mi intercambio” — incluido el cierre de intercambio favorito del propietario." price="$6.99" slug="trade-in-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue El Manual del “Quiero Más por Mi Trade-In” — $6.99" chipTitle="Gana el trato completo, no un solo número." chipSub="El cierre de intercambio favorito" />; }
function QualifyingQuestionsEsProductCard() { return <ProductCoverCard img="/cover-thumbs/qualifying-questions-es.png" alt="Portada de la Guía de Preguntas de Calificación" badge={<QuickCardBadge />} title="La Guía de Preguntas de Calificación" desc="75 preguntas en nueve categorías — el Golden 10 y el flujo completo de Razón → Compromiso." price="$6.99" slug="qualifying-questions-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue La Guía de Preguntas de Calificación — $6.99" chipTitle="Haz mejores preguntas." chipSub="75 preguntas · Golden 10" />; }

function InternetSaleEsProductCard() { return <ProductCoverCard img="/cover-thumbs/internet-sale-es.png" alt="Los 10 Pasos de la Venta por Internet" badge={<QuickCardBadge />} title="Los 10 Pasos de la Venta por Internet" desc="Guía práctica de capacitación automotriz en español." price="$6.99" slug="internet-sale-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue Los 10 Pasos de la Venta por Internet — $6.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
function PrayAboutItEsProductCard() { return <ProductCoverCard img="/cover-thumbs/pray-about-it-es.png" alt="El Manual de la Objeción 'Déjeme Orarlo'" badge={<QuickCardBadge />} title="El Manual de la Objeción 'Déjeme Orarlo'" desc="Guía práctica de capacitación automotriz en español." price="$6.99" slug="pray-about-it-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue El Manual de la Objeción 'Déjeme Orarlo' — $6.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
function WalkAroundEsProductCard() { return <ProductCoverCard img="/cover-thumbs/walk-around-es.png" alt="Guía de Capacitación del Recorrido del Vehículo" badge={<QuickCardBadge />} title="Guía de Capacitación del Recorrido del Vehículo" desc="Guía práctica de capacitación automotriz en español." price="$6.99" slug="walk-around-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue Guía de Capacitación del Recorrido del Vehículo — $6.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
function FIAwarenessEsProductCard() { return <ProductCoverCard img="/cover-thumbs/fi-awareness-es.png" alt="El Manual de Capacitación en F&I" badge={<QuickCardBadge />} title="El Manual de Capacitación en F&I" desc="Guía práctica de capacitación automotriz en español." price="$6.99" slug="fi-awareness-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue El Manual de Capacitación en F&I — $6.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
function ProspectingEsProductCard() { return <ProductCoverCard img="/cover-thumbs/prospecting-es.png" alt="Prospectando Como un Profesional" badge={<QuickCardBadge />} title="Prospectando Como un Profesional" desc="Guía práctica de capacitación automotriz en español." price="$6.99" slug="prospecting-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue Prospectando Como un Profesional — $6.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
function MeetAndGreetEsProductCard() { return <ProductCoverCard img="/cover-thumbs/meet-and-greet-es.png" alt="Maestría en el Recibimiento y el Saludo" badge={<QuickCardBadge />} title="Maestría en el Recibimiento y el Saludo" desc="Guía práctica de capacitación automotriz en español." price="$6.99" slug="meet-and-greet-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue Maestría en el Recibimiento y el Saludo — $6.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
function FollowUpEsProductCard() { return <ProductCoverCard img="/cover-thumbs/follow-up-es.png" alt="El Seguimiento Que Crea Clientes de Por Vida" badge={<QuickCardBadge />} title="El Seguimiento Que Crea Clientes de Por Vida" desc="Guía práctica de capacitación automotriz en español." price="$6.99" slug="follow-up-es" ctaLabel="Comprar ahora — $6.99" ctaAriaLabel="Consigue El Seguimiento Que Crea Clientes de Por Vida — $6.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
function LeadershipEsProductCard() { return <ProductCoverCard img="/cover-thumbs/leadership-es.png" alt="Academia de Liderazgo de Blamo Closing" badge={<QuickCardBadge />} title="Academia de Liderazgo de Blamo Closing" desc="Guía práctica de capacitación automotriz en español." price="$24.99" slug="leadership-es" ctaLabel="Comprar ahora — $24.99" ctaAriaLabel="Consigue Academia de Liderazgo de Blamo Closing — $24.99" chipTitle="Guía PDF en español" chipSub="Lectura práctica" />; }
/* ---------- Page ---------- */

function Home() {
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("promo")?.trim().toUpperCase();
    const saved = localStorage.getItem("blamo-promo") || "";
    const value = fromUrl || saved;
    if (value) { setPromo(value); setPromoApplied(value === "BLAMO10"); localStorage.setItem("blamo-promo", value); }
  }, []);

  function applyPromo() {
    const value = promo.trim().toUpperCase();
    setPromo(value);
    setPromoApplied(value === "BLAMO10");
    if (value === "BLAMO10") localStorage.setItem("blamo-promo", value);
    else localStorage.removeItem("blamo-promo");
  }
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
          <div className="flex items-center gap-5">
            <AuthNav />
            <div className="hidden items-center gap-5 lg:flex">
            <a
              href="#buy"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              10 Steps of the Sale
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
              href="#qualifying-questions"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Qualifying Questions
            </a>
            <a
              href="/es"
              className="text-sm font-medium text-amber-700 transition hover:text-amber-500"
            >
              Español
            </a>
            <a
              href="/contact"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              Contact
            </a>
            <a
              href="#catalog"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Get the Complete Package
            </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero: the brand moment */}
      <section id="top" className="hero-brand relative overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(52rem_34rem_at_88%_10%,rgba(251,191,36,0.2),transparent)]" />
        <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        {/* Keep the shared background art present in this section. */}
        <BgArt kind="car" side="left" />
        <BgArt kind="mascot" side="right" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-14 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-32 lg:pt-24">
          <div className="hero-copy max-w-2xl text-center sm:text-left">
            <div className="mb-7 flex items-center justify-center gap-3 sm:justify-start">
              <LogoMark className="h-11 w-11 shadow-lg shadow-slate-900/20" />
              <div className="text-left">
                <p className="text-xl font-extrabold tracking-tight text-slate-950">Blamo<span className="text-amber-500"> Closing</span></p>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Dealership sales training</p>
              </div>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">{HERO_COPY.tagline}</p>
            <p className="mt-3 flex items-center justify-center gap-2 text-base font-extrabold tracking-tight text-slate-900 sm:justify-start sm:text-lg"><span className="text-amber-500" aria-hidden="true">★</span>{HERO_COPY.credibility}</p>
            <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-[4.25rem]">{HERO_COPY.headline}</h1>
            <p className="mt-6 max-w-xl text-lg font-extrabold leading-snug tracking-tight text-slate-900 sm:text-xl">{HERO_COPY.opener}</p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">{HERO_COPY.subheadline}</p>
            <ul className="mt-7 grid gap-3 text-left sm:grid-cols-3 sm:gap-4">
              {HERO_COPY.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm font-semibold leading-snug text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950"><CheckIcon className="h-3.5 w-3.5" /></span>
                  {highlight}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-5 sm:justify-start">
              <a href="#catalog" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-4 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">{HERO_COPY.primaryCta}<ArrowIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" /></a>
              <a href="#faq" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 underline decoration-amber-400 decoration-2 underline-offset-4 transition hover:text-slate-950">{HERO_COPY.secondaryCta}<span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero-mascot relative mx-auto flex min-h-[300px] w-full max-w-md items-end justify-center sm:min-h-[390px] lg:min-h-[470px]">
            <div className="absolute bottom-5 h-40 w-64 rounded-full bg-amber-300/25 blur-2xl sm:h-52 sm:w-80" />
            <img src="/blamo-mascot.svg" alt="Blamo Closing car-salesman mascot" className="mascot-float relative z-10 w-64 drop-shadow-2xl sm:w-80 lg:w-[25rem]" />
            <div className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-center text-xs font-bold text-slate-700 shadow-lg shadow-slate-900/10">Practical words for real conversations.</div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <BgArt kind="happy-rep" side="right" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <Eyebrow>What it does for you</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A complete process, not a bag of tricks
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              The Starter Kit packet runs every customer through the same ten
              steps in order — so you never skip a step, never guess what comes
              next, and always know what to say.
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

      {/* What's inside */}
      <section id="inside" className="bg-slate-50 scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <BgArt kind="handshake" side="left" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
                "A negotiation planning framework: know your range, identify what the customer actually cares about, and find the win-win.",
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
                One downloadable 27-page PDF with the owner’s full ten-step
                sales process, word-for-word scripts, per-step drills and
                worksheets, a 7-day practice plan, and a pocket quick-reference
                one-pager. Download it right after checkout and keep it
                forever.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="audience" className="bg-white relative overflow-hidden">
        <BgArt side="left" />
        <BgArt kind="driving" side="right" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
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

      {/* Complete 11-product catalog */}
      <section id="catalog" className="border-t border-slate-100 bg-slate-50 scroll-reveal relative overflow-hidden">
        <BgArt kind="mascot-keys" side="left" className="hidden sm:block top-8 bottom-auto" />
        <BgArt kind="keys" side="right" className="hidden sm:block top-8 bottom-auto" />
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24"><div className="text-center"><Eyebrow>Browse the training</Eyebrow><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Practical training for every part of the deal</h2><p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{`${INDIVIDUAL_PRODUCT_COUNT} standalone training products, built for real dealership conversations.`}</p></div>
                    {/* ═══════ The Complete Package — featured bundle card (FIRST) ═══════ */}
          <div className="mt-14">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 shadow-2xl shadow-slate-900/40 ring-2 ring-amber-400/60">
              {/* BEST VALUE ribbon */}
              <div className="absolute -right-11 top-7 z-10 rotate-45 bg-amber-400 px-12 py-1.5 shadow-lg shadow-black/30">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-950">Best Value</p>
              </div>
              {/* glow accents */}
              <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="relative grid gap-8 p-8 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12 lg:p-12">
                {/* Cover */}
                <div className="mx-auto w-full max-w-[16rem] lg:max-w-[15rem]">
                  <img
                    src="/cover-thumbs/complete-package.png"
                    alt="The Complete Package cover — gold and navy with a BEST VALUE ribbon"
                    width={600}
                    height={800}
                    loading="lazy"
                    className="aspect-[3/4] w-full rounded-xl object-cover shadow-2xl shadow-black/50 ring-1 ring-amber-300/40"
                  />
                </div>
                {/* Copy */}
                <div className="text-center lg:text-left">
                  <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    The Complete Package
                  </p>
                  <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl">
                    Everything you need to be successful in sales in the automotive industry
                  </h3>
                  <p className="mt-4 text-lg leading-relaxed text-slate-300">
                    Every current + future title —{" "}
                    <span className="font-semibold text-amber-300">one unlock, the whole library.</span>
                  </p>
                  {/* Price */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start">
                    <span className="text-2xl font-extrabold tracking-tight text-white">$79.99</span>
                    <s className="text-lg font-semibold text-slate-400">$239.76</s>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-300/40">
                      Save 67%
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-amber-300">
                    Use code BLAMO10 at checkout → $71.99
                  </p>
                  {/* What you get */}
                  <ul className="mt-6 space-y-2.5 text-left text-sm leading-relaxed text-slate-300">
                    <li className="flex gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      All 24 current titles — playbooks, guides, and the 27-page Starter Kit, English + Español (a $239.76 value)
                    </li>
                    <li className="flex gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      Every future release, added to your account automatically
                    </li>
                    <li className="flex gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                      One purchase, one unlock — download any title, any time
                    </li>
                  </ul>
                  <div className="mt-8 flex justify-center lg:justify-start">
                    <BuyButton
                      slug="complete-package"
                      promoCode={promoApplied ? "BLAMO10" : undefined}
                      label="Get The Complete Package — $79.99"
                      ariaLabel="Get The Complete Package — everything you need to be successful in sales — $79.99"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-center text-sm text-slate-500">
              Want just one guide? Every title below is available separately —{" "}
              <span className="font-medium text-slate-700">buy what you need.</span>
            </p>
          </div>
          <article id="team-license" className="mt-10 overflow-hidden rounded-2xl border-2 border-amber-300 bg-slate-900 p-7 text-white shadow-xl sm:p-9">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div><p className="text-xs font-black uppercase tracking-widest text-amber-300">For dealerships and managers</p><h3 className="mt-2 text-2xl font-extrabold">Team License — Train Up to 10 Reps</h3><p className="mt-3 max-w-2xl text-slate-300">One team code · up to 10 reps · the whole library — English + Español, present + future</p><p className="mt-4 text-2xl font-black text-amber-300">$299.00</p></div>
              <BuyButton slug="team-license" promoCode={promoApplied ? "BLAMO10" : undefined} label="Get the Team License — $299.00" ariaLabel="Get the Team License — train up to 10 reps — $299.00" />
            </div>
          </article>
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div><p className="font-bold text-slate-900">Save 10% with BLAMO10</p><p className="mt-1 text-sm text-slate-600">Apply it to your next checkout. $6.99 becomes $6.29 · $24.99 becomes $22.49 · $79.99 becomes $71.99.</p></div>
            <div className="mt-4 flex shrink-0 gap-2 sm:mt-0"><label htmlFor="promo-code" className="sr-only">Promo code</label><input id="promo-code" value={promo} onChange={(e) => setPromo(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }} placeholder="BLAMO10" className="w-32 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold uppercase text-slate-900"/><button type="button" onClick={applyPromo} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Apply</button></div>
            {promoApplied && <p className="mt-2 text-sm font-semibold text-emerald-700 sm:mt-0">BLAMO10 applied — discount will show in checkout.</p>}
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
<ProductCard /><InternetSalesProductCard /><SpouseProductCard /><PrayAboutItProductCard /><TradeInProductCard /><QualifyingQuestionsProductCard /><WalkAroundProductCard /><FIAwarenessProductCard /><ProspectingProductCard /><MeetAndGreetProductCard /><FollowUpProductCard /><LeadershipProductCard /></div>

          {/* En Español — Spanish Phase 1 versions (same prices, bundle-included) */}
          <div className="mt-16 border-t border-slate-200 pt-12">
            <div className="text-center">
              <Eyebrow>En Español</Eyebrow>
              <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Los mismos guías, ahora en español</h3>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">Versiones en español de nuestros guías principales — los mismos precios, e incluidas en el Complete Package.</p>
            </div>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <StarterKitEsProductCard /><SpouseEsProductCard /><TradeInEsProductCard /><QualifyingQuestionsEsProductCard /><InternetSaleEsProductCard /><PrayAboutItEsProductCard /><WalkAroundEsProductCard /><FIAwarenessEsProductCard /><ProspectingEsProductCard /><MeetAndGreetEsProductCard /><FollowUpEsProductCard /><LeadershipEsProductCard />
            </div>
          </div>
        </div>
      </section>
      <section id="new-products" className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden"><BgArt kind="happy-client" side="left" className="hidden sm:block" /><BgArt kind="keys" side="right" className="hidden sm:block" /><div className="mx-auto max-w-6xl px-6 py-20 sm:py-24"><div className="text-center"><Eyebrow>More tools for the sales floor</Eyebrow><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Build skill beyond the close</h2></div><div className="mt-12 grid gap-6 lg:grid-cols-3">{[
{id:"walk-around",title:"Vehicle Walk-Around Training Guide",price:"$6.99",desc:"A practical 14-page guide to presenting every vehicle with a clear, confident walk-around.",benefits:["A repeatable walk-around flow","Feature-to-benefit language","Practice checklist"]},{id:"leadership",title:"Blamo Closing Leadership Academy",price:"$24.99",desc:"A 40-page leadership manual for sales managers and team leads who want a stronger, more consistent floor.",benefits:["Coach the process, not pressure","Build daily accountability","Develop confident reps"]},{id:"fi-awareness",title:"F&I Awareness Training Manual",price:"$6.99",desc:"A 12-page guide to understanding the finance handoff and keeping customer trust intact.",benefits:["Prepare customers for F&I","Explain the handoff clearly","Protect the customer experience"]}].map((product)=><article key={product.id} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h3 className="text-xl font-bold text-slate-900">{product.title}</h3><p className="mt-3 leading-relaxed text-slate-600">{product.desc}</p><ul className="mt-5 space-y-2 text-sm text-slate-700">{product.benefits.map((b)=><li key={b} className="flex gap-2"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />{b}</li>)}</ul><div className="mt-7 flex items-center justify-between gap-3"><span className="text-xl font-extrabold text-slate-900">{product.price}</span><BuyButton slug={product.id} label={`Get ${product.title} — ${product.price}`} ariaLabel={`Get ${product.title} — ${product.price}`} /></div></article>)}</div></div></section>

      {/* CTA band */}
      <section id="buy" className="bg-slate-900 relative overflow-hidden">
        <BgArt side="right" dark />
        <BgArt kind="happy-rep" side="left" dark />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <div className="flex justify-center">
            <LogoMark className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Close your next conversation with clarity
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Get the Sales Rep Starter Kit — a 27-page packet of the owner’s
            complete 10-step process, from Meet & Greet to follow-up. Download
            it instantly after purchase.
          </p>
          <div className="mt-12 flex justify-center">
            <ProductCard />
          </div>
          <div className="mt-16 flex justify-center">
            <BuyButton slug="starter-kit" />
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
      <section id="faq" className="bg-white relative overflow-hidden">
        <BgArt side="left" />
        <BgArt kind="happy-client" side="right" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <div className="text-center">
            <Eyebrow>FAQs</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Questions, answered
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {[
              {
                q: "What is The Complete Package?",
                a: "It’s the whole Blamo Closing library in one purchase: all 24 current titles — the $24.99 Sales Rep Starter Kit, the $24.99 Leadership Academy, and every $6.99 playbook and guide, English + Español ($239.76 if bought separately) — for $79.99, about 67% off. One checkout, one unlock, and every future title is included at no extra cost.",
              },
              {
                q: "How does the bundle unlock work?",
                a: "After you pay, the confirmation codes for every current title unlock in your account instantly — they show up on the thank-you page and under My account (Your purchases), each with its own download button. When new titles launch, they’re added to your account automatically; there’s nothing to re-buy and no code to wait for.",
              },
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
                a: "A downloadable PDF guide with practical explanations, scripts, checklists, and exercises designed for same-day use. After you pay through Stripe’s secure checkout, your download unlocks automatically in your account — the confirmation code and download button appear right on the thank-you page, and they’re always waiting under your account (Your purchases) whenever you log back in. Stripe emails you the payment receipt.",
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
       * THE 10 STEPS TO THE INTERNET SALE — FOURTH PRODUCT
       * ═══════════════════════════════════════════════════════════ */}

      {/* Internet Sale — product hero */}
      <section
        id="internet-sales"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_75%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <BgArt side="left" />
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
                slug="internet-sales"
                label="Get The 10 Steps to the Internet Sale — $6.99"
                ariaLabel="Get The 10 Steps to the Internet Sale — $6.99"
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
      <section className="bg-slate-50 scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
                Pairs with the Sales Rep Starter Kit: use this guide to win the
                lead online, then run the in-store 10-step process when they
                arrive.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Internet Sale — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
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
      <section className="bg-slate-900 relative overflow-hidden">
        <BgArt side="left" dark />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
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
              slug="internet-sales"
              label="Get The 10 Steps to the Internet Sale — $6.99"
              ariaLabel="Get The 10 Steps to the Internet Sale — $6.99"
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
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
                a: "No. The 10 Steps of the Sale is the in-store floor process — it’s now part of the Sales Rep Starter Kit packet. This guide covers the internet-lead process before the customer arrives, and includes the complete BLAMO Video Formula.",
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
       * THE SPOUSE OBJECTION PLAYBOOK — FIFTH PRODUCT ($6.99)
       * ═══════════════════════════════════════════════════════════ */}

      {/* Spouse — product hero */}
      <section
        id="spouse"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_25%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <BgArt side="left" />
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
                slug="spouse"
                label="Get The Spouse Objection Playbook — $6.99"
                ariaLabel="Get The Spouse Objection Playbook — $6.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 14-page PDF · $6.99 · Same-day use
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
      <section className="bg-slate-50 scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
                "The owner’s real-objection-versus-delay diagnosis guidance, with the four signals to look for.",
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
                Sold separately at $6.99 — pairs with the Starter Kit to
                sharpen your objection handling.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Spouse — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Dealership reps, internet teams & specialists
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            New and veteran dealership sales reps, internet sales teams, and
            product specialists who encounter “I need to ask my spouse” and want to
            respond with confidence instead of pressure.
          </p>
        </div>
      </section>

      {/* Spouse — CTA band */}
      <section className="bg-slate-900 relative overflow-hidden">
        <BgArt side="right" dark />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
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
              slug="spouse"
              label="Get The Spouse Objection Playbook — $6.99"
              ariaLabel="Get The Spouse Objection Playbook — $6.99"
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
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
       * THE "PRAY ABOUT IT" OBJECTION PLAYBOOK — SIXTH PRODUCT ($6.99)
       * ═══════════════════════════════════════════════════════════ */}

      {/* Pray About It — product hero */}
      <section
        id="pray-about-it"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_75%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <BgArt side="left" />
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
                slug="pray-about-it"
                label="Get The “Pray About It” Objection Playbook — $6.99"
                ariaLabel="Get The “Pray About It” Objection Playbook — $6.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 13-page PDF · $6.99 · Same-day use
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
      <section className="bg-slate-50 scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
                Sold separately at $6.99 — pairs with the Starter Kit to keep
                the door open without pressure.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Pray About It — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
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
      <section className="bg-slate-900 relative overflow-hidden">
        <BgArt side="left" dark />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
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
              slug="pray-about-it"
              label="Get The “Pray About It” Objection Playbook — $6.99"
              ariaLabel="Get The “Pray About It” Objection Playbook — $6.99"
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
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
       * THE "I WANT MORE FOR MY TRADE-IN" PLAYBOOK — SEVENTH PRODUCT ($6.99)
       * ═══════════════════════════════════════════════════════════ */}

      {/* Trade-In — product hero */}
      <section
        id="trade-in"
        className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_38rem_at_25%_-15%,rgba(251,191,36,0.14),transparent)]" />
        <BgArt side="left" />
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
                slug="trade-in"
                label="Get The “I Want More for My Trade-In” Playbook — $6.99"
                ariaLabel="Get The “I Want More for My Trade-In” Playbook — $6.99"
              />
            </div>
            <p className="mt-5 text-sm text-slate-500">
              Instant download · 15-page PDF · $6.99 · Same-day use
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
      <section className="bg-slate-50 scroll-reveal relative overflow-hidden">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-24">
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
                Sold separately at $6.99 — pairs with the Sales Rep Starter Kit
                to keep negotiations honest inside the full 10-step process.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Trade-In — who it's for */}
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
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
      <section className="bg-slate-900 relative overflow-hidden">
        <BgArt side="right" dark />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
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
              slug="trade-in"
              label="Get The “I Want More for My Trade-In” Playbook — $6.99"
              ariaLabel="Get The “I Want More for My Trade-In” Playbook — $6.99"
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
      <section className="border-t border-slate-100 bg-white scroll-reveal relative overflow-hidden">
        <BgArt side="left" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24">
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

      {/* Meet & Greet Mastery — product section */}
      <section id="meet-and-greet" className="relative overflow-hidden border-t border-slate-100 bg-white scroll-reveal"><BgArt side="right" /><div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28"><div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><div><Eyebrow>New · Meet & Greet Mastery</Eyebrow><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Win the first five minutes — and earn the next five hours.</h2><p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">A 13-page guide to the 10-second rule, opening scripts, body language, personality types, and questions that turn a greeting into a real conversation.</p><div className="mt-8 flex flex-wrap gap-4"><BuyButton slug="meet-and-greet" label="Get Meet & Greet Mastery — $6.99" ariaLabel="Get Meet & Greet Mastery — $6.99" /><a href="/thanks?product=meet-and-greet" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900">Already purchased? Enter your code</a></div></div><div className="pb-8 lg:pb-0"><MeetAndGreetProductCard /></div></div><div className="mt-16 grid gap-12 lg:grid-cols-2"><div><Eyebrow>What you’ll learn</Eyebrow><ul className="mt-5 space-y-3">{["Apply the 10-second rule to make a confident first impression.","Use word-for-word opening scripts for different customer situations.","Read body language and adapt to four customer personality types.","Ask questions that open real conversations and move the sale forward."].map((item)=><li key={item} className="flex gap-3 leading-relaxed text-slate-600"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />{item}</li>)}</ul></div><div><Eyebrow>FAQs</Eyebrow><div className="mt-5 space-y-3">{[["What is the 10-second rule?","It is the first-impression window: greet with confidence, warmth, and a clear opening that gives the customer room to engage."],["Is this only for experienced sales reps?","No. The scripts and practice guidance are useful for a brand-new rep and a seasoned professional."],["What does the guide include?","It includes opening scripts, body-language guidance, four personality types, conversation-opening questions, and practice exercises."],["How does it fit with the other guides?","It gives you a stronger start to the conversation, while the other guides build the skills that carry the customer through the rest of the sale."]].map(([q,a])=><details key={q} className="faq rounded-xl border border-slate-200 bg-white"><summary className="px-5 py-4 font-semibold text-slate-900">{q}</summary><p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p></details>)}</div></div></div></div></section>
      {/* Follow-Up That Creates Customers for Life — product section */}
      <section id="follow-up" className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"><BgArt side="left" /><div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28"><div className="grid gap-12 lg:grid-cols-2"><div><Eyebrow>New · Follow-Up That Creates Customers for Life</Eyebrow><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">The sale doesn’t end when they leave. That’s where the relationship begins.</h2><p className="mt-6 text-lg leading-relaxed text-slate-600">A 14-page guide to the 10-day prospect follow-up plan, the SOLD customer process, and scripts that turn one sale into a customer for life.</p><div className="mt-8"><BuyButton slug="follow-up" label="Get Follow-Up That Creates Customers for Life — $6.99" ariaLabel="Get Follow-Up That Creates Customers for Life — $6.99" /></div></div><div><FollowUpProductCard /><div className="mt-8"><Eyebrow>What you’ll learn</Eyebrow><ul className="mt-4 space-y-2 text-slate-600">{["Run the 10-day prospect follow-up plan with word-for-word scripts.","Stay top of mind without becoming annoying.","Use the SOLD customer process to keep buyers happy after delivery.","Ask for reviews and referrals at the right moments.","Follow up on birthdays, vehicle anniversaries, and service visits."].map(x=><li key={x}>• {x}</li>)}</ul></div><div className="mt-8"><Eyebrow>FAQs</Eyebrow><p className="mt-3 text-slate-600">The guide includes prospect and long-term follow-up plans, the SOLD process, and scripts for reviews, referrals, birthdays, anniversaries, and service visits.</p></div></div></div></div></section>
      {/* Prospecting Like a Professional — product section */}
      <section id="prospecting" className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal"><BgArt side="left" /><div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28"><div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><div><Eyebrow>New · Prospecting Like a Professional</Eyebrow><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Stop waiting for traffic. Start bringing customers to you.</h2><p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">A 14-page playbook to build your personal brand, work your first 100 contacts, and fill your pipeline with people who know, like, and trust you — without a single pressure play.</p><div className="mt-8 flex flex-wrap gap-4"><BuyButton slug="prospecting" label="Get Prospecting Like a Professional — $6.99" ariaLabel="Get Prospecting Like a Professional — $6.99" /><a href="/thanks?product=prospecting" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">Already purchased? Enter your code</a></div></div><div className="pb-8 lg:pb-0"><ProspectingProductCard /></div></div><div className="mt-16 grid gap-12 lg:grid-cols-2"><div><Eyebrow>What you’ll learn</Eyebrow><ul className="mt-5 space-y-3">{["Build a personal brand and introduce yourself as an Automotive Product Specialist.","Create your first 100-contact list with ready-to-use announcement, text, social, and phone scripts.","Use a daily social media strategy, community moves, and the Referral Formula.","Follow a daily prospecting scorecard and a 30-Day Challenge to build the habit."].map((item)=><li key={item} className="flex gap-3 leading-relaxed text-slate-600"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />{item}</li>)}</ul></div><div><Eyebrow>FAQs</Eyebrow><div className="mt-5 space-y-3">{[["Is this too advanced for a brand-new rep?","No. It starts with your first 100 contacts and walks you through the daily habits one step at a time."],["Does it promise a certain number of sales?","No. It gives you a pressure-free system; results depend on your market and consistency."],["Is this about cold-calling strangers?","No. It starts with people you already know, then grows through community visibility and referrals."],["Does it work with the other playbooks?","Yes. Prospecting fills your pipeline while the other guides help you close what walks in."]].map(([q,a])=><details key={q} className="faq rounded-xl border border-slate-200 bg-white"><summary className="px-5 py-4 font-semibold text-slate-900">{q}</summary><p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p></details>)}</div></div></div></div></section>
      {/* Qualifying Questions Guide — product section */}
      <section id="qualifying-questions" className="relative overflow-hidden border-t border-slate-100 bg-slate-50 scroll-reveal">
        <BgArt side="right" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Eyebrow>New · The Qualifying Questions Guide</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Stop guessing what the customer wants — ask the questions that uncover why they’re really buying.</h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">Seventy-five qualification questions across nine categories, the Golden 10, and a six-step sales flow: build rapport, find the real motivation, and present with confidence — without giving away the price.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <BuyButton slug="qualifying-questions" label="Get The Qualifying Questions Guide — $6.99" ariaLabel="Get The Qualifying Questions Guide — $6.99" />
                <a href="/thanks?product=qualifying-questions" className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900">Already purchased? Enter your code</a>
              </div>
            </div>
            <div className="pb-8 lg:pb-0">
              <QualifyingQuestionsProductCard />
            </div>
          </div>
          <div className="mt-20 grid gap-12 lg:grid-cols-2">
            <div><Eyebrow>What you’ll learn</Eyebrow><ul className="mt-5 space-y-3">{[
              "The owner’s 75 qualifying questions, organized into nine categories — from Building Rapport to Commitment.",
              "Why the best salespeople don’t have the best presentation — they ask the best questions — and how qualification uncovers the “why” behind the purchase.",
              "The Golden 10 — the ten questions every top salesperson should ask, in the order that matters.",
              "The Reason → Driver → Needs → Budget → Decision → Commitment sales flow that guides the whole conversation.",
              "How to find out who has to say yes before you present a single number — and what it will take to earn their business.",
              "How better questions lead to bigger commissions, faster closes, and less discounting.",
            ].map((item) => <li key={item} className="flex gap-3 leading-relaxed text-slate-600"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />{item}</li>)}</ul></div>
            <div><Eyebrow>What’s inside</Eyebrow><ul className="mt-5 space-y-3">{[
              "A 13-page guide (PDF) with all 75 questions organized by category, each with a why-it-matters note.",
              "The Golden 10 — the distilled list you can use on your very next customer.",
              "A six-step sales flow explained stage by stage, with the exact question to ask at every step.",
              "A 7-day practice plan and a quick-reference one-pager to keep at the desk.",
              "Practical, honest training in plain dealer language — no fluff, no hype.",
            ].map((item) => <li key={item} className="flex gap-3 leading-relaxed text-slate-600"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />{item}</li>)}</ul></div>
          </div>
          <div className="mt-14 rounded-2xl border border-amber-200 bg-amber-50 p-6"><Eyebrow>Who it’s for</Eyebrow><p className="mt-3 leading-relaxed text-slate-700">New and veteran dealership sales reps, internet sales teams, and product specialists who want to qualify customers faster, present with more confidence, and close more deals without discounting the price.</p></div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-slate-900"><BgArt side="right" dark /><div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28"><LogoMark className="mx-auto h-12 w-12" /><h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Ask better questions. Close with confidence.</h2><p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">Get The Qualifying Questions Guide — a 13-page PDF with 75 questions, the Golden 10, and a complete sales flow you can use today.</p><div className="mt-9 flex justify-center"><BuyButton slug="qualifying-questions" label="Get The Qualifying Questions Guide — $6.99" ariaLabel="Get The Qualifying Questions Guide — $6.99" /></div><p className="mt-5 text-sm"><a href="/thanks?product=qualifying-questions" className="font-medium text-slate-300 underline underline-offset-2 hover:text-white">Already purchased? Enter your code to download</a></p></div></section>
      <section className="relative overflow-hidden border-t border-slate-100 bg-white scroll-reveal"><BgArt side="left" /><div className="relative mx-auto max-w-3xl px-6 py-20 sm:py-24"><div className="text-center"><Eyebrow>FAQs</Eyebrow><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">The Qualifying Questions Guide, answered</h2></div><div className="mt-12 space-y-3">{[
        ["Do I need experience to use this?", "No. The questions are numbered 1–75 and organized by category, so you can work one category per shift and build from there. The Golden 10 gives you a complete system you can use on your very next customer."],
        ["Won’t this make my conversations feel scripted?", "The questions are conversation starters, not a script to recite. Say them out loud until they sound like you, adapt the wording to your market, and ask with genuine curiosity — the structure works because it sounds natural."],
        ["Is this about manipulating the customer?", "No. The goal is to understand the customer well enough to show them the right vehicle, present the right numbers, and earn the right to close. You never invent a need or put words in a customer’s mouth."],
        ["Does it promise a certain number of sales?", "No. It gives you a complete, honest qualification system and the owner’s exact question set. Results depend on the customer, the inventory, the dealership, and how consistently you practice."],
        ["Is it a PDF I can use on my phone?", "Yes. It’s a PDF that works on any device, and it’s written for reading at the desk between customers — or in the showroom before your next appointment."],
      ].map(([q,a]) => <details key={q} className="faq group rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"><summary className="flex items-center justify-between gap-4 px-5 py-4 text-left"><span className="font-semibold text-slate-900">{q}</span><span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">+</span></summary><p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p></details>)}</div></div></section>
      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
        <img
          src="/blamo-car.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="mascot-float pointer-events-none absolute bottom-1 -left-3 w-14 select-none opacity-[0.14] sm:w-16"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
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
            <a href="#qualifying-questions" className="hover:text-slate-900">
              Qualifying Questions
            </a>
            <a href="/thanks?product=qualifying-questions" className="hover:text-slate-900">
              Download the Qualifying Questions PDF
            </a>
            <a href="/login" className="hover:text-slate-900">
              Log in
            </a>
            <a href="/register" className="hover:text-slate-900">
              Create account
            </a>
            <a href="/account" className="hover:text-slate-900">
              My account
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

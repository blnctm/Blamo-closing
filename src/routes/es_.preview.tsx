import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { startCheckout } from "~/lib/client-api";

export const Route = createFileRoute("/es_/preview")({
  head: () => ({
    meta: [
      { title: "Vista previa: El Sales Rep Starter Kit — Blamo Closing" },
      {
        name: "description",
        content:
          "Vea tres páginas de muestra con marca de agua del Sales Rep Starter Kit: capacitación real de concesionario que puede leer en cualquier dispositivo. Todas las guías siguen este formato.",
      },
    ],
  }),
  component: EsPreview,
});

/* Tres páginas reales de private/starter-kit-10-pasos-es.pdf (la guía insignia
   de 27 páginas), renderizadas a ~935px de ancho y con marca de agua intensa
   para que el formato se vea sin que el contenido sea utilizable. */
const SAMPLES = [
  {
    src: "/preview/preview-es-1.png",
    caption: "Por qué funcionan los 10 Pasos: la introducción que explica el sistema",
  },
  {
    src: "/preview/preview-es-2.png",
    caption: "Panorama de los 10 Pasos: todo el proceso de un vistazo",
  },
  {
    src: "/preview/preview-es-3.png",
    caption: "Paso 1 en detalle: guiones de saludo y ejercicios de práctica",
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
        window.location.href = `/login?next=${encodeURIComponent("/es/preview")}`;
        return;
      }
      setErrorMsg(
        "El pago no está disponible por el momento; inténtelo de nuevo en unos instantes.",
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
        {busy ? "Iniciando el pago…" : label}
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

function EsPreview() {
  return (
    <div lang="es" className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="/es" className="text-lg font-extrabold tracking-tight">
            Blamo<span className="text-slate-400"> Closing</span>
          </a>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <a href="/es" className="rounded-lg py-2 text-slate-500 hover:text-slate-900">
              Inicio
            </a>
            <a href="/refunds" className="rounded-lg py-2 text-slate-500 hover:text-slate-900">
              Reembolsos
            </a>
            <a href="/contact" className="rounded-lg py-2 text-slate-500 hover:text-slate-900">
              Contacto
            </a>
          </nav>
        </div>
      </header>
      <main className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_50%_-10%,rgba(251,191,36,0.22),transparent)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
              Blamo Closing · Páginas de muestra
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Vista previa: El Sales Rep Starter Kit
            </h1>
            <p className="mt-4 text-lg font-semibold text-slate-800">
              Todas las guías siguen este formato.
            </p>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">
              Estas son tres páginas reales del Sales Rep Starter Kit de 27
              páginas, la guía insignia de los 10 Pasos de la Venta. Se muestran
              con una marca de agua intensa para que pueda juzgar la calidad y
              la estructura antes de comprar. La guía completa — cada guion,
              lista de verificación y ejercicio de práctica — se desbloquea en
              su cuenta en cuanto se procesa el pago.
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
            Las páginas de muestra tienen marca de agua y se muestran para
            demostrar el formato y la estructura. Cada guía de la biblioteca
            sigue el mismo formato: un PDF de diseño profesional que puede leer
            en cualquier dispositivo.
          </p>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-900/5 sm:p-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Obtenga el Kit de Inicio completo de 27 páginas
            </h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-600">
              Guiones palabra por palabra, listas de errores que evitar,
              ejercicios de práctica y un plan de práctica de 7 días — $9.99,
              suyo para siempre.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <BuyButton
                slug="starter-kit-es"
                label="Obtener el Sales Rep Starter Kit — $9.99"
                ariaLabel="Obtener el Sales Rep Starter Kit — $9.99"
                variant="primary"
              />
              <BuyButton
                slug="complete-package"
                label="Obtén el Paquete Completo — $34.95"
                ariaLabel="Obtén el Paquete Completo — $34.95"
                variant="secondary"
              />
            </div>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-slate-500">
              ¿Prefiere toda la biblioteca? El Paquete Completo desbloquea
              todos los títulos actuales y futuros — inglés y español — con una
              sola compra.
            </p>
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row">
          <span className="font-semibold text-slate-700">Blamo Closing</span>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <a href="/es" className="hover:text-slate-900">
              Inicio
            </a>
            <a href="/es/preview" className="hover:text-slate-900">
              Vista previa
            </a>
            <a href="/refunds" className="hover:text-slate-900">
              Reembolsos
            </a>
            <a href="/contact" className="hover:text-slate-900">
              Contacto
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

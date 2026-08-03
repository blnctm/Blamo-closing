// ============================================================================
// CONFIRMATION-CODE CONFIG — SERVER-ONLY.
//
// ⚠️  DO NOT import this file from any client-rendered route (index.tsx,
// thanks.tsx, etc.). The codes live ONLY server-side; importing this module
// into a route would bundle the codes into the public JavaScript.
//
// OWNER CAN CHANGE ANY TIME — the owner emails the code to each buyer after
// purchase. Codes are intentionally short and easy to read/type.
//
// Files live in /private (outside Vite's public dir) and are streamed only
// through the code-checked endpoint (see server-assets/download-handler.ts).
//
// To add a product (e.g. a $6.99 objection playbook):
//   1. Add one entry below (slug, code, file, name, kind, mime).
//   2. Drop the PDF/MP4 into /private.
//   3. Point the product's buy button at /thanks?product=<slug> and add a
//      matching display entry in src/routes/thanks.tsx (PRODUCT_META).
// That's it — the code gate, the endpoint, and the download page all work
// from this one table.
// ============================================================================

export type ProductKind = "pdf" | "video" | "zip";

export interface ProductDownload {
  /** Value of the ?product= search param on /thanks. */
  slug: string;
  /** Confirmation code the owner sends to buyers after purchase. */
  code: string;
  /** File name inside /private. */
  file: string;
  /** Display name of the product. */
  name: string;
  kind: ProductKind;
  mime: string;
}

export const PRODUCT_DOWNLOADS: readonly ProductDownload[] = [
  {
    slug: "starter-kit",
    code: "BLAMO-01-8179",
    file: "sales-rep-starter-kit-10-steps.pdf",
    name: "The Sales Rep Starter Kit — The 10 Steps of the Sale",
    kind: "pdf",
    mime: "application/pdf",
  },
  {
    slug: "internet-sales",
    code: "BLAMO-04-4185",
    file: "the-10-steps-to-the-internet-sale.pdf",
    name: "The 10 Steps to the Internet Sale",
    kind: "pdf",
    mime: "application/pdf",
  },
  {
    slug: "spouse",
    code: "BLAMO-05-8485",
    file: "the-spouse-objection-playbook.pdf",
    name: "The Spouse Objection Playbook",
    kind: "pdf",
    mime: "application/pdf",
  },
  {
    slug: "pray-about-it",
    code: "BLAMO-06-0191",
    file: "the-pray-about-it-objection-playbook.pdf",
    name: "The “Pray About It” Objection Playbook",
    kind: "pdf",
    mime: "application/pdf",
  },
  {
    slug: "trade-in",
    code: "BLAMO-07-2327",
    file: "the-trade-in-objection-playbook.pdf",
    name: "The “I Want More for My Trade-In” Playbook",
    kind: "pdf",
    mime: "application/pdf",
  },
  { slug: "trade-in-tax-credit", code: "BLAMO-27-6721", file: "trade-in-tax-credit.pdf", name: "Understanding Trade-In Tax Credit — How to Explain It Clearly to Customers", kind: "pdf", mime: "application/pdf" },
  { slug: "sales-log-template", code: "BLAMO-28-0636", file: "sales-log-template.zip", name: "Sales Log Template — Deals, Gross & Commission", kind: "zip", mime: "application/zip" },
  {
    slug: "qualifying-questions",
    code: "BLAMO-08-4836",
    file: "the-qualifying-questions-guide.pdf",
    name: "The Qualifying Questions Guide",
    kind: "pdf",
    mime: "application/pdf",
  },
  { slug: "walk-around", code: "BLAMO-09-7284", file: "vehicle-walk-around-training-guide.pdf", name: "Vehicle Walk-Around Training Guide", kind: "pdf", mime: "application/pdf" },
  { slug: "leadership", code: "BLAMO-10-5738", file: "leadership-academy-manual.pdf", name: "Blamo Closing Leadership Academy", kind: "pdf", mime: "application/pdf" },
  { slug: "fi-awareness", code: "BLAMO-11-5837", file: "fi-awareness-training-manual.pdf", name: "F&I Awareness Training Manual", kind: "pdf", mime: "application/pdf" },
  { slug: "prospecting", code: "BLAMO-12-3952", file: "prospecting-like-a-professional.pdf", name: "Prospecting Like a Professional", kind: "pdf", mime: "application/pdf" },
  { slug: "meet-and-greet", code: "BLAMO-13-4816", file: "meet-and-greet-mastery.pdf", name: "Meet & Greet Mastery", kind: "pdf", mime: "application/pdf" },
  { slug: "follow-up", code: "BLAMO-14-9062", file: "follow-up-that-creates-customers-for-life.pdf", name: "Follow-Up That Creates Customers for Life", kind: "pdf", mime: "application/pdf" },
  // ── Español (Phase 1) — Spanish versions, same prices, bundle-included.
  // The Complete Package webhook iterates PRODUCT_DOWNLOADS, so these are
  // automatically part of the "every current + future title" unlock.
  { slug: "starter-kit-es", code: "BLAMO-15-3753", file: "starter-kit-10-pasos-es.pdf", name: "El Kit de Inicio del Vendedor — Los 10 Pasos de la Venta", kind: "pdf", mime: "application/pdf" },
  { slug: "spouse-es", code: "BLAMO-16-1988", file: "spouse-objection-es.pdf", name: "El Manual de la Objeción del Cónyuge", kind: "pdf", mime: "application/pdf" },
  { slug: "trade-in-es", code: "BLAMO-17-4804", file: "trade-in-es.pdf", name: "El Manual del “Quiero Más por Mi Trade-In”", kind: "pdf", mime: "application/pdf" },
  { slug: "qualifying-questions-es", code: "BLAMO-18-7769", file: "qualifying-questions-es.pdf", name: "La Guía de Preguntas de Calificación", kind: "pdf", mime: "application/pdf" },
  { slug: "internet-sale-es", code: "BLAMO-19-4827", file: "internet-sale-es.pdf", name: "Los 10 Pasos de la Venta por Internet", kind: "pdf", mime: "application/pdf" },
  { slug: "pray-about-it-es", code: "BLAMO-20-7314", file: "pray-about-it-es.pdf", name: "El Manual de la Objeción 'Déjeme Orarlo'", kind: "pdf", mime: "application/pdf" },
  { slug: "walk-around-es", code: "BLAMO-21-9068", file: "walk-around-es.pdf", name: "Guía de Capacitación del Recorrido del Vehículo", kind: "pdf", mime: "application/pdf" },
  { slug: "fi-awareness-es", code: "BLAMO-22-1549", file: "fi-awareness-es.pdf", name: "El Manual de Capacitación en F&I", kind: "pdf", mime: "application/pdf" },
  { slug: "prospecting-es", code: "BLAMO-23-6283", file: "prospecting-es.pdf", name: "Prospectando Como un Profesional", kind: "pdf", mime: "application/pdf" },
  { slug: "meet-and-greet-es", code: "BLAMO-24-3751", file: "meet-and-greet-es.pdf", name: "Maestría en el Recibimiento y el Saludo", kind: "pdf", mime: "application/pdf" },
  { slug: "follow-up-es", code: "BLAMO-25-8406", file: "follow-up-es.pdf", name: "El Seguimiento Que Crea Clientes de Por Vida", kind: "pdf", mime: "application/pdf" },
  { slug: "leadership-es", code: "BLAMO-26-2974", file: "leadership-academy-es.pdf", name: "Academia de Liderazgo de Blamo Closing", kind: "pdf", mime: "application/pdf" },
];

/** No param (or unknown) → Starter Kit, matching the pre-gate behaviour. */
export function findProduct(
  slug: string | undefined | null,
): ProductDownload | undefined {
  return PRODUCT_DOWNLOADS.find((p) => p.slug === (slug ?? "starter-kit"));
}

/** Normalizes the entered code (trim, uppercase) before comparing. */
export function codeMatches(product: ProductDownload, entered: string): boolean {
  return product.code === entered.trim().toUpperCase();
}

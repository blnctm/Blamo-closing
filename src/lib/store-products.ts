// ⚠️  NO confirmation codes here. Codes live ONLY in src/lib/product-downloads.ts
// (server-only). This file is imported by client routes (thanks, account, home),
// so it must contain nothing secret: slugs, display names, prices, and the
// downloadable file names are all public-facing.
//
// KEEP IN SYNC with src/lib/product-downloads.ts (slug/file/name) and
// src/lib/catalog.ts (unitAmountCents → priceCents). A mismatch only affects
// display, never the actual gate/download.
// ============================================================================
export interface StoreProduct {
  slug: string;
  name: string;
  /** Display price in dollars and cents, e.g. "24.99" (no $ sign). */
  priceCents: 699 | 2499 | 7999;
  /**
   * File name the browser saves the download as (used for the <a download>).
   * Absent on the Complete Package bundle — it has no single PDF; buying it
   * unlocks every title's file instead.
   */
  fileName?: string;
  /** Short kind label shown next to the name ("PDF · 12 pages", "Video · MP4"). */
  kindLabel: string;
  /**
   * True for the Complete Package bundle ("complete-package"). The bundle is a
   * library unlock, not a single product: it has no fileName, its price is
   * 7999, and count copy ("N standalone training products") must exclude it.
   */
  isBundle?: boolean;
}

/** Slug of the Complete Package bundle product. */
export const BUNDLE_SLUG = "complete-package";

export const STORE_PRODUCTS: readonly StoreProduct[] = [
  {
    slug: BUNDLE_SLUG,
    name: "The Complete Package: Everything You Need to Be Successful in Sales in the Automotive Industry",
    priceCents: 7999,
    kindLabel: "The whole library · every current + future title",
    isBundle: true,
  },
  {
    slug: "starter-kit",
    name: "The Sales Rep Starter Kit — The 10 Steps of the Sale",
    priceCents: 2499,
    fileName: "sales-rep-starter-kit-10-steps.pdf",
    kindLabel: "PDF · 27 pages",
  },
  {
    slug: "internet-sales",
    name: "The 10 Steps to the Internet Sale",
    priceCents: 699,
    fileName: "the-10-steps-to-the-internet-sale.pdf",
    kindLabel: "PDF · 15 pages",
  },
  {
    slug: "spouse",
    name: "The Spouse Objection Playbook",
    priceCents: 699,
    fileName: "the-spouse-objection-playbook.pdf",
    kindLabel: "PDF · 14 pages",
  },
  {
    slug: "pray-about-it",
    name: "The “Pray About It” Objection Playbook",
    priceCents: 699,
    fileName: "the-pray-about-it-objection-playbook.pdf",
    kindLabel: "PDF · 13 pages",
  },
  {
    slug: "trade-in",
    name: "The “I Want More for My Trade-In” Playbook",
    priceCents: 699,
    fileName: "the-trade-in-objection-playbook.pdf",
    kindLabel: "PDF · 15 pages",
  },
  {
    slug: "qualifying-questions",
    name: "The Qualifying Questions Guide",
    priceCents: 699,
    fileName: "the-qualifying-questions-guide.pdf",
    kindLabel: "PDF · 13 pages",
  },
  { slug: "walk-around", name: "Vehicle Walk-Around Training Guide", priceCents: 699, fileName: "vehicle-walk-around-training-guide.pdf", kindLabel: "PDF · 14 pages" },
  { slug: "leadership", name: "Blamo Closing Leadership Academy", priceCents: 2499, fileName: "leadership-academy-manual.pdf", kindLabel: "PDF · 40 pages" },
  { slug: "fi-awareness", name: "F&I Awareness Training Manual", priceCents: 699, fileName: "fi-awareness-training-manual.pdf", kindLabel: "PDF · 12 pages" },
  { slug: "prospecting", name: "Prospecting Like a Professional", priceCents: 699, fileName: "prospecting-like-a-professional.pdf", kindLabel: "PDF · 14 pages" },
  { slug: "meet-and-greet", name: "Meet & Greet Mastery", priceCents: 699, fileName: "meet-and-greet-mastery.pdf", kindLabel: "PDF · 13 pages" },
  { slug: "follow-up", name: "Follow-Up That Creates Customers for Life", priceCents: 699, fileName: "follow-up-that-creates-customers-for-life.pdf", kindLabel: "PDF · 14 pages" },
  // ── Español (Phase 1) — Spanish versions of the flagship + first three
  // add-ons. Same prices as the English titles; included in the Complete
  // Package (the bundle unlocks every PRODUCT_DOWNLOADS entry, so adding a
  // product here + in product-downloads.ts makes it bundle-included).
  {
    slug: "starter-kit-es",
    name: "El Kit de Inicio del Vendedor — Los 10 Pasos de la Venta",
    priceCents: 2499,
    fileName: "starter-kit-10-pasos-es.pdf",
    kindLabel: "PDF · 27 páginas",
  },
  {
    slug: "spouse-es",
    name: "El Manual de la Objeción del Cónyuge",
    priceCents: 699,
    fileName: "spouse-objection-es.pdf",
    kindLabel: "PDF · 14 páginas",
  },
  {
    slug: "trade-in-es",
    name: "El Manual del “Quiero Más por Mi Trade-In”",
    priceCents: 699,
    fileName: "trade-in-es.pdf",
    kindLabel: "PDF · 15 páginas",
  },
  {
    slug: "qualifying-questions-es",
    name: "La Guía de Preguntas de Calificación",
    priceCents: 699,
    fileName: "qualifying-questions-es.pdf",
    kindLabel: "PDF · 13 páginas",
  },
];
export function findStoreProduct(
  slug: string | null | undefined,
): StoreProduct | undefined {
  return STORE_PRODUCTS.find((product) => product.slug === slug);
}
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

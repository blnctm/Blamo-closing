// ============================================================================
// CLIENT-SAFE STORE CATALOG — display info for every product.
//
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
  priceCents: 699 | 2499;
  /** File name the browser saves the download as (used for the <a download>). */
  fileName: string;
  /** Short kind label shown next to the name ("PDF · 12 pages", "Video · MP4"). */
  kindLabel: string;
}

export const STORE_PRODUCTS: readonly StoreProduct[] = [
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
];

export function findStoreProduct(
  slug: string | null | undefined,
): StoreProduct | undefined {
  return STORE_PRODUCTS.find((product) => product.slug === slug);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

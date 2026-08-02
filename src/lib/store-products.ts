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
  /** Display price in dollars and cents, e.g. "9.99" (no $ sign). */
  priceCents: 299 | 999;
  /** File name the browser saves the download as (used for the <a download>). */
  fileName: string;
  /** Short kind label shown next to the name ("PDF · 12 pages", "Video · MP4"). */
  kindLabel: string;
}

export const STORE_PRODUCTS: readonly StoreProduct[] = [
  {
    slug: "starter-kit",
    name: "The Sales Rep Starter Kit",
    priceCents: 999,
    fileName: "close-academy-starter-kit.pdf",
    kindLabel: "PDF · 12 pages",
  },
  {
    slug: "ten-steps",
    name: "The 10 Steps of the Sale",
    priceCents: 299,
    fileName: "the-10-steps-of-the-sale.pdf",
    kindLabel: "PDF · 14 pages",
  },
  {
    slug: "five-closes",
    name: "The Five Closes in Action",
    priceCents: 299,
    fileName: "the-five-closes-in-action.mp4",
    kindLabel: "Video · ~10 min · MP4",
  },
  {
    slug: "internet-sales",
    name: "The 10 Steps to the Internet Sale",
    priceCents: 299,
    fileName: "the-10-steps-to-the-internet-sale.pdf",
    kindLabel: "PDF · 15 pages",
  },
  {
    slug: "spouse",
    name: "The Spouse Objection Playbook",
    priceCents: 299,
    fileName: "the-spouse-objection-playbook.pdf",
    kindLabel: "PDF · 14 pages",
  },
  {
    slug: "pray-about-it",
    name: "The “Pray About It” Objection Playbook",
    priceCents: 299,
    fileName: "the-pray-about-it-objection-playbook.pdf",
    kindLabel: "PDF · 13 pages",
  },
  {
    slug: "trade-in",
    name: "The “I Want More for My Trade-In” Playbook",
    priceCents: 299,
    fileName: "the-trade-in-objection-playbook.pdf",
    kindLabel: "PDF · 15 pages",
  },
  {
    slug: "qualifying-questions",
    name: "The Qualifying Questions Guide",
    priceCents: 299,
    fileName: "the-qualifying-questions-guide.pdf",
    kindLabel: "PDF · 13 pages",
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

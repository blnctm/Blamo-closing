// ============================================================================
// CONFIRMATION-CODE CONFIG — SERVER-ONLY.
//
// ⚠️  DO NOT import this file from any client-rendered route (index.tsx,
// thanks.tsx, etc.). The codes live ONLY server-side; importing this module
// into a route would bundle the codes into the public JavaScript.
//
// OWNER CAN CHANGE ANY TIME — codes are sent to buyers after purchase (the
// owner emails the code to each buyer once the sale shows in the owner's
// PayPal dashboard). Codes are intentionally short and easy to read/type.
//
// Files live in /private (outside Vite's public dir) and are streamed only
// through the code-checked endpoint (see server-assets/download-handler.ts).
//
// To add a product (e.g. a $2.99 objection playbook):
//   1. Add one entry below (slug, code, file, name, kind, mime).
//   2. Drop the PDF/MP4 into /private.
//   3. Point the product's buy button at /thanks?product=<slug> and add a
//      matching display entry in src/routes/thanks.tsx (PRODUCT_META).
// That's it — the code gate, the endpoint, and the download page all work
// from this one table.
// ============================================================================

export type ProductKind = "pdf" | "video";

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
    file: "close-academy-starter-kit.pdf",
    name: "The Sales Rep Starter Kit",
    kind: "pdf",
    mime: "application/pdf",
  },
  {
    slug: "ten-steps",
    code: "BLAMO-02-0177",
    file: "the-10-steps-of-the-sale.pdf",
    name: "The 10 Steps of the Sale",
    kind: "pdf",
    mime: "application/pdf",
  },
  {
    slug: "five-closes",
    code: "BLAMO-03-4508",
    file: "the-five-closes-in-action.mp4",
    name: "The Five Closes in Action",
    kind: "video",
    mime: "video/mp4",
  },
  {
    slug: "internet-sales",
    code: "BLAMO-04-4185",
    file: "the-10-steps-to-the-internet-sale.pdf",
    name: "The 10 Steps to the Internet Sale",
    kind: "pdf",
    mime: "application/pdf",
  },
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

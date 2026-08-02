// Server-only Stripe product catalog. Codes are sourced from the download table.
import { BUNDLE_SLUG } from "./store-products";
import { PRODUCT_DOWNLOADS } from "./product-downloads";

export interface CatalogProduct {
  slug: string;
  name: string;
  unitAmountCents: 699 | 2499 | 7999;
  confirmationCode: string;
}

const STARTER_KIT_SLUG = "starter-kit";

/** Code recorded on the Complete Package ownership row (not a download code). */
export const BUNDLE_CONFIRMATION_CODE = "BUNDLE-ALL";

export const PRODUCT_CATALOG: readonly CatalogProduct[] = [
  ...PRODUCT_DOWNLOADS.map((product): CatalogProduct => ({
    slug: product.slug,
    name: product.name,
    unitAmountCents: product.slug === STARTER_KIT_SLUG || product.slug === "leadership" ? 2499 : 699,
    confirmationCode: product.code,
  })),
  // The Complete Package: a library unlock, not a downloadable file. Checkout
  // needs it so the session is created with unit_amount 7999; the webhook
  // special-cases it to unlock every product (see -stripe-webhook.ts).
  {
    slug: BUNDLE_SLUG,
    name: "The Complete Package: Everything You Need to Be Successful in Sales in the Automotive Industry",
    unitAmountCents: 7999,
    confirmationCode: BUNDLE_CONFIRMATION_CODE,
  },
];

export function findCatalogProduct(slug: string | null | undefined): CatalogProduct | undefined {
  return PRODUCT_CATALOG.find((product) => product.slug === slug);
}

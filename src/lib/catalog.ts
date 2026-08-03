// Server-only Stripe product catalog. Codes are sourced from the download table.
import { BUNDLE_SLUG } from "./store-products";
import { PRODUCT_DOWNLOADS } from "./product-downloads";

export interface CatalogProduct {
  slug: string;
  name: string;
  unitAmountCents: 199 | 999 | 3495 | 9995;
  confirmationCode: string;
}

const STARTER_KIT_SLUG = "starter-kit";
const STARTER_KIT_ES_SLUG = "starter-kit-es";

/** Code recorded on the Complete Package ownership row (not a download code). */
export const BUNDLE_CONFIRMATION_CODE = "BUNDLE-ALL";
export const TEAM_LICENSE_CONFIRMATION_CODE = "TEAM-LICENSE-ALL";

export const PRODUCT_CATALOG: readonly CatalogProduct[] = [
  ...PRODUCT_DOWNLOADS.map((product): CatalogProduct => ({
    slug: product.slug,
    name: product.name,
    unitAmountCents: product.slug === STARTER_KIT_SLUG || product.slug === STARTER_KIT_ES_SLUG ? 999 : 199,
    confirmationCode: product.code,
  })),
  { slug: "team-license", name: "Team License — Train Up to 10 Reps", unitAmountCents: 9995, confirmationCode: TEAM_LICENSE_CONFIRMATION_CODE },
  // The Complete Package: a library unlock, not a downloadable file. Checkout
  // needs it so the session is created with unit_amount 3495; the webhook
  // special-cases it to unlock every product (see -stripe-webhook.ts).
  {
    slug: BUNDLE_SLUG,
    name: "The Complete Package: Everything You Need to Be Successful in Sales in the Automotive Industry",
    unitAmountCents: 3495,
    confirmationCode: BUNDLE_CONFIRMATION_CODE,
  },
];

export function findCatalogProduct(slug: string | null | undefined): CatalogProduct | undefined {
  return PRODUCT_CATALOG.find((product) => product.slug === slug);
}

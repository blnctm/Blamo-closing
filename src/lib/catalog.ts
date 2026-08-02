// Server-only Stripe product catalog. Codes are sourced from the download table.
import { PRODUCT_DOWNLOADS } from "./product-downloads";

export interface CatalogProduct {
  slug: string;
  name: string;
  unitAmountCents: 699 | 2499;
  confirmationCode: string;
}

const STARTER_KIT_SLUG = "starter-kit";

export const PRODUCT_CATALOG: readonly CatalogProduct[] = PRODUCT_DOWNLOADS.map((product) => ({
  slug: product.slug,
  name: product.name,
  unitAmountCents: product.slug === STARTER_KIT_SLUG || product.slug === "leadership" ? 2499 : 699,
  confirmationCode: product.code,
}));

export function findCatalogProduct(slug: string | null | undefined): CatalogProduct | undefined {
  return PRODUCT_CATALOG.find((product) => product.slug === slug);
}

// Server-only Stripe product catalog. Codes are sourced from the download table.
import { PRODUCT_DOWNLOADS } from "./product-downloads";

export interface CatalogProduct {
  slug: string;
  name: string;
  unitAmountCents: 299 | 999;
  confirmationCode: string;
}

const PLAYBOOK_SLUGS = new Set(["spouse", "pray-about-it", "trade-in"]);

export const PRODUCT_CATALOG: readonly CatalogProduct[] = PRODUCT_DOWNLOADS.map((product) => ({
  slug: product.slug,
  name: product.name,
  unitAmountCents: PLAYBOOK_SLUGS.has(product.slug) ? 299 : 999,
  confirmationCode: product.code,
}));

export function findCatalogProduct(slug: string | null | undefined): CatalogProduct | undefined {
  return PRODUCT_CATALOG.find((product) => product.slug === slug);
}

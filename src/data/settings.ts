// Ring settings for the ring builder (diamond + setting + metal + ring size).
//
// When INVENTORY_SOURCE=shopify: Shopify products with product type "Setting".
//   Each product has a "Metal" option; each variant's price is the fixed setting price for that metal.
//   Settings are made to order, so Shopify inventory/stock is ignored: every metal is always offered.
// Otherwise: the "Engagement Rings" designs in designs.ts that list `metals`.

import { cache } from "react";
import { getProductsByType } from "@/lib/shopify";
import { designs } from "./designs";
import { INVENTORY_REVALIDATE_SECONDS, inventoryFromShopify } from "./diamonds";

export interface SettingOption {
  metal: string;
  price: number;
  /** Shopify variant ID. Required for online checkout. */
  variantId?: string;
}

export interface Setting {
  slug: string;
  name: string;
  description: string;
  images: string[];
  options: SettingOption[];
}

export const RING_SIZES = [
  "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10",
] as const;

const loadAll = cache(async (): Promise<Setting[]> => {
  if (inventoryFromShopify()) {
    const products = await getProductsByType("Setting", INVENTORY_REVALIDATE_SECONDS);
    return products
      .map((p) => ({
        slug: p.handle,
        name: p.title,
        description: p.description,
        images: p.images.nodes.map((i) => i.url),
        options: p.variants.nodes
          .map((v) => ({
            metal: v.selectedOptions.find((o) => o.name.toLowerCase() === "metal")?.value ?? "",
            price: Number(v.price.amount),
            variantId: v.id,
          }))
          .filter((o) => {
            if (!o.metal || !(o.price > 0)) {
              console.warn(`[settings] skipping a variant of "${p.handle}": needs a Metal option and a price`);
              return false;
            }
            return true;
          }),
      }))
      .filter((s) => s.options.length > 0);
  }

  return designs
    .filter((d) => d.category === "Engagement Rings" && d.metals?.length)
    .map((d) => ({
      slug: d.slug,
      name: d.name,
      description: d.description,
      images: d.images,
      options: d.metals!.map((m) => ({ metal: m.name, price: m.price })),
    }));
});

export async function getSettings(): Promise<Setting[]> {
  return loadAll();
}

export async function getSetting(slug: string): Promise<Setting | undefined> {
  return (await getSettings()).find((s) => s.slug === slug);
}

export function lowestPrice(s: Setting): number {
  return Math.min(...s.options.map((o) => o.price));
}

// Diamond inventory. Source is chosen by INVENTORY_SOURCE:
//   "shopify"      products with product type "Diamond" in your Shopify store (enables online checkout)
//   "csv" (default) a Google Sheet (when INVENTORY_URL is set) or the local file inventory/diamonds.csv
// See README "Updating inventory".

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { getProductsByType, shopifyConfigured, type ShopifyProduct } from "@/lib/shopify";
import { parseCsv } from "./csv";
import { CLARITIES, COLORS, CUTS, LABS, SHAPES, type Diamond, type Origin } from "./diamond-types";

// Re-export so server components can import everything from one place.
export * from "./diamond-types";

/** How often (seconds) to re-fetch the Google Sheet. Ignored for the local file. */
export const INVENTORY_REVALIDATE_SECONDS = 60;

const LOCAL_CSV = path.join(process.cwd(), "inventory", "diamonds.csv");

async function loadCsvText(): Promise<string> {
  const url = process.env.INVENTORY_URL;
  if (url) {
    const res = await fetch(url, { next: { revalidate: INVENTORY_REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`Inventory fetch failed: ${res.status} ${res.statusText}`);
    return res.text();
  }
  return readFile(LOCAL_CSV, "utf8");
}

/** Accepts "natural", "lab", "lab grown", "lab-grown", "lab created", "LG". Blank defaults to Natural. */
function toOrigin(value: string): Origin | undefined {
  const v = value.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
  if (v === "" || v === "natural" || v === "n" || v === "earth mined" || v === "mined") return "Natural";
  if (v.startsWith("lab") || v === "lg" || v === "cvd" || v === "hpht") return "Lab Grown";
  return undefined;
}

/** Case-insensitive match of a cell against an allowed list; returns the canonical value. */
function pick<T extends string>(value: string, options: readonly T[]): T | undefined {
  const v = value.trim().toLowerCase().replace(/\s+/g, " ");
  return options.find((o) => o.toLowerCase() === v);
}

function toBool(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v === "") return true; // blank means available
  return !["no", "n", "false", "0", "sold", "unavailable"].includes(v);
}

function toNumber(value: string): number | undefined {
  const n = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * Converts one row (CSV or Shopify) into a Diamond.
 * Only sku and price are required. Any other field that is blank is left out; a field that is filled in
 * but not recognized (e.g. shape "Rund") is also left out, with a warning so it can be fixed.
 */
function rowToDiamond(
  row: Record<string, string>,
): { diamond: Diamond; warnings: string[] } | { error: string } {
  const sku = (row.sku ?? "").trim();
  if (!sku) return { error: "missing sku" };
  const price = toNumber(row.price ?? "");
  if (!price) return { error: `${sku}: missing or invalid price "${row.price ?? ""}"` };

  const warnings: string[] = [];
  /** Returns the parsed value, or undefined (warning only if something was typed but not understood). */
  function optional<T>(field: string, parse: (v: string) => T | undefined, hint?: string): T | undefined {
    const raw = (row[field] ?? "").trim();
    if (!raw) return undefined;
    const value = parse(raw);
    if (value === undefined) warnings.push(`unrecognized ${field} "${raw}"${hint ? ` (${hint})` : ""}`);
    return value;
  }

  const rawOrigin = row.origin ?? row.type ?? "";
  const origin = toOrigin(rawOrigin);
  if (!origin) warnings.push(`unrecognized origin "${rawOrigin}" (use Natural or Lab Grown), showing as Natural`);

  return {
    warnings,
    diamond: {
      sku,
      price,
      title: row.title?.trim() || undefined,
      origin: origin ?? "Natural",
      shape: optional("shape", (v) => pick(v, SHAPES), SHAPES.join(", ")),
      carat: optional("carat", toNumber),
      cut: optional("cut", (v) => pick(v, CUTS), CUTS.join(", ")),
      color: optional("color", (v) => pick(v, COLORS), "D to K"),
      clarity: optional("clarity", (v) => pick(v, CLARITIES), CLARITIES.join(", ")),
      lab: optional("lab", (v) => pick(v, LABS), LABS.join(", ")),
      certificate: row.certificate?.trim() || undefined,
      measurements: row.measurements?.trim() || undefined,
      description: row.description?.trim() || undefined,
      images: (row.images ?? "")
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean),
      available: toBool(row.available ?? ""),
    },
  };
}

export function inventoryFromShopify(): boolean {
  return process.env.INVENTORY_SOURCE?.trim().toLowerCase() === "shopify" && shopifyConfigured();
}

/** Reads a metafield value. List-type metafields come back as JSON arrays; use the first entry. */
function metafieldText(value: string | undefined): string {
  if (!value) return "";
  if (value.startsWith("[")) {
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr) ? String(arr[0] ?? "") : value;
    } catch {
      return value;
    }
  }
  return value;
}

/** Turns a Shopify "Diamond" product into the same row shape the CSV uses, so both share validation. */
function shopifyProductToRow(p: ShopifyProduct): { row: Record<string, string>; variantId?: string } {
  const variant = p.variants.nodes[0];
  const meta: Record<string, string> = {};
  for (const m of p.metafields) if (m) meta[m.key] = metafieldText(m.value);
  return {
    variantId: variant?.id,
    row: {
      sku: variant?.sku?.trim() || p.handle,
      title: p.title,
      origin: meta.origin ?? "",
      shape: meta.shape ?? "",
      carat: meta.carat ?? "",
      cut: meta.cut ?? "",
      color: meta.color ?? "",
      clarity: meta.clarity ?? "",
      lab: meta.lab ?? "",
      certificate: meta.certificate ?? "",
      measurements: meta.measurements ?? "",
      price: variant?.price.amount ?? "",
      images: p.images.nodes.map((i) => i.url).join("|"),
      description: p.description,
      // Sold out in Shopify (inventory 0) hides the stone on the site.
      available: variant?.availableForSale ? "yes" : "no",
    },
  };
}

async function loadRows(): Promise<{ row: Record<string, string>; variantId?: string; label: string }[]> {
  if (inventoryFromShopify()) {
    const products = await getProductsByType("Diamond", INVENTORY_REVALIDATE_SECONDS);
    return products.map((p) => ({ ...shopifyProductToRow(p), label: `Shopify product "${p.handle}"` }));
  }
  const rows = parseCsv(await loadCsvText());
  return rows.map((row, i) => ({ row, label: `row ${i + 2}` }));
}

/** All diamonds, including sold ones. Cached per request. */
const loadAll = cache(async (): Promise<Diamond[]> => {
  const rows = await loadRows();
  const out: Diamond[] = [];
  const seen = new Set<string>();
  for (const { row, variantId, label } of rows) {
    const result = rowToDiamond(row);
    if ("error" in result) {
      console.warn(`[inventory] skipping ${label}: ${result.error}`);
      continue;
    }
    if (seen.has(result.diamond.sku)) {
      console.warn(`[inventory] skipping ${label}: duplicate sku ${result.diamond.sku}`);
      continue;
    }
    if (result.warnings.length) {
      console.warn(`[inventory] ${label} (${result.diamond.sku}): ${result.warnings.join("; ")}`);
    }
    seen.add(result.diamond.sku);
    out.push({ ...result.diamond, variantId });
  }
  return out;
});

/** Diamonds currently for sale. */
export async function getDiamonds(): Promise<Diamond[]> {
  return (await loadAll()).filter((d) => d.available);
}

/** A diamond currently for sale, by SKU. Sold stones return undefined (page 404s). */
export async function getDiamond(sku: string): Promise<Diamond | undefined> {
  return (await getDiamonds()).find((d) => d.sku === sku);
}


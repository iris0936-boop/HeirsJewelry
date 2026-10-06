// Diamond inventory. Loaded from a CSV: either a Google Sheet (when INVENTORY_URL is set)
// or the local file inventory/diamonds.csv. See README "Updating inventory".

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
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

/** Converts one CSV row into a Diamond, or returns a reason it was rejected. */
function rowToDiamond(row: Record<string, string>): { diamond: Diamond } | { error: string } {
  const sku = (row.sku ?? "").trim();
  if (!sku) return { error: "missing sku" };

  const origin = toOrigin(row.origin ?? row.type ?? "");
  const shape = pick(row.shape ?? "", SHAPES);
  const cut = pick(row.cut ?? "", CUTS);
  const color = pick(row.color ?? "", COLORS);
  const clarity = pick(row.clarity ?? "", CLARITIES);
  const lab = pick(row.lab ?? "", LABS);
  const carat = toNumber(row.carat ?? "");
  const price = toNumber(row.price ?? "");

  const problems: string[] = [];
  if (!origin) problems.push(`origin "${row.origin ?? row.type}" (use Natural or Lab Grown)`);
  if (!shape) problems.push(`shape "${row.shape}"`);
  if (!cut) problems.push(`cut "${row.cut}"`);
  if (!color) problems.push(`color "${row.color}"`);
  if (!clarity) problems.push(`clarity "${row.clarity}"`);
  if (!lab) problems.push(`lab "${row.lab}"`);
  if (!carat) problems.push(`carat "${row.carat}"`);
  if (!price) problems.push(`price "${row.price}"`);
  if (problems.length) return { error: `${sku}: invalid ${problems.join(", ")}` };

  return {
    diamond: {
      sku,
      origin: origin!,
      shape: shape!,
      cut: cut!,
      color: color!,
      clarity: clarity!,
      lab: lab!,
      carat: carat!,
      price: price!,
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

/** All diamonds in the sheet, including sold ones. Cached per request. */
const loadAll = cache(async (): Promise<Diamond[]> => {
  const text = await loadCsvText();
  const rows = parseCsv(text);
  const out: Diamond[] = [];
  const seen = new Set<string>();
  for (const [i, row] of rows.entries()) {
    const result = rowToDiamond(row);
    if ("error" in result) {
      console.warn(`[inventory] skipping row ${i + 2}: ${result.error}`);
      continue;
    }
    if (seen.has(result.diamond.sku)) {
      console.warn(`[inventory] skipping row ${i + 2}: duplicate sku ${result.diamond.sku}`);
      continue;
    }
    seen.add(result.diamond.sku);
    out.push(result.diamond);
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


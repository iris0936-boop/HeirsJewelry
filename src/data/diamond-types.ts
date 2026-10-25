// Types, allowed values, and formatting helpers. Safe to import from client components.

export const SHAPES = [
  "Round",
  "Oval",
  "Cushion",
  "Princess",
  "Emerald",
  "Pear",
  "Radiant",
  "Marquise",
  "Heart",
] as const;
export const CUTS = ["Ideal", "Excellent", "Very Good", "Good"] as const;
export const COLORS = ["D", "E", "F", "G", "H", "I", "J", "K"] as const;
export const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"] as const;
export const LABS = ["GIA", "IGI", "AGS"] as const;
export const ORIGINS = ["Natural", "Lab Grown"] as const;

export type Shape = (typeof SHAPES)[number];
export type Cut = (typeof CUTS)[number];
export type Color = (typeof COLORS)[number];
export type Clarity = (typeof CLARITIES)[number];
export type Lab = (typeof LABS)[number];
export type Origin = (typeof ORIGINS)[number];

// Only sku and price are required. Everything else may be missing; the site shows what it has.
export interface Diamond {
  sku: string;
  /** Fallback name when shape/carat are missing (Shopify product title, or CSV "title" column). */
  title?: string;
  origin: Origin; // blank counts as Natural
  shape?: Shape;
  carat?: number;
  cut?: Cut;
  color?: Color;
  clarity?: Clarity;
  price: number; // USD
  lab?: Lab;
  certificate?: string;
  measurements?: string; // e.g. "6.45 x 6.48 x 3.98 mm"
  images: string[]; // paths under /public or full URLs
  description?: string;
  available: boolean;
  /** Shopify variant ID. Present only when inventory comes from Shopify; required for online checkout. */
  variantId?: string;
}

/** Card/page title, e.g. "1.02 ct Round", "Round Diamond", "1.50 ct Diamond", or the product title. */
export function diamondName(d: Diamond): string {
  if (d.carat && d.shape) return `${d.carat.toFixed(2)} ct ${d.shape}`;
  if (d.shape) return `${d.shape} Diamond`;
  if (d.carat) return `${d.carat.toFixed(2)} ct Diamond`;
  return d.title?.trim() || "Diamond";
}

/** Short spec line from whatever grades are present, e.g. "Ideal · F · VS1 · GIA". */
export function diamondGrades(d: Diamond): string {
  return [d.cut, d.color, d.clarity, d.lab].filter(Boolean).join(" · ");
}

export function formatPrice(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

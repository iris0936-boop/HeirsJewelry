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
] as const;
export const CUTS = ["Ideal", "Excellent", "Very Good", "Good"] as const;
export const COLORS = ["D", "E", "F", "G", "H", "I", "J"] as const;
export const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"] as const;
export const LABS = ["GIA", "IGI", "AGS"] as const;

export type Shape = (typeof SHAPES)[number];
export type Cut = (typeof CUTS)[number];
export type Color = (typeof COLORS)[number];
export type Clarity = (typeof CLARITIES)[number];
export type Lab = (typeof LABS)[number];

export interface Diamond {
  sku: string;
  shape: Shape;
  carat: number;
  cut: Cut;
  color: Color;
  clarity: Clarity;
  price: number; // USD
  lab: Lab;
  certificate?: string;
  measurements?: string; // e.g. "6.45 x 6.48 x 3.98 mm"
  images: string[]; // paths under /public or full URLs
  description?: string;
  available: boolean;
}

export function formatPrice(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

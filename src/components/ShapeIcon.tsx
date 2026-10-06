import type { Shape } from "@/data/diamond-types";

// Simple outline icons for each diamond shape (viewBox 0 0 40 40).
const paths: Record<Shape, string> = {
  Round: "M20 4 a16 16 0 1 0 0.01 0 Z M20 4 L20 36 M4 20 L36 20 M8.7 8.7 L31.3 31.3 M31.3 8.7 L8.7 31.3",
  Oval: "M20 2 C27 2 30 11 30 20 C30 29 27 38 20 38 C13 38 10 29 10 20 C10 11 13 2 20 2 Z M20 2 L20 38 M10 20 L30 20",
  Cushion:
    "M12 6 H28 C32 6 34 8 34 12 V28 C34 32 32 34 28 34 H12 C8 34 6 32 6 28 V12 C6 8 8 6 12 6 Z M6 12 L34 28 M34 12 L6 28",
  Princess: "M6 6 H34 V34 H6 Z M6 6 L34 34 M34 6 L6 34 M20 6 L20 34 M6 20 L34 20",
  Emerald:
    "M11 5 H29 L35 11 V29 L29 35 H11 L5 29 V11 Z M13 9 H27 L31 13 V27 L27 31 H13 L9 27 V13 Z M15 13 H25 L27 15 V25 L25 27 H15 L13 25 V15 Z",
  Pear: "M20 4 C28 14 34 20 34 26 C34 32 28 36 20 36 C12 36 6 32 6 26 C6 20 12 14 20 4 Z M20 4 L20 36",
  Radiant:
    "M11 5 H29 L35 11 V29 L29 35 H11 L5 29 V11 Z M5 11 L35 29 M35 11 L5 29 M20 5 L20 35",
  Marquise: "M20 3 C30 12 32 18 32 20 C32 22 30 28 20 37 C10 28 8 22 8 20 C8 18 10 12 20 3 Z M20 3 L20 37",
  Heart:
    "M20 36 C8 27 4 21 4 14 C4 8 8 5 12.5 5 C16 5 18.5 7 20 10 C21.5 7 24 5 27.5 5 C32 5 36 8 36 14 C36 21 32 27 20 36 Z M20 10 L20 36 M20 10 L8 20 M20 10 L32 20",
};

export function ShapeIcon({ shape, className = "h-8 w-8" }: { shape: Shape; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
      <path d={paths[shape]} strokeLinejoin="round" />
    </svg>
  );
}

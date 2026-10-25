/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { type Diamond, diamondGrades, diamondName, formatPrice } from "@/data/diamond-types";
import { ShapeIcon } from "./ShapeIcon";

/** Shows the first image, or a soft placeholder with the shape icon when no photo exists yet. */
export function DiamondImage({ diamond, className = "" }: { diamond: Diamond; className?: string }) {
  if (diamond.images[0]) {
    return (
      <img
        src={diamond.images[0]}
        alt={diamondName(diamond)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200 text-stone-400 ${className}`}
    >
      <ShapeIcon shape={diamond.shape ?? "Round"} className="h-1/2 w-1/2" />
    </div>
  );
}

export function DiamondCard({ diamond, query = "" }: { diamond: Diamond; query?: string }) {
  return (
    <Link
      href={`/diamonds/${diamond.sku}${query}`}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden">
        <DiamondImage diamond={diamond} className="transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="font-medium text-stone-900">{diamondName(diamond)}</p>
        {diamondGrades(diamond) && <p className="mt-1 text-sm text-stone-500">{diamondGrades(diamond)}</p>}
        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wider ${
            diamond.origin === "Lab Grown" ? "bg-accent text-stone-900" : "bg-stone-100 text-stone-600"
          }`}
        >
          {diamond.origin}
        </span>
        <p className="mt-3 text-lg font-semibold text-stone-900">{formatPrice(diamond.price)}</p>
      </div>
    </Link>
  );
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Design } from "@/data/designs";
import { formatPrice } from "@/data/diamond-types";

export function DesignImage({ design, className = "" }: { design: Design; className?: string }) {
  if (design.images[0]) {
    return <img src={design.images[0]} alt={design.name} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-stone-200 font-serif text-stone-400 ${className}`}
    >
      {design.name}
    </div>
  );
}

export function DesignCard({ design }: { design: Design }) {
  return (
    <Link
      href={`/designs/${design.slug}`}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-[4/5] overflow-hidden">
        <DesignImage design={design} className="transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wider text-stone-500">{design.category}</p>
        <p className="mt-1 font-medium text-stone-900">{design.name}</p>
        <p className="mt-1 text-sm text-stone-500">
          {design.metal}
          {design.startingPrice ? ` · from ${formatPrice(design.startingPrice)}` : ""}
        </p>
      </div>
    </Link>
  );
}

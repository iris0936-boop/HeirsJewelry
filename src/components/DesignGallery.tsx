"use client";

import { useState } from "react";
import { DESIGN_CATEGORIES, type Design, type DesignCategory } from "@/data/designs";
import { DesignCard } from "./DesignCard";

export function DesignGallery({ designs }: { designs: Design[] }) {
  const [category, setCategory] = useState<DesignCategory | "All">("All");
  const shown = category === "All" ? designs : designs.filter((d) => d.category === category);

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {(["All", ...DESIGN_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              category === c
                ? "border-accent bg-accent text-stone-900"
                : "border-stone-200 text-stone-600 hover:border-stone-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((d) => (
          <DesignCard key={d.slug} design={d} />
        ))}
      </div>
    </>
  );
}

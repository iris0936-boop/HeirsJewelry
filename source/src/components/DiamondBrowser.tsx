"use client";

import { useMemo, useState } from "react";
import {
  CLARITIES,
  COLORS,
  CUTS,
  SHAPES,
  type Clarity,
  type Color,
  type Cut,
  type Diamond,
  type Shape,
  formatPrice,
} from "@/data/diamond-types";
import { DiamondCard } from "./DiamondCard";
import { ShapeIcon } from "./ShapeIcon";

type SortKey = "price-asc" | "price-desc" | "carat-asc" | "carat-desc";

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function DiamondBrowser({
  diamonds,
  initialShapes = [],
}: {
  diamonds: Diamond[];
  initialShapes?: Shape[];
}) {
  const caratBounds = useMemo(() => {
    const c = diamonds.map((d) => d.carat);
    return [Math.floor(Math.min(...c) * 10) / 10, Math.ceil(Math.max(...c) * 10) / 10] as const;
  }, [diamonds]);
  const priceBounds = useMemo(() => {
    const p = diamonds.map((d) => d.price);
    return [Math.floor(Math.min(...p) / 500) * 500, Math.ceil(Math.max(...p) / 500) * 500] as const;
  }, [diamonds]);

  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [cuts, setCuts] = useState<Cut[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [clarities, setClarities] = useState<Clarity[]>([]);
  const [caratMin, setCaratMin] = useState(caratBounds[0]);
  const [caratMax, setCaratMax] = useState(caratBounds[1]);
  const [priceMin, setPriceMin] = useState(priceBounds[0]);
  const [priceMax, setPriceMax] = useState(priceBounds[1]);
  const [sort, setSort] = useState<SortKey>("price-asc");

  const results = useMemo(() => {
    const list = diamonds.filter(
      (d) =>
        (shapes.length === 0 || shapes.includes(d.shape)) &&
        (cuts.length === 0 || cuts.includes(d.cut)) &&
        (colors.length === 0 || colors.includes(d.color)) &&
        (clarities.length === 0 || clarities.includes(d.clarity)) &&
        d.carat >= caratMin &&
        d.carat <= caratMax &&
        d.price >= priceMin &&
        d.price <= priceMax,
    );
    const by: Record<SortKey, (a: Diamond, b: Diamond) => number> = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "carat-asc": (a, b) => a.carat - b.carat,
      "carat-desc": (a, b) => b.carat - a.carat,
    };
    return list.sort(by[sort]);
  }, [diamonds, shapes, cuts, colors, clarities, caratMin, caratMax, priceMin, priceMax, sort]);

  const reset = () => {
    setShapes([]);
    setCuts([]);
    setColors([]);
    setClarities([]);
    setCaratMin(caratBounds[0]);
    setCaratMax(caratBounds[1]);
    setPriceMin(priceBounds[0]);
    setPriceMax(priceBounds[1]);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {/* Filters */}
      <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">Filters</h2>
          <button onClick={reset} className="text-sm text-stone-500 underline-offset-2 hover:underline">
            Reset
          </button>
        </div>

        <Section title="Shape">
          <div className="grid grid-cols-4 gap-2">
            {SHAPES.map((s) => {
              const on = shapes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => setShapes(toggle(shapes, s))}
                  title={s}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] transition ${
                    on
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  <ShapeIcon shape={s} className="h-7 w-7" />
                  {s}
                </button>
              );
            })}
          </div>
        </Section>

        <RangeSection
          title="Carat"
          min={caratBounds[0]}
          max={caratBounds[1]}
          step={0.1}
          lo={caratMin}
          hi={caratMax}
          onLo={setCaratMin}
          onHi={setCaratMax}
          format={(v) => v.toFixed(1)}
        />

        <RangeSection
          title="Price"
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={500}
          lo={priceMin}
          hi={priceMax}
          onLo={setPriceMin}
          onHi={setPriceMax}
          format={formatPrice}
        />

        <ChipSection title="Cut" options={CUTS} selected={cuts} onToggle={(v) => setCuts(toggle(cuts, v))} />
        <ChipSection title="Color" options={COLORS} selected={colors} onToggle={(v) => setColors(toggle(colors, v))} />
        <ChipSection
          title="Clarity"
          options={CLARITIES}
          selected={clarities}
          onToggle={(v) => setClarities(toggle(clarities, v))}
        />
      </aside>

      {/* Results */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-stone-500">
            {results.length} diamond{results.length === 1 ? "" : "s"}
          </p>
          <label className="flex items-center gap-2 text-sm text-stone-600">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm"
            >
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="carat-asc">Carat: low to high</option>
              <option value="carat-desc">Carat: high to low</option>
            </select>
          </label>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 p-16 text-center text-stone-500">
            No diamonds match those filters.{" "}
            <button onClick={reset} className="underline">
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((d) => (
              <DiamondCard key={d.sku} diamond={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-stone-900">{title}</h3>
      {children}
    </div>
  );
}

function ChipSection<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly T[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              onClick={() => onToggle(o)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                on ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-400"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function RangeSection({
  title,
  min,
  max,
  step,
  lo,
  hi,
  onLo,
  onHi,
  format,
}: {
  title: string;
  min: number;
  max: number;
  step: number;
  lo: number;
  hi: number;
  onLo: (v: number) => void;
  onHi: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <Section title={title}>
      <div className="mb-2 flex justify-between text-xs text-stone-600">
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onLo(Math.min(Number(e.target.value), hi))}
          className="w-full accent-stone-900"
          aria-label={`${title} minimum`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onHi(Math.max(Number(e.target.value), lo))}
          className="w-full accent-stone-900"
          aria-label={`${title} maximum`}
        />
      </div>
    </Section>
  );
}

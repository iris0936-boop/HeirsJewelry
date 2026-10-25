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
  type Origin,
  ORIGINS,
  type Shape,
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
  cardQuery = "",
}: {
  diamonds: Diamond[];
  initialShapes?: Shape[];
  /** Appended to each card link, e.g. "?setting=pave-halo&metal=Platinum" while building a ring. */
  cardQuery?: string;
}) {
  // Carat is optional; bounds come only from stones that have it. No carats at all hides the slider.
  const caratBounds = useMemo(() => {
    const c = diamonds.map((d) => d.carat).filter((x): x is number => x !== undefined);
    if (c.length === 0) return [0, 0] as const;
    return [Math.floor(Math.min(...c) * 10) / 10, Math.ceil(Math.max(...c) * 10) / 10] as const;
  }, [diamonds]);
  const hasCarat = caratBounds[1] > 0;
  const priceBounds = useMemo(() => {
    const p = diamonds.map((d) => d.price);
    if (p.length === 0) return [0, 0] as const;
    return [Math.floor(Math.min(...p) / 500) * 500, Math.ceil(Math.max(...p) / 500) * 500] as const;
  }, [diamonds]);

  const [origin, setOrigin] = useState<Origin | "All">("All");
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
    // A stone missing a field still shows until the shopper filters on that field.
    const matches = <T,>(selected: T[], value: T | undefined) =>
      selected.length === 0 || (value !== undefined && selected.includes(value));
    const caratNarrowed = caratMin > caratBounds[0] || caratMax < caratBounds[1];

    const list = diamonds.filter(
      (d) =>
        (origin === "All" || d.origin === origin) &&
        matches(shapes, d.shape) &&
        matches(cuts, d.cut) &&
        matches(colors, d.color) &&
        matches(clarities, d.clarity) &&
        (!caratNarrowed || (d.carat !== undefined && d.carat >= caratMin && d.carat <= caratMax)) &&
        d.price >= priceMin &&
        d.price <= priceMax,
    );
    // Unknown carat sorts last in both directions.
    const byCarat = (dir: 1 | -1) => (a: Diamond, b: Diamond) => {
      if (a.carat === undefined) return b.carat === undefined ? 0 : 1;
      if (b.carat === undefined) return -1;
      return (a.carat - b.carat) * dir;
    };
    const by: Record<SortKey, (a: Diamond, b: Diamond) => number> = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "carat-asc": byCarat(1),
      "carat-desc": byCarat(-1),
    };
    return list.sort(by[sort]);
  }, [diamonds, origin, shapes, cuts, colors, clarities, caratMin, caratMax, caratBounds, priceMin, priceMax, sort]);

  const reset = () => {
    setOrigin("All");
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

        <Section title="Origin">
          <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-stone-200 text-xs">
            {(["All", ...ORIGINS] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOrigin(o)}
                className={`py-2 transition ${
                  origin === o ? "bg-accent font-medium text-stone-900" : "text-stone-600 hover:bg-accent-soft"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Shape">
          <div className="grid grid-cols-3 gap-2">
            {SHAPES.map((s) => {
              const on = shapes.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => setShapes(toggle(shapes, s))}
                  title={s}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] transition ${
                    on
                      ? "border-accent bg-accent text-stone-900"
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

        {hasCarat && (
        <RangeSection
          title="Carat"
          min={caratBounds[0]}
          max={caratBounds[1]}
          step={0.1}
          lo={caratMin}
          hi={caratMax}
          onLo={setCaratMin}
          onHi={setCaratMax}
          suffix="ct"
          decimals={2}
        />
        )}

        {priceBounds[1] > 0 && (
        <RangeSection
          title="Price"
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={500}
          lo={priceMin}
          hi={priceMax}
          onLo={setPriceMin}
          onHi={setPriceMax}
          prefix="$"
        />
        )}

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
              <DiamondCard key={d.sku} diamond={d} query={cardQuery} />
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
                on ? "border-accent bg-accent text-stone-900" : "border-stone-200 text-stone-600 hover:border-stone-400"
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

/** One slider track with two handles, plus editable Min / Max boxes. */
function RangeSection({
  title,
  min,
  max,
  step,
  lo,
  hi,
  onLo,
  onHi,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  title: string;
  min: number;
  max: number;
  step: number;
  lo: number;
  hi: number;
  onLo: (v: number) => void;
  onHi: (v: number) => void;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const span = max - min || 1;
  const left = ((lo - min) / span) * 100;
  const right = ((hi - min) / span) * 100;

  return (
    <Section title={title}>
      <div className="dual-range">
        {/* Track and the highlighted segment between the two handles */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-stone-200" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent-hover"
          style={{ left: `${left}%`, width: `${right - left}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onLo(Math.min(Number(e.target.value), hi))}
          aria-label={`${title} minimum slider`}
          // Keep the low handle on top when both are pushed to the right edge, so it can still be dragged.
          style={{ zIndex: lo >= max - step ? 2 : 1 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onHi(Math.max(Number(e.target.value), lo))}
          aria-label={`${title} maximum slider`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <NumberBox
          label="Min"
          ariaLabel={`${title} minimum`}
          value={lo}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          onCommit={(v) => onLo(Math.min(Math.max(v, min), hi))}
        />
        <NumberBox
          label="Max"
          ariaLabel={`${title} maximum`}
          value={hi}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          onCommit={(v) => onHi(Math.max(Math.min(v, max), lo))}
        />
      </div>
    </Section>
  );
}

/** Text box that lets the shopper type freely and applies the value on Enter or when they leave the box. */
function NumberBox({
  label,
  ariaLabel,
  value,
  prefix,
  suffix,
  decimals,
  onCommit,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
  onCommit: (v: number) => void;
}) {
  const shown = value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const n = Number(draft.replace(/[$,\s]/g, ""));
    if (Number.isFinite(n) && draft.trim() !== "") onCommit(n);
    setDraft(null);
  };

  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-stone-500">{label}</span>
      <span className="mt-1 flex items-center rounded-lg border border-stone-200 px-2 py-1.5 text-sm focus-within:border-stone-900">
        {prefix && <span className="text-stone-400">{prefix}</span>}
        <input
          inputMode="decimal"
          value={draft ?? shown}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="w-full min-w-0 bg-transparent text-stone-900 outline-none"
          aria-label={ariaLabel}
        />
        {suffix && <span className="text-stone-400">{suffix}</span>}
      </span>
    </label>
  );
}

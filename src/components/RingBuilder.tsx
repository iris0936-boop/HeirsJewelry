/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatPrice, type Diamond } from "@/data/diamond-types";
import { lowestPrice, type Setting } from "@/data/settings";
import { builderHref } from "@/lib/builder-href";
import { DiamondImage } from "./DiamondCard";

export { builderHref };

/** The three-step progress bar shown at the top of every ring-builder page. */
export function BuilderSteps({
  diamond,
  setting,
  metal,
  current,
}: {
  diamond?: Diamond;
  setting?: Setting;
  metal?: string;
  current: "diamond" | "setting" | "review";
}) {
  const settingPrice = setting?.options.find((o) => o.metal === metal)?.price;
  const steps = [
    {
      key: "diamond",
      label: "1. Diamond",
      value: diamond ? `${diamond.carat.toFixed(2)} ct ${diamond.shape} · ${formatPrice(diamond.price)}` : "Choose a diamond",
      href: builderHref("/diamonds", { setting: setting?.slug, metal }),
    },
    {
      key: "setting",
      label: "2. Setting",
      value: setting
        ? `${setting.name}${metal ? ` · ${metal}` : ""}${settingPrice ? ` · ${formatPrice(settingPrice)}` : ""}`
        : "Choose a setting",
      href: builderHref("/ring-builder/settings", { diamond: diamond?.sku }),
    },
    {
      key: "review",
      label: "3. Review",
      value: diamond && setting && metal ? "Ring size & checkout" : "Complete steps 1 and 2",
      href: diamond && setting && metal ? builderHref("/ring-builder/review", { diamond: diamond.sku, setting: setting.slug, metal }) : undefined,
    },
  ] as const;

  return (
    <ol className="mb-10 grid overflow-hidden rounded-2xl border border-stone-200 sm:grid-cols-3">
      {steps.map((s) => {
        const active = s.key === current;
        const body = (
          <>
            <p className={`text-xs uppercase tracking-wider ${active ? "text-stone-700" : "text-stone-500"}`}>
              {s.label}
            </p>
            <p className={`mt-1 truncate text-sm text-stone-900`}>{s.value}</p>
          </>
        );
        const cls = `block px-5 py-4 border-b border-stone-200 sm:border-b-0 sm:border-r last:border-0 ${
          active ? "bg-accent" : "bg-white hover:bg-accent-soft"
        }`;
        return (
          <li key={s.key}>
            {s.href && !active ? (
              <Link href={s.href} className={cls}>
                {body}
              </Link>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function SettingImage({ setting, className = "" }: { setting: Setting; className?: string }) {
  if (setting.images[0]) {
    return <img src={setting.images[0]} alt={setting.name} className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-stone-200 font-serif text-stone-400 ${className}`}
    >
      {setting.name}
    </div>
  );
}

export function SettingCard({ setting, href }: { setting: Setting; href: string }) {
  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden">
        <SettingImage setting={setting} className="transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="font-medium text-stone-900">{setting.name}</p>
        <p className="mt-1 text-sm text-stone-500">
          {setting.options.filter((o) => o.available).length} metals · from {formatPrice(lowestPrice(setting))}
        </p>
      </div>
    </Link>
  );
}

/** Small summary of the chosen diamond, used on setting and review pages. */
export function DiamondSummary({ diamond }: { diamond: Diamond }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-200">
        <DiamondImage diamond={diamond} />
      </div>
      <div>
        <p className="font-medium text-stone-900">
          {diamond.carat.toFixed(2)} ct {diamond.shape} Diamond
        </p>
        <p className="text-sm text-stone-500">
          {diamond.origin} · {diamond.cut} · {diamond.color} · {diamond.clarity} · {diamond.lab}
        </p>
        <p className="text-sm text-stone-500">SKU {diamond.sku}</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { DiamondImage } from "@/components/DiamondCard";
import { Suspense } from "react";
import { ChooseDiamondButton } from "@/components/ChooseDiamondButton";
import { builderHref, SettingCard } from "@/components/RingBuilder";
import { diamondName, formatPrice, getDiamond, getDiamonds } from "@/data/diamonds";
import { getSettings } from "@/data/settings";

// Re-check inventory every 60s (keep in sync with INVENTORY_REVALIDATE_SECONDS).
export const revalidate = 60;
// SKUs added to the sheet after deploy are rendered on first request.
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getDiamonds()).map((d) => ({ sku: d.sku }));
}

export default async function DiamondPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const diamond = await getDiamond(sku);
  if (!diamond) notFound();

  // Only list the details this stone actually has.
  const specs = (
    [
      ["Origin", diamond.origin],
      ["Shape", diamond.shape],
      ["Carat", diamond.carat?.toFixed(2)],
      ["Cut", diamond.cut],
      ["Color", diamond.color],
      ["Clarity", diamond.clarity],
      ["Lab", diamond.lab],
      ["Measurements", diamond.measurements],
      ["Certificate", diamond.certificate],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => Boolean(row[1]));

  const heading =
    diamond.carat && diamond.shape
      ? `${diamond.carat.toFixed(2)} Carat ${diamond.shape} Diamond`
      : diamondName(diamond);
  const subtitle = [
    diamond.origin,
    diamond.cut && `${diamond.cut} cut`,
    diamond.color && `${diamond.color} color`,
    diamond.clarity && `${diamond.clarity} clarity`,
  ]
    .filter(Boolean)
    .join(" · ");

  const settings = (await getSettings()).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link href="/diamonds" className="text-sm text-stone-500 hover:text-stone-900">
        ← All diamonds
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl border border-stone-200">
          <DiamondImage diamond={diamond} />
        </div>

        <div>
          <p className="text-sm uppercase tracking-wider text-stone-500">
            {diamond.sku} · {diamond.origin}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-stone-900">{heading}</h1>
          <p className="mt-2 text-lg text-stone-600">{subtitle}</p>
          <p className="mt-6 text-3xl font-semibold text-stone-900">{formatPrice(diamond.price)}</p>

          {diamond.description && <p className="mt-6 text-stone-600">{diamond.description}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            {/* Reads ?setting=&metal= on the client so this page can stay statically cached. */}
            <Suspense
              fallback={
                <Link href={builderHref("/ring-builder/settings", { diamond: diamond.sku })} className="btn-accent">
                  Choose this diamond
                </Link>
              }
            >
              <ChooseDiamondButton sku={diamond.sku} />
            </Suspense>
            <Link href={`/custom?sku=${diamond.sku}`} className="btn-outline">
              Ask about this stone
            </Link>
          </div>

          <dl className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
            {specs.map(([k, v]) => (
              <div key={k} className="flex justify-between py-3 text-sm">
                <dt className="text-stone-500">{k}</dt>
                <dd className="font-medium text-stone-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-serif text-3xl text-stone-900">Settings for this stone</h2>
        <p className="mt-2 text-stone-600">
          Every setting fits {diamond.shape ? `a ${diamond.shape.toLowerCase()}` : "this"} center stone.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {settings.map((s) => (
            <SettingCard
              key={s.slug}
              setting={s}
              href={builderHref(`/ring-builder/settings/${s.slug}`, { diamond: diamond.sku })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

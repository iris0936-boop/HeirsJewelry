import Link from "next/link";
import { notFound } from "next/navigation";
import { DesignImage } from "@/components/DesignCard";
import { DiamondCard } from "@/components/DiamondCard";
import { designs, getDesign } from "@/data/designs";
import { formatPrice, getDiamonds } from "@/data/diamonds";

// Re-check inventory every 60s (keep in sync with INVENTORY_REVALIDATE_SECONDS).
export const revalidate = 60;

export function generateStaticParams() {
  return designs.map((d) => ({ slug: d.slug }));
}

export default async function DesignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const design = getDesign(slug);
  if (!design) notFound();

  const stones = (await getDiamonds()).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Link href="/designs" className="text-sm text-stone-500 hover:text-stone-900">
        ← All designs
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-3xl border border-stone-200">
          <DesignImage design={design} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wider text-stone-500">{design.category}</p>
          <h1 className="mt-2 font-serif text-4xl text-stone-900">{design.name}</h1>
          <p className="mt-2 text-lg text-stone-600">{design.metal}</p>
          {design.startingPrice && (
            <p className="mt-6 text-stone-900">
              <span className="text-3xl font-semibold">{formatPrice(design.startingPrice)}</span>
              <span className="ml-2 text-sm text-stone-500">setting, before center stone</span>
            </p>
          )}
          <p className="mt-6 text-stone-600">{design.description}</p>
          <div className="mt-8">
            <Link
              href={`/custom?design=${design.slug}`}
              className="rounded-full bg-stone-900 px-6 py-3 text-white hover:bg-stone-700"
            >
              Start with this design
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-serif text-3xl text-stone-900">Pair it with a stone</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {stones.map((d) => (
            <DiamondCard key={d.sku} diamond={d} />
          ))}
        </div>
      </section>
    </div>
  );
}

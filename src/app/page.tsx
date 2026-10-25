import Link from "next/link";
import { getDiamonds, SHAPES } from "@/data/diamonds";
import { designs } from "@/data/designs";
import { DiamondCard } from "@/components/DiamondCard";
import { ShapeIcon } from "@/components/ShapeIcon";
import { DesignCard } from "@/components/DesignCard";

// Re-check inventory every 60s (keep in sync with INVENTORY_REVALIDATE_SECONDS).
export const revalidate = 60;

export default async function Home() {
  const featured = (await getDiamonds()).slice(0, 3);
  const featuredDesigns = designs.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="bg-accent-soft">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Certified diamonds · Custom design</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-5xl leading-tight text-stone-900 sm:text-6xl">
            Find your diamond. Design the piece around it.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
            Every stone in our collection is hand-selected and certified. Pick the one you love, then work with us
            to create a setting that is entirely yours.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/ring-builder" className="btn-accent">
              Build your ring
            </Link>
            <Link
              href="/designs"
              className="rounded-full border border-stone-300 px-6 py-3 text-stone-900 hover:border-stone-900"
            >
              See our designs
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by shape */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-serif text-3xl text-stone-900">Shop by shape</h2>
        <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-9">
          {SHAPES.map((s) => (
            <Link
              key={s}
              href={`/diamonds?shape=${s}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 p-4 text-sm text-stone-600 transition hover:border-accent hover:bg-accent-soft hover:text-stone-900"
            >
              <ShapeIcon shape={s} className="h-10 w-10" />
              {s}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured diamonds */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl text-stone-900">Featured diamonds</h2>
            <p className="mt-2 text-stone-600">A few of our current favorites.</p>
          </div>
          <Link href="/diamonds" className="text-sm text-stone-600 underline-offset-4 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {featured.map((d) => (
            <DiamondCard key={d.sku} diamond={d} />
          ))}
        </div>
      </section>

      {/* Designs */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl text-stone-900">Designs we can create</h2>
            <p className="mt-2 text-stone-600">Starting points. Every piece is made to order.</p>
          </div>
          <Link href="/designs" className="text-sm text-stone-600 underline-offset-4 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredDesigns.map((d) => (
            <DesignCard key={d.slug} design={d} />
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mt-12 bg-stone-900 text-stone-100">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 className="text-center font-serif text-3xl">How custom works</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              ["1. Choose a stone", "Browse our inventory or tell us what you are looking for and we will source it."],
              ["2. Design together", "Start from one of our designs or a sketch. We refine it with you and produce a 3D render."],
              ["3. We craft it", "Your piece is made by hand and delivered in 3 to 5 weeks."],
            ].map(([t, d]) => (
              <div key={t}>
                <p className="font-serif text-xl">{t}</p>
                <p className="mt-3 text-stone-300">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/custom" className="btn-accent">
              Start a custom piece
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

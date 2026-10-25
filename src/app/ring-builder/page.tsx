import Link from "next/link";

export const metadata = { title: "Ring Builder | Heirs Jewelry" };

export default function RingBuilderStart() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-serif text-5xl text-stone-900">Build your ring</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-stone-600">
        Pick a certified diamond and a setting, choose your metal and ring size, and check out. Start with whichever
        you love first.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link
          href="/diamonds"
          className="rounded-3xl border border-stone-200 p-10 transition hover:border-accent hover:shadow-lg"
        >
          <p className="font-serif text-2xl text-stone-900">Start with a diamond</p>
          <p className="mt-2 text-stone-600">Browse our certified natural and lab-grown stones.</p>
        </Link>
        <Link
          href="/ring-builder/settings"
          className="rounded-3xl border border-stone-200 p-10 transition hover:border-accent hover:shadow-lg"
        >
          <p className="font-serif text-2xl text-stone-900">Start with a setting</p>
          <p className="mt-2 text-stone-600">Choose a design and metal, then find the stone for it.</p>
        </Link>
      </div>
    </div>
  );
}

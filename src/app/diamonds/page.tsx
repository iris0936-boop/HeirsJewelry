import { DiamondBrowser } from "@/components/DiamondBrowser";
import { getDiamonds, SHAPES, type Shape } from "@/data/diamonds";

export const metadata = { title: "Diamonds | YOUR NAME Fine Jewelry" };

export default async function DiamondsPage({
  searchParams,
}: {
  searchParams: Promise<{ shape?: string }>;
}) {
  const { shape } = await searchParams;
  const initialShapes = SHAPES.includes(shape as Shape) ? [shape as Shape] : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-stone-900">Diamonds</h1>
        <p className="mt-2 text-stone-600">
          Every stone is in our hands and independently certified. Prices are for the loose stone.
        </p>
      </div>
      <DiamondBrowser diamonds={await getDiamonds()} initialShapes={initialShapes} />
    </div>
  );
}

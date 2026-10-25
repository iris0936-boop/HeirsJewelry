import { DiamondBrowser } from "@/components/DiamondBrowser";
import { BuilderSteps, builderHref } from "@/components/RingBuilder";
import { getDiamonds, SHAPES, type Shape } from "@/data/diamonds";
import { getSetting } from "@/data/settings";

export const metadata = { title: "Diamonds | Heir’s Jewelry" };

export default async function DiamondsPage({
  searchParams,
}: {
  searchParams: Promise<{ shape?: string; setting?: string; metal?: string }>;
}) {
  const { shape, setting: slug, metal } = await searchParams;
  const initialShapes = SHAPES.includes(shape as Shape) ? [shape as Shape] : [];

  // If the shopper already picked a setting, keep it while they choose a stone.
  const setting = slug ? await getSetting(slug) : undefined;
  const option = setting?.options.find((o) => o.metal === metal);
  const cardQuery = setting && option ? builderHref("", { setting: setting.slug, metal: option.metal }) : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {setting && option && <BuilderSteps setting={setting} metal={option.metal} current="diamond" />}
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-stone-900">
          {setting && option ? "Choose a diamond" : "Diamonds"}
        </h1>
        <p className="mt-2 text-stone-600">
          {setting && option
            ? `Pick the center stone for your ${setting.name} in ${option.metal}.`
            : "Every stone is in our hands and independently certified. Prices are for the loose stone."}
        </p>
      </div>
      <DiamondBrowser diamonds={await getDiamonds()} initialShapes={initialShapes} cardQuery={cardQuery} />
    </div>
  );
}

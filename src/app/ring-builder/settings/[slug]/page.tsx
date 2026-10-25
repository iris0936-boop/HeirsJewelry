import Link from "next/link";
import { notFound } from "next/navigation";
import { BuilderSteps, DiamondSummary, SettingImage } from "@/components/RingBuilder";
import { formatPrice } from "@/data/diamond-types";
import { getDiamond } from "@/data/diamonds";
import { getSetting } from "@/data/settings";

export default async function SettingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ diamond?: string; metal?: string }>;
}) {
  const [{ slug }, { diamond: sku, metal }] = await Promise.all([params, searchParams]);
  const [setting, diamond] = await Promise.all([getSetting(slug), sku ? getDiamond(sku) : undefined]);
  if (!setting) notFound();

  const options = setting.options;
  const selected = options.find((o) => o.metal === metal) ?? options[0];

  // With a diamond chosen, go straight to review. Without one, go pick a diamond (carrying the setting along).
  const nextAction = diamond ? "/ring-builder/review" : "/diamonds";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <BuilderSteps diamond={diamond} setting={setting} metal={selected.metal} current="setting" />

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl border border-stone-200">
          <SettingImage setting={setting} />
        </div>

        <div>
          <Link
            href={diamond ? `/ring-builder/settings?diamond=${diamond.sku}` : "/ring-builder/settings"}
            className="text-sm text-stone-500 hover:text-stone-900"
          >
            ← All settings
          </Link>
          <h1 className="mt-4 font-serif text-4xl text-stone-900">{setting.name}</h1>
          {setting.description && <p className="mt-4 text-stone-600">{setting.description}</p>}

          <form action={nextAction} method="get" className="mt-8 space-y-8">
            {diamond && <input type="hidden" name="diamond" value={diamond.sku} />}
            <input type="hidden" name="setting" value={setting.slug} />

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-stone-900">Metal</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {options.map((o) => (
                  <label
                    key={o.metal}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-200 px-4 py-3 text-sm transition has-[:checked]:border-accent-hover has-[:checked]:bg-accent-soft"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="metal"
                        value={o.metal}
                        defaultChecked={o.metal === selected.metal}
                        className="accent-stone-900"
                      />
                      {o.metal}
                    </span>
                    <span className="font-medium text-stone-900">{formatPrice(o.price)}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone-500">Setting price only. The center diamond is priced separately.</p>
            </fieldset>

            {diamond && (
              <div className="rounded-2xl border border-stone-200 p-4">
                <p className="mb-3 text-xs uppercase tracking-wider text-stone-500">Your diamond</p>
                <DiamondSummary diamond={diamond} />
              </div>
            )}

            <button type="submit" className="btn-accent w-full sm:w-auto">
              {diamond ? "Review your ring" : "Choose a diamond for this setting"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

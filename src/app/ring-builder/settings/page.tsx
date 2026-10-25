import { BuilderSteps, builderHref, DiamondSummary, SettingCard } from "@/components/RingBuilder";
import { getDiamond } from "@/data/diamonds";
import { getSettings } from "@/data/settings";

export const metadata = { title: "Choose a Setting | Heir’s Jewelry" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ diamond?: string }> }) {
  const { diamond: sku } = await searchParams;
  const [diamond, settings] = await Promise.all([sku ? getDiamond(sku) : undefined, getSettings()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <BuilderSteps diamond={diamond} current="setting" />

      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-stone-900">Choose a setting</h1>
          <p className="mt-2 text-stone-600">Every setting is made to fit any diamond shape.</p>
        </div>
        {diamond && (
          <div className="rounded-2xl border border-stone-200 p-4">
            <DiamondSummary diamond={diamond} />
          </div>
        )}
      </div>

      {sku && !diamond && (
        <p className="mb-8 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          That diamond is no longer available. Choose a setting and we&apos;ll help you pick another stone.
        </p>
      )}

      {settings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 p-16 text-center text-stone-500">
          No settings are available right now.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {settings.map((s) => (
            <SettingCard
              key={s.slug}
              setting={s}
              href={builderHref(`/ring-builder/settings/${s.slug}`, { diamond: diamond?.sku })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

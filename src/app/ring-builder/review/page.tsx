import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { BuilderSteps, builderHref, DiamondSummary, SettingImage } from "@/components/RingBuilder";
import { formatPrice } from "@/data/diamond-types";
import { getDiamond } from "@/data/diamonds";
import { getSetting, RING_SIZES } from "@/data/settings";
import { shopifyConfigured } from "@/lib/shopify";

export const metadata = { title: "Review Your Ring | Heir’s Jewelry" };

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ diamond?: string; setting?: string; metal?: string }>;
}) {
  const { diamond: sku, setting: slug, metal } = await searchParams;
  const [diamond, setting] = await Promise.all([
    sku ? getDiamond(sku) : undefined,
    slug ? getSetting(slug) : undefined,
  ]);
  const option = setting?.options.find((o) => o.metal === metal && o.available);

  if (!diamond || !setting || !option) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <BuilderSteps diamond={diamond} setting={setting} metal={option?.metal} current="review" />
        <h1 className="font-serif text-3xl text-stone-900">Your ring isn&apos;t complete yet</h1>
        <p className="mt-3 text-stone-600">
          {sku && !diamond
            ? "The diamond you picked is no longer available."
            : slug && !option
              ? "That setting or metal is no longer available."
              : "Choose a diamond and a setting to continue."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href={builderHref("/diamonds", { setting: setting?.slug, metal: option?.metal })} className="btn-accent">
            Choose a diamond
          </Link>
          <Link href={builderHref("/ring-builder/settings", { diamond: diamond?.sku })} className="btn-outline">
            Choose a setting
          </Link>
        </div>
      </div>
    );
  }

  const total = diamond.price + option.price;
  const canCheckout = shopifyConfigured() && Boolean(diamond.variantId && option.variantId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <BuilderSteps diamond={diamond} setting={setting} metal={option.metal} current="review" />

      <h1 className="mb-10 font-serif text-4xl text-stone-900">Review your ring</h1>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-stone-500">Center diamond</p>
              <Link
                href={builderHref("/diamonds", { setting: setting.slug, metal: option.metal })}
                className="text-sm text-stone-500 underline-offset-2 hover:underline"
              >
                Change
              </Link>
            </div>
            <div className="flex items-center justify-between gap-4">
              <DiamondSummary diamond={diamond} />
              <p className="font-medium text-stone-900">{formatPrice(diamond.price)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-stone-500">Setting</p>
              <Link
                href={builderHref(`/ring-builder/settings/${setting.slug}`, { diamond: diamond.sku, metal: option.metal })}
                className="text-sm text-stone-500 underline-offset-2 hover:underline"
              >
                Change
              </Link>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-200 text-[10px]">
                  <SettingImage setting={setting} />
                </div>
                <div>
                  <p className="font-medium text-stone-900">{setting.name}</p>
                  <p className="text-sm text-stone-500">{option.metal}</p>
                </div>
              </div>
              <p className="font-medium text-stone-900">{formatPrice(option.price)}</p>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-3xl bg-accent-soft p-8 lg:sticky lg:top-24">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-600">Diamond</dt>
              <dd className="text-stone-900">{formatPrice(diamond.price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-600">Setting</dt>
              <dd className="text-stone-900">{formatPrice(option.price)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-300 pt-3 text-lg font-semibold">
              <dt className="text-stone-900">Total</dt>
              <dd className="text-stone-900">{formatPrice(total)}</dd>
            </div>
          </dl>
          <p className="mb-6 mt-1 text-xs text-stone-500">Shipping and tax are calculated at checkout.</p>

          <CheckoutForm
            diamond={diamond.sku}
            setting={setting.slug}
            metal={option.metal}
            sizes={RING_SIZES}
            canCheckout={canCheckout}
          />

          <Link
            href={`/custom?sku=${diamond.sku}&design=${setting.slug}`}
            className="mt-4 block text-center text-sm text-stone-600 underline-offset-2 hover:underline"
          >
            {canCheckout ? "Questions? Talk to us first" : "Request this ring"}
          </Link>
        </aside>
      </div>
    </div>
  );
}

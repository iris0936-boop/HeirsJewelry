"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { builderHref } from "@/lib/builder-href";

/**
 * "Choose this diamond" on the diamond page. If the shopper already picked a setting
 * (it's carried in the URL), go straight to review; otherwise go choose a setting.
 */
export function ChooseDiamondButton({ sku }: { sku: string }) {
  const params = useSearchParams();
  const setting = params.get("setting") ?? undefined;
  const metal = params.get("metal") ?? undefined;

  const href =
    setting && metal
      ? builderHref("/ring-builder/review", { diamond: sku, setting, metal })
      : builderHref("/ring-builder/settings", { diamond: sku });

  return (
    <Link href={href} className="btn-accent">
      {setting && metal ? "Complete your ring" : "Choose this diamond"}
    </Link>
  );
}

"use server";

import { redirect } from "next/navigation";
import { getDiamond } from "@/data/diamonds";
import { getSetting, RING_SIZES } from "@/data/settings";
import { createCheckout, shopifyConfigured } from "@/lib/shopify";

export interface CheckoutState {
  error?: string;
}

/**
 * Re-loads the diamond and setting on the server (never trusts prices or IDs from the browser),
 * creates a Shopify cart with both, and redirects to Shopify's hosted checkout.
 */
export async function checkoutRing(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const sku = String(formData.get("diamond") ?? "");
  const slug = String(formData.get("setting") ?? "");
  const metal = String(formData.get("metal") ?? "");
  const size = String(formData.get("size") ?? "");

  if (!(RING_SIZES as readonly string[]).includes(size)) return { error: "Please choose a ring size." };

  const [diamond, setting] = await Promise.all([getDiamond(sku), getSetting(slug)]);
  if (!diamond) return { error: "Sorry, this diamond was just sold. Please choose another stone." };
  const option = setting?.options.find((o) => o.metal === metal && o.available);
  if (!setting || !option) return { error: "That setting and metal combination is no longer available." };

  if (!shopifyConfigured() || !diamond.variantId || !option.variantId) {
    return { error: "Online checkout isn't available for this ring yet. Please use “Request this ring” below." };
  }

  const pairing = `${diamond.sku} set in ${setting.name} (${metal}), size ${size}`;
  let result: Awaited<ReturnType<typeof createCheckout>>;
  try {
    result = await createCheckout({
      lines: [
        {
          merchandiseId: diamond.variantId,
          quantity: 1,
          attributes: [{ key: "Set in", value: `${setting.name} (${metal})` }],
        },
        {
          merchandiseId: option.variantId,
          quantity: 1,
          attributes: [
            { key: "Center diamond", value: diamond.sku },
            { key: "Ring size", value: size },
          ],
        },
      ],
      attributes: [
        { key: "Diamond SKU", value: diamond.sku },
        { key: "Setting", value: setting.name },
        { key: "Metal", value: metal },
        { key: "Ring size", value: size },
      ],
      note: `Ring builder: ${pairing}`,
    });
  } catch (err) {
    console.error("[checkout] Shopify cart creation failed", err);
    return { error: "We couldn't start checkout. Please try again in a moment." };
  }

  if ("error" in result) return { error: result.error };
  redirect(result.checkoutUrl);
}

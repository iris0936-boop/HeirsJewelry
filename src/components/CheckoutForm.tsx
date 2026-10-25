"use client";

import { useActionState } from "react";
import { checkoutRing, type CheckoutState } from "@/app/ring-builder/review/actions";

export function CheckoutForm({
  diamond,
  setting,
  metal,
  sizes,
  canCheckout,
}: {
  diamond: string;
  setting: string;
  metal: string;
  sizes: readonly string[];
  canCheckout: boolean;
}) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(checkoutRing, {});

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="diamond" value={diamond} />
      <input type="hidden" name="setting" value={setting} />
      <input type="hidden" name="metal" value={metal} />

      <label className="block text-sm font-medium text-stone-900">
        Ring size
        <select
          name="size"
          required
          defaultValue=""
          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal text-stone-900 outline-none focus:border-stone-900"
        >
          <option value="" disabled>
            Select a size
          </option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="mt-2 block text-xs font-normal text-stone-500">
          Not sure? Choose your best guess and mention it in the order notes at checkout.
        </span>
      </label>

      {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}

      {canCheckout ? (
        <button type="submit" disabled={pending} className="btn-accent w-full disabled:opacity-50">
          {pending ? "Starting secure checkout…" : "Checkout"}
        </button>
      ) : (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
          Online checkout isn&apos;t set up for this ring yet. Request it below and we&apos;ll send you a secure
          payment link.
        </p>
      )}
    </form>
  );
}

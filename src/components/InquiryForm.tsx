"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/app/custom/actions";

const initial: InquiryState = { ok: false, message: "" };

export function InquiryForm({ sku, design }: { sku?: string; design?: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-emerald-900">{state.message}</div>
    );
  }

  const field =
    "mt-1 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none focus:border-stone-900";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="sku" value={sku ?? ""} />
      <input type="hidden" name="design" value={design ?? ""} />

      {(sku || design) && (
        <p className="rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
          Asking about: {sku && <strong>diamond {sku}</strong>}
          {sku && design && " and "}
          {design && <strong>the {design.replace(/-/g, " ")} design</strong>}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-stone-700">
          Name
          <input name="name" required className={field} />
        </label>
        <label className="text-sm text-stone-700">
          Email
          <input name="email" type="email" required className={field} />
        </label>
      </div>
      <label className="block text-sm text-stone-700">
        Phone (optional)
        <input name="phone" type="tel" className={field} />
      </label>
      <label className="block text-sm text-stone-700">
        Budget (optional)
        <select name="budget" className={field} defaultValue="">
          <option value="">Prefer not to say</option>
          <option>Under $3,000</option>
          <option>$3,000 – $7,500</option>
          <option>$7,500 – $15,000</option>
          <option>$15,000+</option>
        </select>
      </label>
      <label className="block text-sm text-stone-700">
        Tell us about the piece
        <textarea
          name="message"
          required
          rows={5}
          className={field}
          placeholder="Shape, style, metal, occasion, timeline, anything you have in mind."
        />
      </label>

      {state.message && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="btn-accent disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}

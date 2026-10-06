import { InquiryForm } from "@/components/InquiryForm";

export const metadata = { title: "Custom Design | YOUR NAME Fine Jewelry" };

export default async function CustomPage({
  searchParams,
}: {
  searchParams: Promise<{ sku?: string; design?: string }>;
}) {
  const { sku, design } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="font-serif text-4xl text-stone-900">Custom design</h1>
          <p className="mt-4 text-lg text-stone-600">
            Tell us what you have in mind. We will reply within a business day to set up a conversation, in person or
            by video.
          </p>

          <ol className="mt-10 space-y-6">
            {[
              ["Consultation", "We talk through style, stone, metal, and budget. No commitment."],
              ["Design & render", "You receive sketches and a 3D render to approve before anything is made."],
              ["Crafting", "Your piece is made by hand. Typical turnaround is 3 to 5 weeks."],
              ["Delivery", "Delivered insured, with the diamond's certificate and an appraisal."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-stone-900">{t}</p>
                  <p className="text-stone-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl border border-stone-200 p-8">
          <InquiryForm sku={sku} design={design} />
        </div>
      </div>
    </div>
  );
}

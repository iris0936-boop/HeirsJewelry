import { DesignGallery } from "@/components/DesignGallery";
import { designs } from "@/data/designs";

export const metadata = { title: "Designs | Heir’s Jewelry" };

export default function DesignsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-stone-900">Designs</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Pieces we have made and can make again, in any metal, for any stone. Treat these as starting points for
          your own design.
        </p>
      </div>
      <DesignGallery designs={designs} />
    </div>
  );
}

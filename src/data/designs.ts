// Your design portfolio. Add your own pieces and photos here.

export const DESIGN_CATEGORIES = [
  "Engagement Rings",
  "Wedding Bands",
  "Pendants",
  "Earrings",
  "Bracelets",
] as const;

export type DesignCategory = (typeof DESIGN_CATEGORIES)[number];

export interface Design {
  slug: string;
  name: string;
  category: DesignCategory;
  metal: string;
  description: string;
  images: string[]; // paths under /public, e.g. "/designs/halo-ring.jpg"
  startingPrice?: number; // setting only, USD
  /**
   * Engagement rings only: metal choices and fixed setting price for each.
   * Used by the ring builder when inventory is NOT coming from Shopify.
   * With Shopify, prices come from the setting product's "Metal" variants instead.
   */
  metals?: { name: string; price: number }[];
}

export const designs: Design[] = [
  {
    slug: "classic-solitaire",
    name: "Classic Solitaire",
    category: "Engagement Rings",
    metal: "Platinum",
    description:
      "Six-prong solitaire with a knife-edge band. Timeless, and lets the center stone do the talking.",
    images: [],
    startingPrice: 1800,
    metals: [
      { name: "14k White Gold", price: 1500 },
      { name: "14k Yellow Gold", price: 1500 },
      { name: "18k White Gold", price: 1800 },
      { name: "Platinum", price: 2100 },
    ],
  },
  {
    slug: "pave-halo",
    name: "Pavé Halo",
    category: "Engagement Rings",
    metal: "18k White Gold",
    description:
      "A single halo of micro-pavé diamonds that makes the center stone appear a full carat larger.",
    images: [],
    startingPrice: 2600,
    metals: [
      { name: "14k White Gold", price: 2200 },
      { name: "18k White Gold", price: 2600 },
      { name: "18k Rose Gold", price: 2600 },
      { name: "Platinum", price: 3100 },
    ],
  },
  {
    slug: "hidden-halo-oval",
    name: "Hidden Halo",
    category: "Engagement Rings",
    metal: "18k Yellow Gold",
    description:
      "Clean profile from above, with a surprise ring of diamonds beneath the center stone.",
    images: [],
    startingPrice: 2200,
    metals: [
      { name: "14k Yellow Gold", price: 1900 },
      { name: "18k Yellow Gold", price: 2200 },
      { name: "18k White Gold", price: 2200 },
      { name: "Platinum", price: 2700 },
    ],
  },
  {
    slug: "three-stone-trellis",
    name: "Three-Stone Trellis",
    category: "Engagement Rings",
    metal: "Platinum",
    description: "Past, present, and future. Interwoven trellis prongs hold three stones.",
    images: [],
    startingPrice: 3400,
    metals: [
      { name: "18k White Gold", price: 3000 },
      { name: "18k Yellow Gold", price: 3000 },
      { name: "Platinum", price: 3400 },
    ],
  },
  {
    slug: "eternity-band",
    name: "French-Set Eternity Band",
    category: "Wedding Bands",
    metal: "Platinum",
    description: "Diamonds all the way around, set low for everyday wear.",
    images: [],
    startingPrice: 2900,
  },
  {
    slug: "bezel-pendant",
    name: "Bezel Pendant",
    category: "Pendants",
    metal: "14k Yellow Gold",
    description: "A single diamond in a sleek bezel on a fine cable chain.",
    images: [],
    startingPrice: 900,
  },
  {
    slug: "martini-studs",
    name: "Martini Studs",
    category: "Earrings",
    metal: "14k White Gold",
    description: "Three-prong studs that sit close to the ear.",
    images: [],
    startingPrice: 650,
  },
  {
    slug: "tennis-bracelet",
    name: "Tennis Bracelet",
    category: "Bracelets",
    metal: "14k White Gold",
    description: "Four-prong line bracelet, available in several total carat weights.",
    images: [],
    startingPrice: 4200,
  },
];

export function getDesign(slug: string) {
  return designs.find((d) => d.slug === slug);
}

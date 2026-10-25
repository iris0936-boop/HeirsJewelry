# Diamond & Custom Jewelry Site

Next.js 16 + Tailwind CSS 4, deployable to Vercel. No database required: inventory and designs live in two
TypeScript files you edit directly.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Pages

| Route | What it is |
|---|---|
| `/` | Home: hero, shop by shape, featured diamonds, featured designs, process |
| `/diamonds` | Filterable inventory (shape, carat, price, cut, color, clarity) with sorting |
| `/diamonds/[sku]` | Diamond detail with spec table and suggested settings |
| `/designs` | Design gallery, filterable by category |
| `/designs/[slug]` | Design detail with suggested stones |
| `/custom` | Custom process + inquiry form |
| `/ring-builder` | Start a ring: with a diamond or with a setting |
| `/ring-builder/settings` | Choose a setting (carries the chosen diamond along) |
| `/ring-builder/settings/[slug]` | Choose metal for a setting |
| `/ring-builder/review` | Diamond + setting + metal, ring size, total, checkout |

## Updating inventory

Inventory is a spreadsheet with these columns (header row required, order doesn't matter, case-insensitive):

| Column | Required | Values |
|---|---|---|
| `sku` | yes | Unique ID, e.g. `RD-1013` |
| `origin` | no | `Natural` (default if blank) or `Lab Grown`. Also accepts `lab`, `lab-grown`, `lab created`, `LG`. |
| `shape` | yes | Round, Oval, Cushion, Princess, Emerald, Pear, Radiant, Marquise, Heart |
| `carat` | yes | Number, e.g. `1.20` |
| `cut` | yes | Ideal, Excellent, Very Good, Good |
| `color` | yes | D through K |
| `clarity` | yes | FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2 |
| `price` | yes | USD, `$` and commas allowed |
| `lab` | yes | GIA, IGI, AGS |
| `certificate` | no | e.g. `GIA 1234567890` |
| `measurements` | no | e.g. `6.8 x 6.82 x 4.2 mm` |
| `images` | no | Image URLs or `/diamonds/file.jpg` paths, separated by `\|` |
| `description` | no | Free text |
| `available` | no | Blank or `yes` = for sale. `sold` or `no` hides it. |

Rows with a missing or invalid required field are skipped and logged (Vercel → Functions → Logs), so one typo
never breaks the site. Allowed values can be extended in `src/data/diamonds.ts`.

### Option A: Google Sheet (recommended)

1. Create a Google Sheet with the columns above (copy `inventory/diamonds.csv` in as a starting point).
2. File → Share → Publish to web → choose the sheet tab and **Comma-separated values (.csv)** → Publish. Copy the URL.
3. In Vercel → Settings → Environment Variables, add `INVENTORY_URL` = that URL. Redeploy once.

From then on, edits to the sheet appear on the site within about a minute (`INVENTORY_REVALIDATE_SECONDS`).
No code, no git. For images, host them anywhere public (Google Drive share links do not work; use Cloudinary,
Imgur, or `public/diamonds/` in this repo) and paste the URL into the `images` column.

### Option B: CSV file in the repo

Edit `inventory/diamonds.csv` (Excel, Numbers, or any text editor), commit, push. Vercel redeploys.
This is also what runs locally and is the fallback when `INVENTORY_URL` is not set.

To test a sheet locally, copy `.env.example` to `.env.local` and fill in the URL.

## Ring builder and Shopify checkout

Shoppers pick a diamond and a setting in either order, choose a metal, then a ring size on the review page.
**Checkout** creates a Shopify cart with two items (the diamond and the setting) and sends them to Shopify's
checkout to pay. Ring size, diamond SKU, setting and metal are attached to the order, so you see them in
Shopify admin → Orders.

Online checkout only turns on when `INVENTORY_SOURCE=shopify`. Until then the builder works the same, but the
review page shows **Request this ring** (goes to the inquiry form) instead of **Checkout**.

### Set up products in Shopify

**Diamonds:** one product per stone.

| Shopify field | Value |
|---|---|
| Product type | `Diamond` (exactly) |
| Price | The stone's price |
| SKU | Your SKU, e.g. `RD-1001` (used in the site URL) |
| Inventory | Track quantity, quantity `1`. When it sells, it disappears from the site. |
| Images | Upload in the product. The first image is used on cards. |
| Description | Shown on the diamond page |

Diamond details are **metafields**. Create these once in Settings → Custom data → Products → Add definition.
Use namespace `custom` (the default) and tick **Storefronts access** on each, or the site can't read them.

| Metafield key | Type | Allowed values |
|---|---|---|
| `custom.origin` | Single line text | Natural, Lab Grown |
| `custom.shape` | Single line text | Round, Oval, Cushion, Princess, Emerald, Pear, Radiant, Marquise, Heart |
| `custom.carat` | Decimal | e.g. 1.02 |
| `custom.cut` | Single line text | Ideal, Excellent, Very Good, Good |
| `custom.color` | Single line text | D to K |
| `custom.clarity` | Single line text | FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2 |
| `custom.lab` | Single line text | GIA, IGI, AGS |
| `custom.certificate` | Single line text | optional |
| `custom.measurements` | Single line text | optional |

Tip: in each text definition, add the allowed values as a "Choice list" so you pick from a dropdown and can't
mistype. A product with a missing or invalid value is skipped and logged (Vercel → Logs).

**Settings:** one product per ring design.

| Shopify field | Value |
|---|---|
| Product type | `Setting` (exactly) |
| Options | One option named `Metal`, e.g. 14k White Gold, 18k Yellow Gold, Platinum |
| Variant prices | The fixed setting price for each metal |
| Inventory | Don't track (made to order), or "Continue selling when out of stock" |
| Handle | Optional: match a design slug in `src/data/designs.ts` (e.g. `pave-halo`) to show "Build a ring with this setting" on that design page |

Ring size is not a variant. Shoppers choose it on the review page, and it's saved on the order line.

### Turn it on

1. Add the products above.
2. Add `INVENTORY_SOURCE=shopify` to `.env` (or Vercel → Settings → Environment Variables) and redeploy.
3. In Shopify, **remove the store password** (Online Store → Preferences) so customers can reach checkout.

From then on, Shopify is the inventory. The CSV is no longer read.

### Domains

| Domain | Points to | Used for |
|---|---|---|
| `www.heirsjewelry.com` | Vercel | The website |
| `heirsjewelry.com` | Vercel (redirects to `www`) | |
| `checkout.heirsjewelry.com` | Shopify (primary domain) | Cart and checkout pages |

Only `checkout.heirsjewelry.com` should be listed in Shopify → Settings → Domains. If `heirsjewelry.com` or
`www` is also connected there, Shopify can redirect visitors away from the website.

## Updating designs

Same idea in `src/data/designs.ts`. Photos go in `public/designs/`.

## Making updates easier later

The UI only depends on `getDiamonds()` in `src/data/diamonds.ts`. To use another source (Sanity, a supplier
feed, Supabase), change `loadCsvText()` or replace `loadAll()`. Nothing else in the site changes.

## Inquiry form

Submissions currently log to the server console (visible in Vercel → Functions → Logs).
To receive them by email, follow the TODO in `src/app/custom/actions.ts` (Resend is the simplest option on Vercel).

## Branding

- Replace `YOUR NAME` in `src/components/Nav.tsx` and `src/app/layout.tsx`.
- Contact details are in the footer in `src/components/Nav.tsx`.
- Colors use Tailwind's `stone` palette. Search and replace `stone-` with another palette (e.g. `zinc-`, `neutral-`) to retheme.

## Deploy

1. Push this folder to a GitHub repo.
2. Import the repo at vercel.com. Defaults work.
3. In Vercel → Settings → Domains, add your domain. Vercel shows the DNS records to add in GoDaddy
   (usually an `A` record for `@` and a `CNAME` for `www`).

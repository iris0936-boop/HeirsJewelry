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

## Updating inventory

Inventory is a spreadsheet with these columns (header row required, order doesn't matter, case-insensitive):

| Column | Required | Values |
|---|---|---|
| `sku` | yes | Unique ID, e.g. `RD-1013` |
| `shape` | yes | Round, Oval, Cushion, Princess, Emerald, Pear, Radiant, Marquise |
| `carat` | yes | Number, e.g. `1.20` |
| `cut` | yes | Ideal, Excellent, Very Good, Good |
| `color` | yes | D through J |
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

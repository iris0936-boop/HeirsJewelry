// Shopify Storefront API client, used from server code only.
//
// Env vars (see .env):
//   SHOPIFY_STORE_DOMAIN      your-store.myshopify.com
//   SHOPIFY_STOREFRONT_TOKEN  public Storefront API token from the Headless sales channel
//   SHOPIFY_API_VERSION       optional, defaults below

const DEFAULT_API_VERSION = "2026-07";

export function shopifyConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_TOKEN);
}

function endpoint(): string {
  const raw = (process.env.SHOPIFY_STORE_DOMAIN ?? "").trim().replace(/\/+$/, "");
  // Accept "store.myshopify.com" or a pasted "https://store.myshopify.com".
  const base = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  const version = process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION;
  return `${base}/api/${version}/graphql.json`;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/**
 * Runs a Storefront API query.
 * Pass `revalidate` (seconds) for cacheable reads; omit it for carts and checkout (never cached).
 */
export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: { revalidate?: number } = {},
): Promise<T> {
  if (!shopifyConfigured()) throw new Error("Shopify is not configured");

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    ...(opts.revalidate !== undefined ? { next: { revalidate: opts.revalidate } } : { cache: "no-store" }),
  });

  if (!res.ok) throw new Error(`Shopify request failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) throw new Error(`Shopify error: ${json.errors.map((e) => e.message).join("; ")}`);
  if (!json.data) throw new Error("Shopify returned no data");
  return json.data;
}

// ---------- Product reads ----------

export interface ShopifyVariant {
  id: string;
  sku: string | null;
  availableForSale: boolean;
  price: { amount: string };
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProduct {
  handle: string;
  title: string;
  description: string;
  images: { nodes: { url: string }[] };
  variants: { nodes: ShopifyVariant[] };
  metafields: ({ key: string; value: string } | null)[];
}

/** Diamond detail fields, stored as product metafields in the "custom" namespace. */
export const DIAMOND_METAFIELD_KEYS = [
  "origin",
  "shape",
  "carat",
  "cut",
  "color",
  "clarity",
  "lab",
  "certificate",
  "measurements",
] as const;

const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($query: String!, $after: String, $identifiers: [HasMetafieldsIdentifier!]!) {
    products(first: 100, after: $after, query: $query) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        title
        description
        images(first: 10) {
          nodes {
            url
          }
        }
        variants(first: 50) {
          nodes {
            id
            sku
            availableForSale
            price {
              amount
            }
            selectedOptions {
              name
              value
            }
          }
        }
        metafields(identifiers: $identifiers) {
          key
          value
        }
      }
    }
  }
`;

/** All products with the given Shopify product type, following pagination. */
export async function getProductsByType(productType: string, revalidate: number): Promise<ShopifyProduct[]> {
  const identifiers = DIAMOND_METAFIELD_KEYS.map((key) => ({ namespace: "custom", key }));
  const out: ShopifyProduct[] = [];
  let after: string | null = null;
  do {
    const data: {
      products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ShopifyProduct[] };
    } = await storefront(
      PRODUCTS_QUERY,
      { query: `product_type:"${productType}"`, after, identifiers },
      { revalidate },
    );
    out.push(...data.products.nodes);
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (after);
  return out;
}

// ---------- Cart / checkout ----------

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: { key: string; value: string }[];
}

const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        checkoutUrl
        lines(first: 10) {
          nodes {
            merchandise {
              ... on ProductVariant {
                id
              }
            }
          }
        }
      }
      userErrors {
        message
      }
    }
  }
`;

/** Creates a cart and returns its Shopify-hosted checkout URL. */
export async function createCheckout(input: {
  lines: CartLineInput[];
  attributes?: { key: string; value: string }[];
  note?: string;
}): Promise<{ checkoutUrl: string } | { error: string }> {
  const data = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string; lines: { nodes: { merchandise: { id: string } }[] } } | null;
      userErrors: { message: string }[];
    };
  }>(CART_CREATE, { input });

  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length) return { error: userErrors.map((e) => e.message).join("; ") };
  if (!cart) return { error: "Shopify did not return a cart" };

  // Shopify can drop lines that are no longer available (e.g. a diamond that just sold).
  const added = new Set(cart.lines.nodes.map((l) => l.merchandise.id));
  if (input.lines.some((l) => !added.has(l.merchandiseId))) {
    return { error: "One of these items is no longer available." };
  }
  return { checkoutUrl: cart.checkoutUrl };
}

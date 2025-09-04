// app/routes/app.products-in-stock.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";

// Optional: if you already have a CORS helper like in your other routes
// import { cors } from "../utils/cors.js";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // You can tweak via query string, e.g. ?min=1&limit=100
  const url = new URL(request.url);
  const min = Math.max(1, parseInt(url.searchParams.get("min") || "1", 10));
  const pageSize = Math.min(250, parseInt(url.searchParams.get("limit") || "100", 10));

  // Filter active products where total inventory (all variants/locations) > min
  // Docs: products query supports "status" and "inventory_total" filters.
  // https://shopify.dev/docs/api/admin-graphql/latest/queries/products
  
  const queryString = `status:ACTIVE AND inventory_total:>${min}`;

  const GQL = `#graphql
    query ProductsInStock($first: Int!, $cursor: String, $query: String!) {
      products(first: $first, after: $cursor, query: $query, sortKey: ID) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          title
          status
          totalInventory
          onlineStoreUrl
          variants(first: 100) {
            nodes {
              id
              title
              sku
              totalInventory
              availableForSale
            }
          }
        }
      }
    }
  `;

  const all = [];
  let cursor = null;

  while (true) {
    const resp = await admin.graphql(GQL, {
      variables: { first: pageSize, cursor, query: queryString },
    });
    const data = await resp.json();

    const connection = data?.data?.products;
    if (!connection) {
      return json(
        { ok: false, error: "Unexpected API response", raw: data },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    all.push(...(connection.nodes || []));
    if (!connection.pageInfo?.hasNextPage) break;
    cursor = connection.pageInfo.endCursor;
  }

  return json(
    { ok: true, count: all.length, data: all },
    { headers: { "Cache-Control": "no-store" } } 
  );
};

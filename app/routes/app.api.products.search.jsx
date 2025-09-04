// app/routes/app.api.products.search.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
  const cursor = url.searchParams.get("cursor") || null;

  // You can add filters here (e.g. status:ACTIVE AND inventory_total:>0)
  const queryString = q ? `title:*${q}*` : undefined;

  const GQL = `#graphql
    query SearchProducts($first: Int!, $cursor: String, $query: String) {
      products(first: $first, after: $cursor, query: $query, sortKey: TITLE) {
        pageInfo { hasNextPage endCursor }
        nodes { id title status }
      }
    }
  `;

  const resp = await admin.graphql(GQL, {
    variables: { first: limit, cursor, query: queryString },
  });
  const data = await resp.json();

  const conn = data?.data?.products;
  if (!conn) return json({ ok: false, error: "Unexpected API response", raw: data }, { status: 502 });

  const items = (conn.nodes || []).map(n => ({ id: n.id, title: n.title, status: n.status }));
  return json({ ok: true, items, pageInfo: conn.pageInfo });
};

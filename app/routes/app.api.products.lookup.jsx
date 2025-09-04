// app/routes/app.api.products.lookup.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const ids = (url.searchParams.getAll("id") || []).filter(Boolean);

  if (ids.length === 0) return json({ ok: true, items: [] });

  const GQL = `#graphql
    query LookupProducts($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Product { id title status }
      }
    }
  `;

  const resp = await admin.graphql(GQL, { variables: { ids } });
  const data = await resp.json();

  const nodes = data?.data?.nodes || [];
  const items = nodes
    .filter(Boolean)
    .map(n => ({ id: n.id, title: n.title, status: n.status }));

  return json({ ok: true, items });
};

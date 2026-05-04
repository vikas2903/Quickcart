import { json } from "@remix-run/node";
import connectDatabase from "../lib/dbconnect.js";
import CollectionbasedProgress from "../models/collection-based-progressbar-qty-price-based-modals.js";
import { cors } from "../utils/cors.js";

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }

  const shop = (request.headers.get("x-shopify-shop-domain") || "")
    .toLowerCase()
    .trim();

  if (!shop) {
    return json(
      { ok: false, error: "Missing X-Shopify-Shop-Domain header" },
      { status: 400, headers: cors(request) },
    );
  }

  await connectDatabase();

  try {
    const data = await CollectionbasedProgress.findOne({ storeName: shop }).lean();
    return json(
      { ok: true, data: data || null },
      { headers: { ...cors(request), "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return json(
      { ok: false, error: error?.message || "DB read failed" },
      { status: 500, headers: cors(request) },
    );
  }
};

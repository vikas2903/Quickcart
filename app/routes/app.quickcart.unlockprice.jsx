import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import { DiscountMilestone } from "../models/unlockprice.js";
import { cors } from "../utils/cors.js";

/** GET /app/quickcart/unloackprice  -> read by shopName */
export const loader = async ({ request }) => {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }

  // shop from header
  const shop = (request.headers.get("x-shopify-shop-domain") || "")
    .toLowerCase()
    .trim();

  if (!shop) {
    return json(
      { ok: false, error: "Missing X-Shopify-Shop-Domain header" },
      { status: 400, headers: cors(request) }
    );
  }

  await connectDatabase();

  try {
    const cfg = await DiscountMilestone.findOne({ shopName: shop }).lean();
    return json(
      { ok: true, data: cfg || null },
      { headers: { ...cors(request), "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return json(
      { ok: false, error: err?.message || "DB read failed" },
      { status: 500, headers: cors(request) }
    );
  }
};

/** POST /app/quickcart/unloackprice  -> upsert by shopName */
export const action = async ({ request }) => {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }
  if (request.method !== "POST") {
    return json(
      { ok: false, error: "Method not allowed" },
      { status: 405, headers: cors(request) }
    );
  }

  // Only your app can write (admin auth). Header > session fallback.
  const { session } = await authenticate.admin(request);
  const shopFromSession = (session?.shop || "").toLowerCase().trim();
  const shop = (request.headers.get("x-shopify-shop-domain") || shopFromSession)
    .toLowerCase()
    .trim();

  if (!shop) {
    return json(
      { ok: false, error: "Missing shop (header or session)" },
      { status: 400, headers: cors(request) }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(
      { ok: false, error: "Invalid JSON" },
      { status: 400, headers: cors(request) }
    );
  }

  const enabled = !!body.enabled;
  const progressBarColor = String(body.progressBarColor || "#000000").trim();

  // sanitize milestones
  const milestonesRaw = Array.isArray(body.milestones) ? body.milestones : [];
  const milestones = milestonesRaw
    .map((m) => ({
      price: Number.parseFloat(m?.price),
      text: String(m?.text || "").trim(),
    }))
    .filter(
      (m) => Number.isFinite(m.price) && m.price >= 0 && m.text.length > 0
    );

  if (milestones.length === 0) {
    return json(
      { ok: false, error: "At least one valid milestone is required" },
      { status: 400, headers: cors(request) }
    );
  }

  await connectDatabase();

  try {
    const saved = await DiscountMilestone.findOneAndUpdate(
      { shopName: shop },
      {
        $set: { enabled, milestones, progressBarColor },
        $setOnInsert: { shopName: shop }, // 👈 persist shopName in schema
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return json({ ok: true, data: saved }, { headers: cors(request) });
  } catch (err) {
    return json(
      { ok: false, error: err?.message || "DB write failed" },
      { status: 500, headers: cors(request) }
    );
  }
};

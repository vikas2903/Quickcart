// // app/routes/app.api.bxgy-rule.jsx
// import { json } from "@remix-run/node";
// import { authenticate } from "../shopify.server.js";
// import connectDatabase from "../lib/dbconnect.js";
// import { BxgyRule } from "../models/bxfrule.js";

// export const loader = async ({ request }) => {  
//   const { session } = await authenticate.admin(request);
//   const shop = (request.headers.get("x-shopify-shop-domain") || session.shop || "")
//     .toLowerCase()
//     .trim();
//   if (!shop) return json({ ok: false, error: "Missing shop" }, { status: 400 });

//   await connectDatabase();
//   const doc = await BxgyRule.findOne({ shopName: shop }).lean();

//   return json(
//     { ok: true, data: doc || null },
//     { headers: { "Cache-Control": "no-store" } }
//   );
// };

// export const action = async ({ request }) => {
//   if (request.method !== "POST") {
//     return json({ ok: false, error: "Method not allowed" }, { status: 405 });
//   }

//   const { session } = await authenticate.admin(request);
//   const shop = (request.headers.get("x-shopify-shop-domain") || session.shop || "")
//     .toLowerCase()
//     .trim();
//   if (!shop) return json({ ok: false, error: "Missing shop" }, { status: 400 });

//   let body;
//   try {
//     body = await request.json();
//   } catch {
//     return json({ ok: false, error: "Invalid JSON" }, { status: 400 });
//   }

//   const enabled = !!body.enabled;
//   const buyQty = Number.parseInt(body.buyQty, 10);

//   // 💡 Accept both correct and previously-misspelled keys to be safe
//   const incomingBuyIds =
//     Array.isArray(body.buyProductIds) ? body.buyProductIds :
//     Array.isArray(body.buyProductdIds) ? body.buyProductdIds : [];

//   const buyProductIds = incomingBuyIds.map(String);
//   const freeProductId = String(body.freeProductId || "");

//   if (!Number.isInteger(buyQty) || buyQty < 1) {
//     return json({ ok: false, error: "buyQty must be >= 1" }, { status: 400 });
//   }

//   await connectDatabase();

//   const saved = await BxgyRule.findOneAndUpdate(
//     { shopName: shop },
//     {
//       $set: { enabled, buyQty, buyProductIds, freeProductId },
//       $unset: { buyProductdIds: "" }, // clean-up any bad field from past
//       $setOnInsert: { shopName: shop },
//     },
//     { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
//   ).lean();

//   return json({ ok: true, data: saved });
// };


// app/routes/app.api.bxgy-rule.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import { BxgyRule } from "../models/bxfrule.js"; // keep your current model path/name
import { cors } from "../utils/cors.js";

/** GET /app/api/bxgy-rule  -> read by shopName (header) */
export const loader = async ({ request }) => {
  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }

  // shop from header (same as your working route)
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
    const doc = await BxgyRule.findOne({ shopName: shop }).lean();
    return json(
      { ok: true, data: doc || null },
      { headers: { ...cors(request), "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return json(
      { ok: false, error: err?.message || "DB read failed" },
      { status: 500, headers: cors(request) }
    );
  }
};

/** POST /app/api/bxgy-rule -> upsert by shopName (admin-only write) */
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

  // Require admin auth for writes. Header > session fallback (same as your working file)
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

  // sanitize / validate
  const enabled = !!body.enabled;
  const buyQty = Number.parseInt(body.buyQty, 10);

  // Accept both correct and previously misspelled keys; normalize to buyProductIds
  const incomingBuyIds = Array.isArray(body.buyProductIds)
    ? body.buyProductIds
    : Array.isArray(body.buyProductdIds)
    ? body.buyProductdIds
    : []
    ;
  const buyProductIds = incomingBuyIds.filter(Boolean).map(String);

  const freeProductId = String(body.freeProductId || "");

  if (!Number.isInteger(buyQty) || buyQty < 1) {
    return json(
      { ok: false, error: "buyQty must be >= 1" },
      { status: 400, headers: cors(request) }
    );
  }

  await connectDatabase();

  try {
    const saved = await BxgyRule.findOneAndUpdate(
      { shopName: shop },
      {
        $set: { enabled, buyQty, buyProductIds, freeProductId },
        $unset: { buyProductdIds: "" }, // clean up any legacy typo field
        $setOnInsert: { shopName: shop },
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



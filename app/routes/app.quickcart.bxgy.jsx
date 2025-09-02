// app/routes/api.bxgy.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import { BxgyConfig } from "../models/bxgyconfig.js";


/** GET /api/bxgy?shop=<shop-url> */
// export const loader = async ({ request }) => {
//   const url  = new URL(request.url);
//   const shop = (url.searchParams.get("shop") || "").toLowerCase().trim();
//   if (!shop) return json({ ok: false, error: "Missing ?shop=<shop-url>" }, { status: 400 });

//   await connectDatabase();
//   const cfg = await BxgyConfig.findOne({ shopName: shop }).lean();

//   if (!cfg) return json({ ok: false, error: "Not found" }, { status: 404 });

//   return json({ ok: true, data: cfg || null }, { headers: { "Cache-Control": "no-store" } });
// };

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop =
    (request.headers.get("x-shopify-shop-domain") ||
      url.searchParams.get("shop") ||
      "")
      .toLowerCase()
      .trim();

  if (!shop) {
    return json({ ok: false, error: "shop missing" }, { status: 400 });
  }

  await connectDatabase();
  const cfg = await BxgyConfig.findOne({ shopName: shop }).lean();

  return json({ ok: true, data: cfg || null }, { headers: { "Cache-Control": "no-store" } });
};

/** POST /app/bxgy  (body = { enabled, offer:{buyQty,getQty}, messages:{...} }) */
export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, { status: 405 });
  }

  // Require admin session so only your app can write
  const { session } = await authenticate.admin(request);
  const shopFromSession = (session?.shop || "").toLowerCase().trim();

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const shop = (body.shop || shopFromSession).toLowerCase().trim();
  const enabled = !!body.enabled;

  const buyQty = Number.parseInt(body?.offer?.buyQty, 10);
  const getQty = Number.parseInt(body?.offer?.getQty, 10);

  const messages = body?.messages || {};
  const remainingMany = String(messages?.remainingMany || "");
  const remainingOne  = String(messages?.remainingOne  || "");
  const unlocked      = String(messages?.unlocked      || "");

  if (!shop) return json({ ok: false, error: "shop is required" }, { status: 400 });
  if (!Number.isInteger(buyQty) || buyQty < 1) return json({ ok: false, error: "offer.buyQty must be >= 1" }, { status: 400 });
  if (!Number.isInteger(getQty) || getQty < 1) return json({ ok: false, error: "offer.getQty must be >= 1" }, { status: 400 });
  if (!remainingMany || !remainingOne || !unlocked) {
    return json({ ok: false, error: "messages.remainingMany/remainingOne/unlocked are required" }, { status: 400 });
  }

  await connectDatabase();

  const saved = await BxgyConfig.findOneAndUpdate( 
    { shopName: shop },
    {
      $set: {
        enabled,
        offer: { buyQty, getQty },
        messages: { remainingMany, remainingOne, unlocked },
      },
      $setOnInsert: { shopName: shop },
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true, timestamps: true }
  ).lean();

  return json({ ok: true, data: saved });
};

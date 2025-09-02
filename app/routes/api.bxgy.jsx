import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js"; // Shopify Remix template
import connectDatabase from "../lib/dbconnect.js";
import { BxgyConfig } from "../models/bxgyconfig.js";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, { status: 405 });
  }

  // Require admin session (derives shop from session)
  const { session } = await authenticate.admin(request);
  const shopFromSession = (session?.shop || "").toLowerCase().trim();

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Allow explicit shop override (optional), else use session.shop
  const shop = (body.shop || shopFromSession).toLowerCase().trim();
  const { enabled, offer, messages } = body || {};

  // Minimal validation
  if (!shop)  return json({ ok: false, error: "shop is required" }, { status: 400 });
  if (!offer?.buyQty || !offer?.getQty)
    return json({ ok: false, error: "offer.buyQty and offer.getQty are required" }, { status: 400 });
  if (!messages?.remainingMany || !messages?.remainingOne || !messages?.unlocked)
    return json({ ok: false, error: "messages.remainingMany/remainingOne/unlocked are required" }, { status: 400 });

  await connectDatabase();

  await BxgyConfig.updateOne(
    { shopName: shop },
    {
      $set: {
        enabled: !!enabled,
        offer: { buyQty: Number(offer.buyQty), getQty: Number(offer.getQty) },
        messages: {
          remainingMany: String(messages.remainingMany),
          remainingOne:  String(messages.remainingOne),
          unlocked:      String(messages.unlocked),
        },
      },
    },
    { upsert: true }
  );

  const saved = await BxgyConfig.findOne({ shopName: shop }).lean();
  return json({ ok: true, data: saved });
};

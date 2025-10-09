// /app/api/giftproduct.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import { GiftProductRule } from "../models/giftproductrule.js"; // <-- use the MODEL
import { cors } from "../utils/cors.js";


export const config = { runtime: "nodejs" };

/**
 * GET -> returns the saved GiftProductRule for the authenticated shop
 */
// export const loader = async ({ request }) => {
//   try {
//     const { session } = await authenticate.admin(request);
//     const shop = (session.shop || "").toLowerCase().trim();

//     console.log("Loader accessed for shop:", shop);

//     if (!shop) {
//       return json(
//         { ok: false, error: "Missing shop info in session" },
//         { status: 400, headers: cors(request) }
//       );
//     }

//     await connectDatabase();

//     const rule = await GiftProductRule.findOne({ shop:shop }).lean();

//     console.log("Fetched gift product rule:", rule);

//     return json(
//       {
//         ok: true,
//         data: rule || null,
//       },
//       { headers: cors(request) }
//     );
//   } catch (error) {
//     return json(
//       { ok: false, error: error.message || "Failed to fetch configuration" },
//       { status: 500, headers: cors(request) }
//     );
//   }
// };


export const loader = async ({request}) =>{
  if(request.method === "OPTIONS"){
    return new Response (null,{status:204, headers: cors(request)});
  }

  const shop = (request.headers.get("x-shopify-shop-domain") || "").toLowerCase().trim();
  
  if(!shop){
    return json({ok:false, error:"Missing X-Shopify-Shop-Domain header"},{status:400, headers: cors(request)});
  }
    if (!shop) {
      return json(
        { ok: false, error: "Missing X-Shopify-Shop-Domain header" },
        { status: 400, headers: cors(request) }
      );
    }

    await connectDatabase();

     try {
        const doc = await GiftProductRule.findOne({ shop: shop }).lean();
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

}
/**
 * POST -> upserts the GiftProductRule for the authenticated shop
 * Body shape expected:
 * {
 *   enabled: boolean,
 *   price: string|number,
 *   selectedProduct?: { id, title, handle, price: string|number (minor units) }
 * }
 */
export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json(
      { ok: false, error: "Method not allowed" },
      { status: 405, headers: cors(request) }
    );
  }

  // auth
  const { session } = await authenticate.admin(request);
  const shop = (session.shop || "").toLowerCase().trim();

  if (!shop) {
    return json(
      { ok: false, error: "Missing shop info in session" },
      { status: 400, headers: cors(request) }
    );
  }

  // parse
  let body;
  try {
    body = await request.json();
  } catch {
    return json(
      { ok: false, error: "Invalid JSON" },
      { status: 400, headers: cors(request) }
    );
  }

  // connect
  await connectDatabase();

  // prepare update
  const enabled = !!body?.enabled;
  const price = Number(body?.price);
  const safePrice = Number.isFinite(price) ? price : 0;

  let selectedProduct = null;
  if (body?.selectedProduct) {
    const sp = body.selectedProduct;
    const rawMinor = Number(sp?.price);
    const majorPrice = Number.isFinite(rawMinor) ? rawMinor / 100 : 0; // divide by 100 here

    selectedProduct = {
      id: String(sp?.id || ""),
      title: String(sp?.title || ""),
      handle: String(sp?.handle || ""),
      price: majorPrice,
    };
  }

  try {
    const savedgiftproduct = await GiftProductRule.findOneAndUpdate(
      { shop }, // always upsert by session shop
      {
        $set: {
          enabled,
          price: safePrice,
          selectedProduct, // null or object
        },
        $setOnInsert: { shop },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    console.log("Saved gift product rule:", savedgiftproduct);
    return json(
      { ok: true, data: savedgiftproduct },
      { headers: cors(request) }
    );
  } catch (error) {
    return json(
      { ok: false, error: error.message || "Failed to save configuration" },
      { status: 500, headers: cors(request) }
    );
  }
};

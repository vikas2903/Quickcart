// /app/api/giftproduct.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import { GiftProductRule } from "../models/giftproductrule.js"; // <-- use the MODEL
import { cors } from "../utils/cors.js";


export const config = { runtime: "nodejs" };

/**
 * Helper function to resolve myshopify.com domain from custom domain
 * Tries multiple lookup strategies to find the correct shop domain in the database
 */
async function resolveShopDomain(providedShop, dbConnectionEstablished = false) {
  if (!providedShop) return null;
  
  const normalizedShop = providedShop.toLowerCase().trim();
  
  // If it already ends with .myshopify.com, return as is
  if (normalizedShop.endsWith('.myshopify.com')) {
    return normalizedShop;
  }
  
  // If it's a custom domain, try to find the corresponding myshopify.com domain
  try {
    if (!dbConnectionEstablished) {
      await connectDatabase();
    }
    
    // Strategy 1: Try exact match with provided shop (in case it was stored as custom domain)
    let doc = await GiftProductRule.findOne({ shop: normalizedShop }).lean();
    if (doc) {
      return doc.shop; // Return the shop as stored in DB
    }
    
    // Strategy 2: Get all myshopify.com shops and try to find best match
    // This handles cases where custom domain doesn't directly match myshopify.com domain
    const allDocs = await GiftProductRule.find({ 
      shop: { $regex: /\.myshopify\.com$/, $options: 'i' } 
    }).lean();
    
    if (allDocs && allDocs.length > 0) {
      // Extract base words from custom domain (e.g., "serenityjewels" -> ["serenity", "jewels"])
      const customDomainBase = normalizedShop.split('.')[0];
      const customWords = customDomainBase.split(/[-_]/).filter(w => w.length > 2);
      
      // Try to find best match by checking if myshopify.com shop contains any of the words
      for (const doc of allDocs) {
        if (doc.shop && doc.shop.endsWith('.myshopify.com')) {
          const myshopifyBase = doc.shop.replace('.myshopify.com', '').toLowerCase();
          
          // Check if any word from custom domain appears in myshopify domain
          for (const word of customWords) {
            if (myshopifyBase.includes(word.toLowerCase()) || word.toLowerCase().includes(myshopifyBase.split('-')[0])) {
              return doc.shop;
            }
          }
          
          // Also try reverse - check if myshopify base appears in custom domain
          const myshopifyFirstPart = myshopifyBase.split('-')[0];
          if (customDomainBase.includes(myshopifyFirstPart) || myshopifyFirstPart.includes(customDomainBase.substring(0, 5))) {
            return doc.shop;
          }
        }
      }
    }
    
    // Strategy 3: Fallback - try regex with base name (original approach)
    const baseName = normalizedShop.split('.')[0];
    doc = await GiftProductRule.findOne({ 
      shop: { $regex: baseName.substring(0, 5), $options: 'i' } 
    }).lean();
    
    if (doc && doc.shop && doc.shop.endsWith('.myshopify.com')) {
      return doc.shop;
    }
    
  } catch (err) {
    console.error("Error resolving shop domain:", err);
  }
  
  // If we can't resolve, return the provided shop as fallback
  // The lookup will still try with this value
  return normalizedShop;
}

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

  // Try to get shop from header first, then from query parameter as fallback
  const url = new URL(request.url);
  const providedShop = (request.headers.get("x-shopify-shop-domain") || url.searchParams.get("shop") || "").toLowerCase().trim();
  
  if(!providedShop){
    return json({ok:false, error:"Missing X-Shopify-Shop-Domain header or shop query parameter"},{status:400, headers: cors(request)});
  }

    await connectDatabase();

     try {
        // Resolve the myshopify.com domain from custom domain if needed
        const shop = await resolveShopDomain(providedShop, true);
        
        // Try to find the document with resolved shop domain
        let doc = await GiftProductRule.findOne({ shop: shop }).lean();
        
        // If not found and shop was resolved (might be custom domain), try with original provided shop
        if (!doc && shop !== providedShop.toLowerCase().trim()) {
          doc = await GiftProductRule.findOne({ shop: providedShop.toLowerCase().trim() }).lean();
        }
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

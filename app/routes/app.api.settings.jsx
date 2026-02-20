/**
 * ============================================================================
 * SETTINGS API ENDPOINT
 * ============================================================================
 * This file handles GET and POST requests for app settings
 * 
 * GET  /app/api/settings  - Fetch settings from database
 * POST /app/api/settings  - Save settings to database
 * 
 * The API uses MongoDB with Mongoose to store settings per shop.
 * Each shop has its own settings document identified by the shop domain.
 * ============================================================================
 */

import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import Settings from "../models/settings.js";
import { cors } from "../utils/cors.js";

/**
 * ============================================================================
 * GET /app/api/settings
 * ============================================================================
 * Fetches settings from the database for the current shop
 * 
 * Flow:
 * 1. Authenticate the admin request
 * 2. Extract shop domain from headers or session
 * 3. Connect to MongoDB database
 * 4. Query database for settings by shop domain
 * 5. Return settings or default values if not found
 * 
 * Usage from frontend:
 *   fetch('/app/api/settings', {
 *     headers: { 'X-Shopify-Shop-Domain': shop }
 *   })
 * ============================================================================
 */
export const loader = async ({ request }) => {
  // Handle CORS preflight requests (browser sends OPTIONS before actual request)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }

  // Step 1: Allow both authenticated (dashboard) and unauthenticated (extension) access
  let shop;
  try {
    const { session } = await authenticate.admin(request);
    shop = session.shop;
  } catch (e) {
    // If authentication fails (including redirect Responses), suppress the error
    // and get shop from header instead (for extension/storefront access)
    // By catching and not re-throwing, we prevent redirects that cause CORS issues
    shop = request.headers.get("X-Shopify-Shop-Domain") || 
           request.headers.get("x-shopify-shop-domain");
  }
  
  // Step 2: Normalize shop domain
  if (shop) {
    shop = shop.toLowerCase().trim();
    if (!shop.includes('.')) {
      shop = shop + '.myshopify.com';
    }
  }

  // Validate shop domain exists
  if (!shop) {
    return json(
      { ok: false, error: "Missing shop" },
      { status: 400, headers: cors(request) }
    );
  }

  // Step 3: Connect to MongoDB database
  await connectDatabase();

  try {
    // Step 4: Query database for settings by shop domain
    // .lean() returns plain JavaScript object instead of Mongoose document (faster)
    const settings = await Settings.findOne({ shop }).lean();

    // Step 4.5: Fetch third-party HTML content from shop metafield
    let thirdPartyHtmlContent = "";
    try {
      // Try to get admin session for metafield access
      let admin;
      try {
        const authResult = await authenticate.admin(request);
        admin = authResult.admin;
      } catch {
        // If admin auth fails, skip metafield fetch (for extension access)
        admin = null;
      }

      if (admin) {
        const metafieldQuery = `
          query {
            shop {
              id
              metafield(namespace: "custom", key: "third_party_checkout_html") {
                id
                value
              }
            }
          }
        `;
        const metafieldRes = await admin.graphql(metafieldQuery);
        const metafieldData = await metafieldRes.json();
        
        if (metafieldData?.data?.shop?.metafield?.value) {
          thirdPartyHtmlContent = metafieldData.data.shop.metafield.value;
        }
      }
    } catch (metafieldErr) {
      console.warn("Error fetching third-party HTML from metafield:", metafieldErr);
      // Continue without metafield data
    }

    // Step 5: Return settings or default values if not found
    // Merge third-party HTML from metafield into settings
    const finalSettings = settings ? {
      ...settings,
      cartDrawer: {
        ...settings.cartDrawer,
      },
      thirdPartyIntegration: {
        ...settings.thirdPartyIntegration,
        htmlContent: thirdPartyHtmlContent || settings.thirdPartyIntegration?.htmlContent || ""
      }
    } : {
            // Default settings structure when no settings exist in database
            shop,
            // Countdown/Timer settings
            countdown: {
              show_countdown: false,
              count_down_bg: "#5B9BD5",
              countdown_text_color: "#ffffff",
              countdown_chip_bg: "#ffffff",
              countdown_chip_text: "#2c3e50",
              countdown_border_radius: 50
            },
            // Cart Drawer styling settings
            cartDrawer: {
              body_color: "#f0e5e7",
              text_color: "#000",
              border_radius: 10,
              button_color: "#000000",
              button_text_color: "#000",
              button_border_radius: 10
            },
            // Announcement Bar settings
            announcementBar: {
              enabled: false,
              content: "Free shipping order above 999, Get 10% Off order above 1999",
              background_color: "#f0e5e7",
              text_color: "#000"
            },
            // Collection selection settings
            collection: {
              enabled: false,
              selectedCollection: {
                title: "",
                handle: ""
              }
            },
            // Product selection settings
            product: {
              enabled: false,
              selectedProduct: {
                handle: "",
                title: "",
                id: ""
              }
            },
            // Third-party integration settings
            thirdPartyIntegration: {
              enabled: false,
              htmlContent: thirdPartyHtmlContent || ""
            }
    };

    return json(
      {
        ok: true,
        data: finalSettings
      },
      { headers: cors(request) }
    );
  } catch (err) {
    // Handle database errors
    console.error("Error fetching settings:", err);
    return json(
      { ok: false, error: err?.message || "Failed to fetch settings" },
      { status: 500, headers: cors(request) }
    );
  }
};

/**
 * ============================================================================
 * POST /app/api/settings
 * ============================================================================
 * Saves settings to the database for the current shop
 * 
 * Flow:
 * 1. Authenticate the admin request
 * 2. Extract shop domain from headers or session
 * 3. Parse JSON body from request
 * 4. Connect to MongoDB database
 * 5. Update or create settings document (upsert)
 * 6. Return saved settings
 * 
 * Usage from frontend:
 *   fetch('/app/api/settings', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'X-Shopify-Shop-Domain': shop
 *     },
 *     body: JSON.stringify(settingsData)
 *   })
 * 
 * Expected body structure:
 * {
 *   show_countdown: boolean,
 *   count_down_bg: string,
 *   countdown_text_color: string,
 *   countdown_chip_bg: string,
 *   countdown_chip_text: string,
 *   countdown_border_radius: number,
 *   body_color: string,
 *   text_color: string,
 *   border_radius: number,
 *   announcementBar: { enabled: boolean, content: string },
 *   collection: { enabled: boolean, selectedCollection: object },
 *   product: { enabled: boolean, selectedProduct: object },
 *   thirdPartyIntegration: { enabled: boolean, htmlContent: string }
 * }
 * ============================================================================
 */
export const action = async ({ request }) => {
  // Wrap entire handler in try-catch to ensure we always return JSON
  try {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(request) });
    }

    // Step 1: Authenticate the admin request
    let session, admin;
    try {
      const authResult = await authenticate.admin(request);
      session = authResult.session;
      admin = authResult.admin;
    } catch (err) {
    // Handle authentication errors gracefully - return JSON instead of redirect
    // This prevents CORS issues when authentication fails
    // Check if it's a redirect Response (status 3xx)
    if (err instanceof Response) {
      const status = err.status;
      if (status >= 300 && status < 400) {
        // It's a redirect - return JSON error instead to avoid CORS issues
        return json(
          { ok: false, error: "Authentication required", code: "UNAUTHORIZED" },
          { status: 401, headers: cors(request) }
        );
      }
    }
    // Check for authentication error types
    if (
      err?.name === "ShopifyUnauthorizedError" ||
      err?.message?.includes("No session found") ||
      err?.message?.includes("Unauthorized") ||
      err?.status === 401 ||
      err?.statusCode === 401
    ) {
      return json(
        { ok: false, error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401, headers: cors(request) }
      );
    }
    // Re-throw unexpected errors
    throw err;
  }
  
  // Step 2: Extract shop domain from request headers or session
  const shop =
    (request.headers.get("x-shopify-shop-domain") || session?.shop || "")
      .toLowerCase()
      .trim();

  // Validate shop domain exists
  if (!shop) {
    return json(
      { ok: false, error: "Missing shop" },
      { status: 400, headers: cors(request) }
    );
  }

  // Step 3: Parse JSON body from request
  let body;
  try {
    body = await request.json();
  } catch {
    return json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400, headers: cors(request) }
    );
  }

  // Step 4: Connect to MongoDB database
  await connectDatabase();

  try {
    // Step 5: Fetch existing document first to merge properly
    const existing = await Settings.findOne({ shop }).lean();
    
    // Build cartDrawer object with proper merging
    const cartDrawerData = {
      body_color: body.body_color ?? body.cartDrawer?.body_color ?? existing?.cartDrawer?.body_color ?? "#f0e5e7",
      text_color: body.text_color ?? body.cartDrawer?.text_color ?? existing?.cartDrawer?.text_color ?? "#000",
      border_radius: body.border_radius ?? body.cartDrawer?.border_radius ?? existing?.cartDrawer?.border_radius ?? 10,
      button_color: body.button_color ?? body.cartDrawer?.button_color ?? existing?.cartDrawer?.button_color ?? "#f0e5e7",
      button_text_color: body.button_text_color ?? body.cartDrawer?.button_text_color ?? existing?.cartDrawer?.button_text_color ?? "#000",
      button_border_radius: body.button_border_radius ?? body.cartDrawer?.button_border_radius ?? existing?.cartDrawer?.button_border_radius ?? 10
    };

    // Update or create settings document
    const saved = await Settings.findOneAndUpdate(
      { shop }, // Query: Find document by shop domain
      {
        $set: {
          // Countdown settings
          countdown: {
            show_countdown: body.show_countdown ?? body.countdown?.show_countdown ?? existing?.countdown?.show_countdown ?? false,
            count_down_bg: body.count_down_bg ?? body.countdown?.count_down_bg ?? existing?.countdown?.count_down_bg ?? "#5B9BD5",
            countdown_text_color: body.countdown_text_color ?? body.countdown?.countdown_text_color ?? existing?.countdown?.countdown_text_color ?? "#ffffff",
            countdown_chip_bg: body.countdown_chip_bg ?? body.countdown?.countdown_chip_bg ?? existing?.countdown?.countdown_chip_bg ?? "#ffffff",
            countdown_chip_text: body.countdown_chip_text ?? body.countdown?.countdown_chip_text ?? existing?.countdown?.countdown_chip_text ?? "#2c3e50",
            countdown_border_radius: body.countdown_border_radius ?? body.countdown?.countdown_border_radius ?? existing?.countdown?.countdown_border_radius ?? 50
          },
          // Cart Drawer settings - full object replacement to ensure all fields are saved
          cartDrawer: cartDrawerData,
          // Announcement Bar settings
          announcementBar: {
            enabled: body.announcementBar?.enabled ?? existing?.announcementBar?.enabled ?? false,
            content: body.announcementBar?.content ?? existing?.announcementBar?.content ?? "Free shipping order above 999, Get 10% Off order above 1999",
            background_color: body.announcementBar?.background_color ?? existing?.announcementBar?.background_color ?? "#f0e5e7",
            text_color: body.announcementBar?.text_color ?? existing?.announcementBar?.text_color ?? "#000",
          },
          // Collection settings
          collection: body.collection || existing?.collection || {
            enabled: false,
            selectedCollection: { title: "", handle: "" }
          },
          // Product settings
          product: body.product || existing?.product || {
            enabled: false,
            selectedProduct: { handle: "", title: "", id: "" }
          },
          // Third-party Integration settings
          thirdPartyIntegration: {
            enabled: body.thirdPartyIntegration?.enabled ?? existing?.thirdPartyIntegration?.enabled ?? false,
            htmlContent: "" // Will be stored in metafield separately
          }
        },
        // Only set shop field when creating new document (not on updates)
        $setOnInsert: { shop }
      },
      {
        upsert: true,        // Create if doesn't exist
        new: true,           // Return updated document
        runValidators: true, // Run schema validators
        setDefaultsOnInsert: true // Apply default values on insert
      }
    ).lean(); // Return plain JavaScript object

    console.log("Database save successful, proceeding to metafield update...");

    // Step 6: Update shop metafields
    console.log("Starting metafield update process...");
    console.log("Admin object available:", !!admin);
    try {
      // Test basic GraphQL connectivity
      const testQuery = `
        query {
          shop {
            id
            name
          }
        }
      `;
      const testRes = await admin.graphql(testQuery);
      const testData = await testRes.json();
      console.log("GraphQL test response:", testData);

      if (testData.errors) {
        console.error("GraphQL test failed:", testData.errors);
        throw new Error("GraphQL client not working");
      }

      const namespace = "custom";

      // Get shop ID for metafield owner
      const shopQuery = `
        query {
          shop {
            id
          }
        }
      `;

      const shopRes = await admin.graphql(shopQuery);
      const shopData = await shopRes.json();
      console.log("Shop query response:", shopData);
      
      if (shopData.errors) {
        console.error("Errors in shop query:", shopData.errors);
        throw new Error("Failed to get shop ID");
      }
      
      const shopId = shopData.data.shop.id;
      console.log("Shop ID:", shopId);
      console.log("Request body collection:", body.collection);
      console.log("Request body product:", body.product);

      // Build metafields array - only include metafields with non-empty values
      // Shopify doesn't allow empty values in metafieldsSet mutation
      const metafields = [];

      // Metafield for collection handle
      const collectionHandle = (body.collection?.selectedCollection?.handle || "").trim();
      console.log("Collection handle to set:", collectionHandle || "(empty - will skip)");

      if (collectionHandle) {
        metafields.push({
          ownerId: shopId,
          namespace,
          key: "upsell_collection_handle",
          type: "single_line_text_field",
          value: collectionHandle,
        });
      }

      // Metafield for product handle
      const productHandle = (body.product?.selectedProduct?.handle || "").trim();
      console.log("Product handle to set:", productHandle || "(empty - will skip)");

      if (productHandle) {
        metafields.push({
          ownerId: shopId,
          namespace,
          key: "gift_product_handle",
          type: "single_line_text_field",
          value: productHandle,
        });
      }

      // Metafield for third-party checkout HTML/Liquid content
      const thirdPartyHtmlContent = (body.thirdPartyIntegration?.htmlContent || "").trim();
      console.log("Third-party HTML content to set:", thirdPartyHtmlContent ? "Content provided (length: " + thirdPartyHtmlContent.length + ")" : "Empty - will skip");

      // Only include if there's actual content (Shopify doesn't allow empty values)
      if (thirdPartyHtmlContent) {
        metafields.push({
          ownerId: shopId,
          namespace,
          key: "third_party_checkout_html",
          type: "multi_line_text_field",
          value: thirdPartyHtmlContent,
        });
      }

      console.log("Metafields array to update:", JSON.stringify(metafields, null, 2));

      // Only run mutation if there are metafields to update
      if (metafields.length > 0) {
        // Upsert metafields
        const mutation = `
          mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
              metafields {
                id
                key
                value
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const updateRes = await admin.graphql(mutation, {
          variables: { metafields },
        });

        const updateData = await updateRes.json();
        console.log("Metafields update response:", JSON.stringify(updateData, null, 2));

        if (updateData.errors) {
          console.error("GraphQL errors in metafield update:", JSON.stringify(updateData.errors, null, 2));
          throw new Error(`GraphQL errors: ${JSON.stringify(updateData.errors)}`);
        }

        if (updateData.data?.metafieldsSet?.userErrors?.length > 0) {
          const userErrors = updateData.data.metafieldsSet.userErrors;
          console.error("User errors in metafield update:", JSON.stringify(userErrors, null, 2));
          throw new Error(`Metafield user errors: ${JSON.stringify(userErrors)}`);
        }

        // Log success
        if (updateData.data?.metafieldsSet?.metafields?.length > 0) {
          console.log("✅ Metafields successfully created/updated:", updateData.data.metafieldsSet.metafields.map(m => `${m.key}: ${m.id}`).join(", "));
        }
      } else {
        console.log("No metafields to update");
      }

    } catch (metafieldError) {
      console.error("Error updating metafields:", metafieldError);
      // Don't fail the entire request if metafields update fails
    }

    // Step 7: Return saved settings
    return json(
      { ok: true, data: saved },
      { headers: cors(request) }
    );
  } catch (err) {
    // Handle database errors
    console.error("Error saving settings:", err);
    return json(
      { ok: false, error: err?.message || "Failed to save settings" },
      { status: 500, headers: cors(request) }
    );
  }
  } catch (outerErr) {
    // Catch any unexpected errors that might cause HTML error pages
    // This ensures we always return JSON, never HTML
    console.error("Unexpected error in settings API action:", outerErr);
    return json(
      { 
        ok: false, 
        error: outerErr?.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? outerErr?.stack : undefined
      },
      { status: 500, headers: cors(request) }
    );
  }
};

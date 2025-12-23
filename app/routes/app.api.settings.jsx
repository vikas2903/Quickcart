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

  // Step 1: Authenticate the admin request using Shopify authentication
  const { session } = await authenticate.admin(request);
  
  // Step 2: Extract shop domain from request headers or session
  // Priority: Header > Session > Empty string
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

  // Step 3: Connect to MongoDB database
  await connectDatabase();

  try {
    // Step 4: Query database for settings by shop domain
    // .lean() returns plain JavaScript object instead of Mongoose document (faster)
    const settings = await Settings.findOne({ shop }).lean();

    // Step 5: Return settings or default values if not found
    // This ensures the frontend always receives a complete settings object
    return json(
      {
        ok: true,
        data:
          settings || {
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
              border_radius: 10
            },
            // Announcement Bar settings
            announcementBar: {
              enabled: false,
              content: "Free shipping order above 999, Get 10% Off order above 1999"
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
              htmlContent: ""
            }
          }
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
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(request) });
  }

  // Step 1: Authenticate the admin request
  const { session } = await authenticate.admin(request);
  
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
    // Step 5: Update or create settings document
    // findOneAndUpdate with upsert: true will:
    //   - Update existing document if found
    //   - Create new document if not found
    const saved = await Settings.findOneAndUpdate(
      { shop }, // Query: Find document by shop domain
      {
        // Update operation: Set all settings fields
        $set: {
          // Countdown settings - can be sent as flat structure or nested
          countdown: {
            show_countdown: body.show_countdown ?? body.countdown?.show_countdown ?? false,
            count_down_bg: body.count_down_bg ?? body.countdown?.count_down_bg ?? "#5B9BD5",
            countdown_text_color: body.countdown_text_color ?? body.countdown?.countdown_text_color ?? "#ffffff",
            countdown_chip_bg: body.countdown_chip_bg ?? body.countdown?.countdown_chip_bg ?? "#ffffff",
            countdown_chip_text: body.countdown_chip_text ?? body.countdown?.countdown_chip_text ?? "#2c3e50",
            countdown_border_radius: body.countdown_border_radius ?? body.countdown?.countdown_border_radius ?? 50
          },
          // Cart Drawer settings
          cartDrawer: {
            body_color: body.body_color ?? body.cartDrawer?.body_color ?? "#f0e5e7",
            text_color: body.text_color ?? body.cartDrawer?.text_color ?? "#000",
            border_radius: body.border_radius ?? body.cartDrawer?.border_radius ?? 10
          },
          // Announcement Bar settings
          announcementBar: body.announcementBar || {
            enabled: false,
            content: "Free shipping order above 999, Get 10% Off order above 1999"
          },
          // Collection settings
          collection: body.collection || {
            enabled: false,
            selectedCollection: {
              title: "",
              handle: ""
            }
          },
          // Product settings
          product: body.product || {
            enabled: false,
            selectedProduct: {
              handle: "",
              title: "",
              id: ""
            }
          },
          // Third-party Integration settings
          thirdPartyIntegration: body.thirdPartyIntegration || {
            enabled: false,
            htmlContent: ""
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

    // Step 6: Return saved settings
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
};

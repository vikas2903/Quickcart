import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import connectDatabase from "../lib/dbconnect.js";
import { CartDrawerSettings } from "../models/cartdrawersettings.js";
import { cors } from "../utils/cors.js";

// GET: Load cart drawer settings
export const loader = async ({ request }) => {
  // Allow both authenticated (dashboard) and unauthenticated (extension) access
  let shop;
  try {
    const { session } = await authenticate.admin(request);
    shop = session.shop;
  } catch (e) {
    // If not authenticated, get shop from header (for extension access)
    shop = request.headers.get("X-Shopify-Shop-Domain") || 
           request.headers.get("x-shopify-shop-domain");
  }

  if (!shop) {
    return json(
      { ok: false, error: "Shop domain required" },
      { status: 400, headers: cors(request) }
    );
  }

  // Normalize shop domain
  shop = shop.toLowerCase().trim();
  if (!shop.includes('.')) {
    shop = shop + '.myshopify.com';
  }

  await connectDatabase();

  try {
    const settings = await CartDrawerSettings.findOne({ shop }).lean();
    
    if (!settings) {
      // Return defaults if no settings exist
      return json(
        {
          ok: true,
          data: {
            show_countdown: false,
            count_down_bg: "#5B9BD5",
            countdown_text_color: "#ffffff",
            countdown_chip_bg: "#ffffff",
            countdown_chip_text: "#2c3e50",
            countdown_border_radius: 50,
            countdown_chip_radius: 10,
            upsell_collection: "",
            primary_color: "#7c3444",
            body_color: "#f0e5e7",
            text_color: "#000",
            border_radius: 10,
            show_announcementbar_text: false,
            announcementbar_text: "Welcome to my shop!",
            show_gift_product: false,
            gift_wrap_product: "",
            show_checkout_field: false,
            checkout_integration_code: "",
            custom_css_code: "",
            enable_quickview_button: false,
            show_cart_button: false,
          },
        },
        { headers: cors(request) }
      );
    }

    return json({ ok: true, data: settings }, { headers: cors(request) });
  } catch (error) {
    console.error("Error loading cart drawer settings:", error);
    return json(
      { ok: false, error: error.message || "Failed to load settings" },
      { status: 500, headers: cors(request) }
    );
  }
};

// POST: Save cart drawer settings (requires authentication)
export const action = async ({ request }) => {
  await authenticate.admin(request);
  const { session } = await authenticate.admin(request);
  const shop = session.shop.toLowerCase().trim();

  await connectDatabase();

  try {
    const body = await request.json();

    // Build settings object with only provided fields to avoid overwriting existing values
    const settingsData = { shop };
    
    if (body.show_countdown !== undefined) settingsData.show_countdown = body.show_countdown;
    if (body.count_down_bg !== undefined) settingsData.count_down_bg = body.count_down_bg;
    if (body.countdown_text_color !== undefined) settingsData.countdown_text_color = body.countdown_text_color;
    if (body.countdown_chip_bg !== undefined) settingsData.countdown_chip_bg = body.countdown_chip_bg;
    if (body.countdown_chip_text !== undefined) settingsData.countdown_chip_text = body.countdown_chip_text;
    if (body.countdown_border_radius !== undefined) settingsData.countdown_border_radius = Number(body.countdown_border_radius);
    if (body.countdown_chip_radius !== undefined) settingsData.countdown_chip_radius = Number(body.countdown_chip_radius);
    if (body.upsell_collection !== undefined) settingsData.upsell_collection = body.upsell_collection;
    if (body.primary_color !== undefined) settingsData.primary_color = body.primary_color;
    if (body.body_color !== undefined) settingsData.body_color = body.body_color;
    if (body.text_color !== undefined) settingsData.text_color = body.text_color;
    if (body.border_radius !== undefined) settingsData.border_radius = Number(body.border_radius);
    if (body.show_announcementbar_text !== undefined) settingsData.show_announcementbar_text = body.show_announcementbar_text;
    if (body.announcementbar_text !== undefined) settingsData.announcementbar_text = body.announcementbar_text;
    if (body.show_gift_product !== undefined) settingsData.show_gift_product = body.show_gift_product;
    if (body.gift_wrap_product !== undefined) settingsData.gift_wrap_product = body.gift_wrap_product;
    if (body.show_checkout_field !== undefined) settingsData.show_checkout_field = body.show_checkout_field;
    if (body.checkout_integration_code !== undefined) settingsData.checkout_integration_code = body.checkout_integration_code;
    if (body.custom_css_code !== undefined) settingsData.custom_css_code = body.custom_css_code;
    if (body.enable_quickview_button !== undefined) settingsData.enable_quickview_button = body.enable_quickview_button;
    if (body.show_cart_button !== undefined) settingsData.show_cart_button = body.show_cart_button;

    console.log("CartDrawer API: Saving settings for shop:", shop);
    console.log("CartDrawer API: Settings data to save:", JSON.stringify(settingsData, null, 2));

    const savedSettings = await CartDrawerSettings.findOneAndUpdate(
      { shop },
      { $set: settingsData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    console.log("CartDrawer API: Saved settings:", JSON.stringify(savedSettings, null, 2));

    return json(
      { ok: true, data: savedSettings },
      { headers: cors(request) }
    );
  } catch (error) {
    console.error("Error saving cart drawer settings:", error);
    return json(
      { ok: false, error: error.message || "Failed to save settings" },
      { status: 500, headers: cors(request) }
    );
  }
};


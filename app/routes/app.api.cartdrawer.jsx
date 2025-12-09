import { json } from "@remix-run/node";
import { authenticate } from "../../shopify.server.js";
import connectDatabase from "../../lib/dbconnect.js";
import { CartDrawerSettings } from "../../models/cartdrawersettings.js";
import { cors } from "../../utils/cors.js";

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

    const settingsData = {
      shop,
      show_countdown: body.show_countdown ?? false,
      count_down_bg: body.count_down_bg || "#5B9BD5",
      countdown_text_color: body.countdown_text_color || "#ffffff",
      countdown_chip_bg: body.countdown_chip_bg || "#ffffff",
      countdown_chip_text: body.countdown_chip_text || "#2c3e50",
      countdown_border_radius: Number(body.countdown_border_radius) || 50,
      countdown_chip_radius: Number(body.countdown_chip_radius) || 10,
      upsell_collection: body.upsell_collection || "",
      primary_color: body.primary_color || "#7c3444",
      body_color: body.body_color || "#f0e5e7",
      text_color: body.text_color || "#000",
      border_radius: Number(body.border_radius) || 10,
      show_announcementbar_text: body.show_announcementbar_text ?? false,
      announcementbar_text: body.announcementbar_text || "Welcome to my shop!",
      show_gift_product: body.show_gift_product ?? false,
      gift_wrap_product: body.gift_wrap_product || "",
      show_checkout_field: body.show_checkout_field ?? false,
      checkout_integration_code: body.checkout_integration_code || "",
      custom_css_code: body.custom_css_code || "",
    };

    const savedSettings = await CartDrawerSettings.findOneAndUpdate(
      { shop },
      { $set: settingsData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

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


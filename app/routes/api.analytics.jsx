import { json } from "@remix-run/node";
import connectDatabase from "../lib/dbconnect.js";
import { AnalyticsEvent, AnalyticsDaily, AnalyticsProduct } from "../models/analytics.js";

// POST /api/analytics - Public endpoint for tracking analytics events from storefront
export const action = async ({ request }) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await request.json();
    const { eventType, eventData, sessionId, shop, shopName } = body;

    if (!eventType) {
      return json({ error: "eventType is required" }, { status: 400 });
    }

    // Get shop domain from request
    const domain = shop || shopName;
    if (!domain || !domain.includes('.myshopify.com')) {
      return json({ error: "Valid shop domain is required" }, { status: 400 });
    }

    await connectDatabase();

    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date();

    // Save event
    const event = new AnalyticsEvent({
      shopName: domain,
      eventType,
      eventData: eventData || {},
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp,
    });
    await event.save();

    // Update daily stats
    const dailyUpdate = {};
    switch (eventType) {
      case 'cart_open':
        dailyUpdate.$inc = { cartOpens: 1 };
        break;
      case 'checkout_click':
        dailyUpdate.$inc = { checkouts: 1 };
        break;
      case 'conversion':
        dailyUpdate.$inc = { 
          conversions: 1,
          revenue: eventData?.revenue || 0
        };
        break;
      case 'upsell_view':
        dailyUpdate.$inc = { upsellViews: 1 };
        break;
      case 'upsell_click':
        dailyUpdate.$inc = { upsellClicks: 1 };
        break;
      case 'upsell_add_to_cart':
        dailyUpdate.$inc = { 
          upsellAdds: 1,
          upsellRevenue: eventData?.revenue || 0
        };
        // Update product stats
        if (eventData?.productId) {
          await AnalyticsProduct.findOneAndUpdate(
            { shopName: domain, productId: eventData.productId },
            {
              $inc: {
                adds: 1,
                revenue: eventData.revenue || 0
              }
            },
            { upsert: true, new: true }
          );
        }
        break;
    }

    if (dailyUpdate.$inc) {
      await AnalyticsDaily.findOneAndUpdate(
        { shopName: domain, date: today },
        dailyUpdate,
        { upsert: true, new: true }
      );
    }

    // Update product stats for views and clicks
    if (eventType === 'upsell_view' && eventData?.productId) {
      await AnalyticsProduct.findOneAndUpdate(
        { shopName: domain, productId: eventData.productId },
        { $inc: { views: 1 } },
        { upsert: true, new: true }
      );
    }

    if (eventType === 'upsell_click' && eventData?.productId) {
      await AnalyticsProduct.findOneAndUpdate(
        { shopName: domain, productId: eventData.productId },
        { $inc: { clicks: 1 } },
        { upsert: true, new: true }
      );
    }

    return json({ success: true, eventId: event._id });
  } catch (error) {
    console.error("Analytics API error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};

// CORS headers for cross-origin requests
export const headers = () => {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
};

// Handle OPTIONS for CORS preflight
export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
};


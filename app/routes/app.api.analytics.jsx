import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import connectDatabase from "../lib/dbconnect.js";
import { AnalyticsEvent, AnalyticsDaily, AnalyticsProduct } from "../models/analytics.js";

// POST /app/api/analytics - Track analytics event
export const action = async ({ request }) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    let shopName;
    let body;
    
    // Try to get shop from authenticated session (admin dashboard)
    try {
      const { session } = await authenticate.admin(request);
      shopName = session.shop;
      body = await request.json();
    } catch (authError) {
      // If not authenticated, try to get shop from request body (storefront)
      body = await request.json();
      shopName = body.shop || body.shopName;
      
      // Validate shop domain format
      if (!shopName || !shopName.includes('.myshopify.com')) {
        return json({ error: "Invalid shop domain" }, { status: 400 });
      }
    }

    const { eventType, eventData, sessionId } = body;

    if (!eventType) {
      return json({ error: "eventType is required" }, { status: 400 });
    }

    await connectDatabase();

    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date();

    // Save event
    const event = new AnalyticsEvent({
      shopName,
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
            { shopName, productId: eventData.productId },
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
        { shopName, date: today },
        dailyUpdate,
        { upsert: true, new: true }
      );
    }

    // Update product stats for views and clicks
    if (eventType === 'upsell_view' && eventData?.productId) {
      await AnalyticsProduct.findOneAndUpdate(
        { shopName, productId: eventData.productId },
        { $inc: { views: 1 } },
        { upsert: true, new: true }
      );
    }

    if (eventType === 'upsell_click' && eventData?.productId) {
      await AnalyticsProduct.findOneAndUpdate(
        { shopName, productId: eventData.productId },
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

// GET /app/api/analytics - Get analytics data
export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shopName = session.shop;

    await connectDatabase();

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "30");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get daily stats
    const dailyStats = await AnalyticsDaily.find({
      shopName,
      date: { $gte: startDateStr }
    }).sort({ date: 1 }).lean();

    // Get product stats
    const productStats = await AnalyticsProduct.find({
      shopName
    }).sort({ adds: -1 }).limit(20).lean();

    // Calculate totals
    const totals = dailyStats.reduce((acc, day) => {
      acc.cartOpens += day.cartOpens || 0;
      acc.checkouts += day.checkouts || 0;
      acc.conversions += day.conversions || 0;
      acc.upsellViews += day.upsellViews || 0;
      acc.upsellClicks += day.upsellClicks || 0;
      acc.upsellAdds += day.upsellAdds || 0;
      acc.revenue += day.revenue || 0;
      acc.upsellRevenue += day.upsellRevenue || 0;
      return acc;
    }, {
      cartOpens: 0,
      checkouts: 0,
      conversions: 0,
      upsellViews: 0,
      upsellClicks: 0,
      upsellAdds: 0,
      revenue: 0,
      upsellRevenue: 0,
    });

    // Calculate rates
    const upsellClickRate = totals.upsellViews > 0 
      ? (totals.upsellClicks / totals.upsellViews * 100) 
      : 0;
    
    const upsellConversionRate = totals.upsellClicks > 0
      ? (totals.upsellAdds / totals.upsellClicks * 100)
      : 0;

    const overallUpsellRate = totals.cartOpens > 0
      ? (totals.upsellAdds / totals.cartOpens * 100)
      : 0;

    const checkoutConversionRate = totals.checkouts > 0
      ? (totals.conversions / totals.checkouts * 100)
      : 0;

    const cartToCheckoutRate = totals.cartOpens > 0
      ? (totals.checkouts / totals.cartOpens * 100)
      : 0;

    const avgCartValue = totals.conversions > 0
      ? totals.revenue / totals.conversions
      : 0;

    return json({
      totals,
      dailyStats,
      productStats,
      metrics: {
        upsellClickRate: parseFloat(upsellClickRate.toFixed(2)),
        upsellConversionRate: parseFloat(upsellConversionRate.toFixed(2)),
        overallUpsellRate: parseFloat(overallUpsellRate.toFixed(2)),
        checkoutConversionRate: parseFloat(checkoutConversionRate.toFixed(2)),
        cartToCheckoutRate: parseFloat(cartToCheckoutRate.toFixed(2)),
        avgCartValue: parseFloat(avgCartValue.toFixed(2)),
      }
    });
  } catch (error) {
    console.error("Analytics loader error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};


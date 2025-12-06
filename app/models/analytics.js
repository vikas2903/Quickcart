// models/analytics.js
import mongoose from "mongoose";

const AnalyticsEventSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'cart_open',
        'checkout_click',
        'conversion',
        'upsell_view',
        'upsell_click',
        'upsell_add_to_cart'
      ],
    },
    eventData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sessionId: {
      type: String,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const AnalyticsDailySchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    cartOpens: { type: Number, default: 0 },
    checkouts: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    upsellViews: { type: Number, default: 0 },
    upsellClicks: { type: Number, default: 0 },
    upsellAdds: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    upsellRevenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for daily stats
AnalyticsDailySchema.index({ shopName: 1, date: 1 }, { unique: true });

const AnalyticsProductSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    adds: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for product stats
AnalyticsProductSchema.index({ shopName: 1, productId: 1 }, { unique: true });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent || mongoose.model("AnalyticsEvent", AnalyticsEventSchema);

export const AnalyticsDaily =
  mongoose.models.AnalyticsDaily || mongoose.model("AnalyticsDaily", AnalyticsDailySchema);

export const AnalyticsProduct =
  mongoose.models.AnalyticsProduct || mongoose.model("AnalyticsProduct", AnalyticsProductSchema);


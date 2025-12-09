import mongoose from "mongoose";

const CartDrawerSettingsSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true, unique: true, index: true },
    
    // Countdown/Timer Settings
    show_countdown: { type: Boolean, default: false },
    count_down_bg: { type: String, default: "#5B9BD5" },
    countdown_text_color: { type: String, default: "#ffffff" },
    countdown_chip_bg: { type: String, default: "#ffffff" },
    countdown_chip_text: { type: String, default: "#2c3e50" },
    countdown_border_radius: { type: Number, default: 50, min: 0, max: 50 },
    countdown_chip_radius: { type: Number, default: 10, min: 0, max: 20 },
    
    // Upsell Settings
    upsell_collection: { type: String, default: "" },
    
    // Color Settings
    primary_color: { type: String, default: "#7c3444" },
    body_color: { type: String, default: "#f0e5e7" },
    text_color: { type: String, default: "#000" },
    border_radius: { type: Number, default: 10, min: 1, max: 100 },
    
    // Announcement Bar Settings
    show_announcementbar_text: { type: Boolean, default: false },
    announcementbar_text: { type: String, default: "Welcome to my shop!" },
    
    // Gift Product Settings
    show_gift_product: { type: Boolean, default: false },
    gift_wrap_product: { type: String, default: "" },
    
    // Checkout Settings
    show_checkout_field: { type: Boolean, default: false },
    checkout_integration_code: { type: String, default: "" },
    
    // Custom CSS
    custom_css_code: { type: String, default: "" },
  },
  { timestamps: true }
);

export const CartDrawerSettings =
  mongoose.models.CartDrawerSettings ||
  mongoose.model("CartDrawerSettings", CartDrawerSettingsSchema);


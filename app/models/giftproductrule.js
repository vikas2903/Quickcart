// import mongoose from "mongoose";

// const SelectedProductSchema = new mongoose.Schema(
//   {
//     id: {
//       type: String,
//       required: true, // e.g. "gid://shopify/Product/8063169691682"
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     handle: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     // Store in major units (e.g., 1999.0 for "199900.0")
//     price: {
//       type: Number,
//       required: true,
//       set: (v) => {
//         if (v === null || v === undefined || v === "") return 0;
//         const n = Number(v);
//         return Number.isNaN(n) ? 0 : n / 100;
//       },
//     },
//   },
//   { _id: false }
// );

// const GiftProductRuleSchema = new mongoose.Schema(
//   {
//     shop: { type: String, required: true, index: true }, // e.g. "d2c-apps.myshopify.com"
//     enabled: { type: Boolean, default: false },
//     // Order minimum threshold (keep as major units; do NOT divide)
//     price: {
//       type: Number,
//       required: true,
//       set: (v) => {
//         if (v === null || v === undefined || v === "") return 0;
//         const n = Number(v);
//         return Number.isNaN(n) ? 0 : n;
//       },
//     },
//     selectedProduct: {
//       type: SelectedProductSchema,
//       required: false,
//     },
//   },
//   { timestamps: true }
// );

// export const GiftProductRule =
//   mongoose.models.GiftProductRule ||
//   mongoose.model("GiftProductRule", GiftProductRuleSchema);

import mongoose from "mongoose";

const GiftProductRuleSchema = new mongoose.Schema(
  {
    shop: { type: String, required: true, index: true },   // "d2c-apps.myshopify.com"
    enabled: { type: Boolean, default: false },            // false
    price: { type: Number, required: true },               // e.g. Number("100") => 100
    selectedProduct: {
      id: { type: String },                                 // "gid://shopify/Product/..."
      title: { type: String },                              // "Dark Purple Shimmer..."
      handle: { type: String },                             // "dark-purple-shimmer..."
      price: { type: Number },                              // store major units (1999 from "199900.0")
    },
  },
  { timestamps: true }
);

// models/giftproductrule.js
export const GiftProductRule =
  mongoose.models.GiftProductRule ||
  mongoose.model("GiftProductRule", GiftProductRuleSchema);

// app/models/bxgyRule.js
import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    enabled: { type: Boolean, default: false },
    buyQty: { type: Number, min: 1, default: 2 },

    // Store Admin GraphQL Product GIDs (e.g. "gid://shopify/Product/123...")
    buyProductIds: { type: [String], default: [] },
    freeProductId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const BxgyRule =
  mongoose.models.BxgyRule || mongoose.model("BxgyRule", schema);
 
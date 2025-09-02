// app/models/BxgyConfig.js
import mongoose from "mongoose";

const BxgyConfigSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true, unique: true, lowercase: true, trim: true },
    enabled: { type: Boolean, default: false },
    offer: {
      buyQty: { type: Number, required: true, min: 1 },
      getQty: { type: Number, required: true, min: 1 },
    },
    messages: {
      remainingMany: { type: String, required: true },
      remainingOne:  { type: String, required: true },
      unlocked:      { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const BxgyConfig =
  mongoose.models.BxgyConfig || mongoose.model("BxgyConfig", BxgyConfigSchema);

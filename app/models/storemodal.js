// models/Store.js
import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    uninstalledAt: {
      type: Date,
      default: null,
    },
  },
  // Use your preferred field names for timestamps
  { timestamps: { createdAt: "installedAt", updatedAt: "updatedAt" } }
);

export const Store =
  mongoose.models.Store || mongoose.model("Store", StoreSchema);

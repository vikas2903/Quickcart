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
      // Legacy/alias field: some older deployments created an index on `shop`.
      // We include it here (without creating a new unique index) so documents
      // written by the app include either field and avoid duplicate-null issues.
      shop: {
        type: String,
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

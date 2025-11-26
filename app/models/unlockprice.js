import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true, min: 0 },
    text:  { type: String, required: true, trim: true },
  },
  { _id: false }
);

const discountMilestoneSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    enabled:   { type: Boolean, default: true },
    progressBarColor: { type: String, default: "#000000" },
    milestones: {
      type: [milestoneSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one milestone is required",
      },
    },
  },
  { timestamps: true }
);

export const DiscountMilestone =
  mongoose.models.DiscountMilestone ||
  mongoose.model("DiscountMilestone", discountMilestoneSchema);

import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  qty: { type: Number, required: true, min: 1 },
  label: { type: String, required: true }
}, { _id: false });

const quantityBasedDiscountSchema = new mongoose.Schema({
  shop: { type: String, required: true, index: true, unique: true },
  enabled: { type: Boolean, required: true },
  color: { type: String, required: true },
  steps: {
    type: [stepSchema],
    validate: v => v.length > 0
  }

}, { timestamps: true });

export default mongoose.models.quantityBasedProgressBar ||
  mongoose.model('quantityBasedProgressBar', quantityBasedDiscountSchema);


//   {
//   "enabled": true,
//   "color": "#c20000",
//   "steps": [
//     { "qty": 1, "label": "10% OFF" },
//     { "qty": 2, "label": "15% OFF" },
//     { "qty": 3, "label": "20% OFF" }
//   ]
// }
import mongoose from "mongoose";
const { Schema } = mongoose;

const milestoneItemSchema = new Schema({
    value: { type: Number, required: true },
    text: { type: String, required: true }
}, { _id: false });

const milestonesSchema = new Schema({
    price: [milestoneItemSchema],
    quantity: [milestoneItemSchema]
}, { _id: false });

const collectionSchema = new Schema({
    storeName: { type: String, required: true },
    collectionTag: { type: String, required: true, trim: true },
    progressbarEnabled: { type: Boolean, required: true },
    mode: { type: String,  enum: ['price', 'quantity'], required: true},
    milestones: milestonesSchema
});

export default mongoose.models.CollectionbasedProgress ||
    mongoose.model('CollectionbasedProgress', collectionSchema);

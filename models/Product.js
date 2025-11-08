import mongoose from "mongoose";
const { Schema } = mongoose;

const ProductSchema = new Schema({
    productId: { type: String, required: true }, // off-chain SKU / ID
    sellerAddress: { type: String, required: true },
    name: String,
    description: String,
    unitPriceSmallest: { type: String, required: true }, // price per unit in smallest USDC units (string)
    unitsNeeded: { type: Number, required: true },
    dueTimestamp: { type: Number, required: true }, // unix seconds
    escrowAddress: { type: String },
    status: { type: String, enum: ["open", "pooled", "released", "refunded", "closed"], default: "open" }
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);

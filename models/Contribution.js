import mongoose from "mongoose";
const { Schema } = mongoose;

const ContributionSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product" },
  escrowAddress: String,
  buyerAddress: String,
  units: Number,
  amountSmallest: String,
  txHash: String,
  verified: { type: Boolean, default: false },
  refunded: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Contribution", ContributionSchema);

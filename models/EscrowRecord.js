import mongoose from "mongoose";
const { Schema } = mongoose;

const EscrowRecordSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    escrowAddress: String,
    totalUnitsCommitted: { type: Number, default: 0 },
    totalAmountSmallest: { type: String, default: "0" }, // string for bigint
    fundsReleased: { type: Boolean, default: false },
    refundsEnabled: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("EscrowRecord", EscrowRecordSchema);

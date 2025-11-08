import Contribution from "../models/Contribution.js";
export const save = (obj) => new Contribution(obj).save();
export const findByEscrow = (escrowAddress) => Contribution.find({ escrowAddress });
export const findByTx = (txHash) => Contribution.findOne({ txHash });
export const setVerified = (id) => Contribution.findByIdAndUpdate(id, { verified: true }, { new: true });
export const sumUnitsForProduct = async (productId) => {
    const rows = await Contribution.find({ product: productId, verified: true });
    return rows.reduce((s, r) => s + (r.units || 0), 0);
};

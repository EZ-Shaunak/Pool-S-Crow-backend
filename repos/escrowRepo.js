import EscrowRecord from "../models/EscrowRecord.js";
export const create = (obj) => new EscrowRecord(obj).save();
export const findByProduct = (productId) => EscrowRecord.findOne({ product: productId });
export const update = (id, obj) => EscrowRecord.findByIdAndUpdate(id, obj, { new: true });
export const findByEscrow = (escrowAddr) => EscrowRecord.findOne({ escrowAddress: escrowAddr });

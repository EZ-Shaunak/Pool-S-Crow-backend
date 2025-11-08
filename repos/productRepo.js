import Product from "../models/Product.js";
export const saveProduct = (obj) => new Product(obj).save();
export const findById = (id) => Product.findById(id);
export const findByEscrow = (escrow) => Product.findOne({ escrowAddress: escrow });
export const listOpen = () => Product.find({ status: { $in: ["open", "pooled"] } });
export const updateStatus = (id, status) => Product.findByIdAndUpdate(id, { status }, { new: true });
export const updateEscrowAddress = (id, escrowAddress) => Product.findByIdAndUpdate(id, { escrowAddress }, { new: true });

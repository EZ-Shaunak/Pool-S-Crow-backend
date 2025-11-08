import * as blockchain from "./blockchainService.js";
import * as escrowRepo from "../repos/escrowRepo.js";
import * as productRepo from "../repos/productRepo.js";

/** Operator releases all funds to seller (calls releaseToSeller) */
export async function releaseEscrow(escrowAddress) {
    const receipt = await blockchain.getEscrowContract(escrowAddress, process.env.OPERATOR_ADDR).releaseToSeller();
    // update DB
    const rec = await escrowRepo.findByEscrow(escrowAddress);
    if (rec) await escrowRepo.update(rec._id, { fundsReleased: true });
    const prod = await productRepo.findByEscrow(escrowAddress);
    if (prod) await productRepo.updateStatus(prod._id, "released");
    return receipt;
}

/** Operator enables refund mode (refundAll) */
export async function refundEscrow(escrowAddress) {
    const receipt = await blockchain.getEscrowContract(escrowAddress, blockchain.operator).refundAll();
    const rec = await escrowRepo.findByEscrow(escrowAddress);
    if (rec) await escrowRepo.update(rec._id, { refundsEnabled: true });
    const prod = await productRepo.findByEscrow(escrowAddress);
    if (prod) await productRepo.updateStatus(prod._id, "refunded");
    return receipt;
}

/** Operator can partialRefund a buyer address (calls partialRefund(buyer)) */
export async function partialRefund(escrowAddress, buyerAddress) {
    const receipt = await blockchain.getEscrowContract(escrowAddress, blockchain.operator).partialRefund(buyerAddress);
    return receipt;
}

import * as contribRepo from "../repos/contribRepo.js";
import * as escrowRepo from "../repos/escrowRepo.js";
import * as productRepo from "../repos/productRepo.js";
import * as blockchain from "./blockchainService.js";
import { ethers } from "ethers";

/**
 * Verify deposit txHash: parse deposit event from tx receipt and update DB.
 * Assumes Escrow.depositForUnits or DepositReceived event with args (buyer, units, amount)
 */
export async function verifyAndRecordContribution({ productId, escrowAddress, buyerAddress, txHash, units }) {
    // Validate tx receipt
    const receipt = await blockchain.getEscrowContract(escrowAddress).provider.getTransactionReceipt(txHash);
    if (!receipt) throw new Error("Tx not mined");
    if (receipt.status !== 1) throw new Error("Tx failed");

    // Parse logs against escrow ABI
    const escrowIface = new ethers.Interface((await import("../contracts/Escrow.json", { assert: { type: "json" } })).abi);
    const parsed = receipt.logs.map(l => { try { return escrowIface.parseLog(l); } catch { return null; } }).filter(Boolean);
    const depositEvt = parsed.find(e => e.name === "DepositReceived" || e.name === "Deposit");
    if (!depositEvt) throw new Error("Deposit event not found in tx logs");

    const buyerOnChain = depositEvt.args[0];
    const unitsOnChain = Number(depositEvt.args[1].toString());
    const amountOnChain = depositEvt.args[2].toString();

    if (buyerOnChain.toLowerCase() !== buyerAddress.toLowerCase()) {
        throw new Error("Buyer mismatch");
    }
    if (unitsOnChain !== Number(units)) {
        throw new Error("Units mismatch");
    }

    // save contribution
    const product = await productRepo.findByEscrow(escrowAddress);
    const contrib = await contribRepo.save({
        product: product?._id,
        escrowAddress,
        buyerAddress,
        units: unitsOnChain,
        amountSmallest: amountOnChain,
        txHash,
        verified: true
    });

    // update escrow record totals
    const escRec = await escrowRepo.findByProduct(product._id);
    const totalUnits = await contribRepo.sumUnitsForProduct(product._id);
    // sum totalAmountSmallest
    const contributions = await contribRepo.findByEscrow(escrowAddress);
    const totalAmount = contributions.reduce((s, c) => s + BigInt(c.amountSmallest || "0"), 0n);
    await escrowRepo.update(escRec._id, {
        totalUnitsCommitted: totalUnits,
        totalAmountSmallest: totalAmount.toString()
    });

    // check MOQ:
    if (totalUnits >= product.unitsNeeded) {
        await productRepo.updateStatus(product._id, "pooled");
        // auto release?
        if (true) {
            // call release op service in background (non-blocking)
            (await import("./escrowOpService.js")).releaseEscrow(escRec.escrowAddress).catch(console.error);
        }
    }

    return { contrib, totalUnits, totalAmount: totalAmount.toString() };
}

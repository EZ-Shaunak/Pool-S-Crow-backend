import * as productRepo from "../repos/productRepo.js";
import * as escrowRepo from "../repos/escrowRepo.js";
import * as blockchain from "./blockchainService.js";

/**
 * seller creates listing -> create product in DB -> call factory -> create escrow record
 * unitPriceSmallest MUST be string with smallest units (use parseUnits on frontend)
 */
export async function createListing(payload) {
    const {
        productId, name, description, sellerAddress, unitPriceSmallest, unitsNeeded, dueTimestamp
    } = payload;

    const product = await productRepo.saveProduct({
        productId, name, description, sellerAddress,
        unitPriceSmallest, unitsNeeded, dueTimestamp, status: "open"
    });

    // create escrow on chain
    const { escrowAddress, txHash } = await blockchain.createEscrowOnChain(
        sellerAddress,
        product.productId || productId,
        unitPriceSmallest,
        unitsNeeded,
        dueTimestamp
    );

    await productRepo.updateEscrowAddress(product._id, escrowAddress);

    // create escrow record
    await escrowRepo.create({
        product: product._id,
        escrowAddress,
        totalUnitsCommitted: 0,
        totalAmountSmallest: "0"
    });

    return { product, escrowAddress, txHash };
}

export const listOpenListings = () => productRepo.listOpen();

export const getProductByEscrow = (escrowAddress) => productRepo.findByEscrow(escrowAddress);
export const getProductById = (id) => productRepo.findById(id);

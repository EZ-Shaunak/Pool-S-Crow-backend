import * as productService from "../services/productService.js";
import * as contribService from "../services/contributionService.js";
import * as contribRepo from "../repos/contribRepo.js";

export async function viewListings(req, res) {
    try {
        const listings = await productService.listOpenListings();
        res.json({ success: true, listings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function joinPoolVerify(req, res) {
    try {
        const { productId, escrowAddress, buyerAddress, txHash, units } = req.body;
        const result = await contribService.verifyAndRecordContribution({ productId, escrowAddress, buyerAddress, txHash, units });
        res.json({ success: true, result });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

export async function getContributions(req, res) {
    try {
        const escrowAddress = req.params.escrowAddress;
        const contributions = await contribRepo.findByEscrow(escrowAddress);
        res.json({ success: true, contributions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

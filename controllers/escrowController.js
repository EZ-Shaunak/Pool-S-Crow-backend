import * as escrowOp from "../services/escrowOpService.js";
import * as blockchain from "../services/blockchainService.js";

export async function getStatus(req, res) {
    try {
        const escrowAddress = req.params.escrowAddress;
        const product = await (await import("../repos/productRepo.js")).findByEscrow(escrowAddress);
        const rec = await (await import("../repos/escrowRepo.js")).findByEscrow(escrowAddress);
        const onChainBalance = await blockchain.getUSDCBalanceOf(escrowAddress);
        res.json({ success: true, product, record: rec, onChainBalance });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function release(req, res) {
    try {
        const { escrowAddress } = req.body;
        const r = await escrowOp.releaseEscrow(escrowAddress);
        res.json({ success: true, txHash: r.transactionHash });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

export async function refund(req, res) {
    try {
        const { escrowAddress } = req.body;
        const r = await escrowOp.refundEscrow(escrowAddress);
        res.json({ success: true, txHash: r.transactionHash });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
// import EscrowFactoryJson from "../contracts/EscrowFactory.json" assert { type: "json" };
// import EscrowJson from "../contracts/Escrow.json" assert { type: "json" };
// import ERC20Json from "../contracts/ERC20.json" assert { type: "json" };
import dotenv from "dotenv";
dotenv.config();

const factoryPath = path.resolve("./contracts/EscrowFactory.json");
const EscrowFactoryJson = JSON.parse(fs.readFileSync(factoryPath, "utf8"));

const escrowPath = path.resolve("./contracts/Escrow.json");
const EscrowJson = JSON.parse(fs.readFileSync(escrowPath, "utf8"));

const erc20Path = path.resolve("./contracts/ERC20.json");
const ERC20Json = JSON.parse(fs.readFileSync(erc20Path, "utf8"));

const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC);
const operator = new ethers.Wallet(process.env.OPERATOR_PRIVATE_KEY, provider);

const factory = new ethers.Contract(process.env.FACTORY_ADDRESS, EscrowFactoryJson.abi, operator);

export async function createEscrowOnChain(seller, productId, unitPriceSmallest, unitsNeeded, dueTs) {
    // factory.createEscrow(seller, productId, unitPrice, unitsNeeded, dueTimestamp)
    const tx = await factory.createEscrow(seller, productId, BigInt(unitPriceSmallest), unitsNeeded, dueTs);
    const receipt = await tx.wait();
    // parse event
    const parsed = receipt.logs.map(l => {
        try { return factory.interface.parseLog(l); } catch { return null; }
    }).filter(Boolean);
    const evt = parsed.find(e => e.name === "EscrowCreated");
    if (!evt) throw new Error("EscrowCreated event not found");
    const escrowAddress = evt.args.escrow;
    return { escrowAddress, txHash: tx.hash };
}

export function getEscrowContract(escrowAddress, signerOrProvider = provider) {
    return new ethers.Contract(escrowAddress, EscrowJson.abi, signerOrProvider);
}

export function getUSDCContract(signerOrProvider = provider) {
    return new ethers.Contract(process.env.USDC_ADDRESS, ERC20Json, signerOrProvider);
}

export async function getUSDCBalanceOf(address) {
    const usdc = getUSDCContract();
    const bal = await usdc.balanceOf(address);
    return bal.toString(); // smallest units
}

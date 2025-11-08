import { ethers } from "ethers";
// import EscrowFactoryJson from "../contracts/EscrowFactory.json";
// import EscrowJson from "../contracts/Escrow.json";
import fs from "fs";
import path from "path";

const factoryPath = path.resolve("./contracts/EscrowFactory.json");
const factoryInterface = JSON.parse(fs.readFileSync(factoryPath, "utf8"));

const escrowPath = path.resolve("./contracts/Escrow.json");
const escrowInterface = JSON.parse(fs.readFileSync(escrowPath, "utf8"));

const erc20Path = path.resolve("./contracts/ERC20.json");
const ERC20Json = JSON.parse(fs.readFileSync(erc20Path, "utf8"));

const provider = new ethers.JsonRpcProvider(process.env.ARC_RPC);
// const factoryInterface = new ethers.Interface(EscrowFactoryJson.abi);
// const escrowInterface = new ethers.Interface(EscrowJson.abi);

let lastFactoryBlock = 0;
let lastEscrowBlockMap = {}; // escrowAddress => lastBlock

// Poll factory for EscrowCreated events
const pollFactoryEvents = async () => {
    try {
        const latestBlock = await provider.getBlockNumber();
        if (!lastFactoryBlock) lastFactoryBlock = latestBlock - 10;

        const logs = await provider.getLogs({
            address: ethers.getAddress(process.env.FACTORY_ADDRESS),
            fromBlock: lastFactoryBlock + 1,
            toBlock: latestBlock,
        });

        for (const log of logs) {
            let parsed;
            try {
                parsed = factoryInterface.parseLog(log);
            } catch {
                // Skip logs that do not match this ABI
                continue;
            }
            if (!parsed) continue;

            if (parsed.name === "EscrowCreated") {
                const { escrow, seller, productId } = parsed.args;
                console.log(`🆕 Escrow Created: ${escrow}, Product ID: ${productId}, Seller: ${seller}`);
                lastEscrowBlockMap[escrow.toLowerCase()] = latestBlock;
            }
        }

        lastFactoryBlock = latestBlock;
    } catch (err) {
        console.error("Error polling factory events:", err);
    }
};

// Poll escrow contracts for Contributed & ReleasedToSeller
const pollEscrowEvents = async () => {
    try {
        for (const escrowAddress of Object.keys(lastEscrowBlockMap)) {
            const lastBlock = lastEscrowBlockMap[escrowAddress];
            const latestBlock = await provider.getBlockNumber();
            const logs = await provider.getLogs({
                address: escrowAddress,
                fromBlock: lastBlock + 1,
                toBlock: latestBlock,
            });

            for (const log of logs) {
                let parsed;
                try {
                    parsed = escrowInterface.parseLog(log);
                } catch {
                    continue; // skip non-matching logs
                }
                if (!parsed) continue;

                if (parsed.name === "Contributed") {
                    const { buyer, units, amount } = parsed.args;
                    console.log(`💰 Contribution: Buyer ${buyer} contributed ${units} units for ${amount} USDC`);
                } else if (parsed.name === "ReleasedToSeller") {
                    const { amount } = parsed.args;
                    console.log(`🏁 Released to seller: ${amount} USDC`);
                }
            }

            lastEscrowBlockMap[escrowAddress] = latestBlock;
        }
    } catch (err) {
        console.error("Error polling escrow events:", err);
    }
};

// Start polling automatically
export const startEventListener = () => {
    // every 10 seconds
    setInterval(async () => {
        await pollFactoryEvents();
        await pollEscrowEvents();
    }, 10000);
};

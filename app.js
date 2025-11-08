import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import escrowRoutes from "./routes/escrowRoutes.js";
import { startEventListener } from "./services/eventListener.js";

import fs from "fs";
import path from "path";
dotenv.config();


await connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/seller", sellerRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/escrow", escrowRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
    // Load Escrow ABI
    const escrowPath = path.resolve("./contracts/Escrow.json");
    const escrowJson = JSON.parse(fs.readFileSync(escrowPath, "utf8"));

    // Start listener automatically
    startEventListener();
});


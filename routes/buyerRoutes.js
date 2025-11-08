import express from "express";
import { viewListings, joinPoolVerify, getContributions } from "../controllers/buyerController.js";
const router = express.Router();
router.get("/listings", viewListings);
router.post("/verify", joinPoolVerify); // buyer posts txHash for verification
router.get("/contributions/:escrowAddress", getContributions);
export default router;

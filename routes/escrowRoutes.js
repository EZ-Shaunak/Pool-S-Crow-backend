import express from "express";
import { getStatus, release, refund } from "../controllers/escrowController.js";
const router = express.Router();
router.get("/status/:escrowAddress", getStatus);
router.post("/release", release);
router.post("/refund", refund);
export default router;

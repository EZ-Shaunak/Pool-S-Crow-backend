import express from "express";
import { list, listOpen } from "../controllers/sellerController.js";
const router = express.Router();
router.post("/list", list);
router.get("/listings", listOpen);
export default router;

import express from "express";
import { getRetailerDashboard } from "../controllers/retailerController.js";

const router = express.Router();

// GET retailer dashboard
router.get("/:retailerId/dashboard", getRetailerDashboard);

export default router;

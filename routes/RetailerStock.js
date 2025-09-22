// routes/Retailerstock.js
import express from "express";
import RetailerStock from "../models/RetailerStock.js";
const router = express.Router();

// Get all stock for a retailer
router.get("/:retailerId", async (req, res) => {
  try {
    const stocks = await RetailerStock.find({ retailerId: req.params.retailerId })
      .populate("productId")
      .populate("supplierId", "name");
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stocks", error: err.message });
  }
});

export default router;

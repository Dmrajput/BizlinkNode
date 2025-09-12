// routes/stockHistoryRoutes.js
import express from "express";
import {  getAllStockHistory } from "../controllers/stockHistoryController.js";

const router = express.Router();

// router.get("/:productId", getStockHistory); // per product
router.get("/", getAllStockHistory);        // global

export default router;

import express from "express";
import {
  getOrdersByUser,
  Checkout,
  getUserOrders
} from "../controllers/ordersController.js";

const router = express.Router();

// Products
// router.get("/products", browseProducts);

// Cart
// router.get("/cart/:userId", getCart);
// router.post("/cart", addToCart);
router.get("/:userId", getOrdersByUser);
router.post("/:userId/:supplierId", Checkout);
router.get("/user/:userId", getUserOrders);   // ✅ get all orders for user
// router.delete("/cart/:userId/:productId", removeFromCart);
// router.post("/checkout/:userId", checkout);

export default router;

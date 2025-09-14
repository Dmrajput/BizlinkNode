import express from "express";
import {
  getOrdersByUser,
  Checkout,
  getUserOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/ordersController.js";

const router = express.Router();

// Products
// router.get("/products", browseProducts);

// Cart
// router.get("/cart/:userId", getCart);
// router.post("/order", update);
router.get("/:userId", getOrdersByUser);
router.post("/:userId/:supplierId", Checkout);
router.get("/user/:userId", getUserOrders);   // ✅ get all orders for user
router.get("/order/:orderId", getOrderById); 
router.put("/:orderId/status", updateOrderStatus); 

// GET /api/orders/order/:orderId → Single order details.
// router.delete("/cart/:userId/:productId", removeFromCart);
// router.post("/checkout/:userId", checkout);

export default router;

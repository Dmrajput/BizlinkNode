import express from "express";
import {
  browseProducts,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  Checkout,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/supplierController.js";

const router = express.Router();

// Product browsing
router.get("/browse", browseProducts);
// router.get("/:userId", getCart);
// router.post("/cart/add", addToCart);
// router.put("/cart/update", updateCartItem);
// router.delete("/cart/remove", removeFromCart);

router.get("/:userId", getCart);                // ✅ GET user cart
router.post("/", addToCart);                    // ✅ Add product to cart
router.put("/:userId", updateCartItem);         // ✅ Update qty
router.delete("/:userId/:productId", removeFromCart); // ✅ Remove product
// router.post("/:userId", Checkout);                    // ✅ Add product to cart
router.post("/:userId", Checkout);
// router.get("/:userId", getOrderById);
router.get("/user/:userId", getUserOrders);   // ✅ get all orders for user
router.get("/details/:orderId", getOrderById); // ✅ get single order details
router.put("/cancel/:orderId", cancelOrder);


export default router;

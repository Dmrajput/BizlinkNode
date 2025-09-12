import express from "express";
import OfflineCart from "../models/OfflineCart.js";

const router = express.Router();

/**
 * ➕ Add or Update Cart Item
 */
router.post("/", async (req, res) => {
  try {
    const { userId, productId, price, qty } = req.body;

    if (!userId || !productId || !price || !qty) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const total = price * qty;

    // ✅ Check if product already exists for this user
    let existing = await OfflineCart.findOne({ userId, productId });
    
    if (existing) {
      existing.qty = qty; // overwrite instead of +=
      existing.price = price;
      existing.total = total;
      await existing.save();
      return res.json(existing);
    }

    // ➕ Create new item if not exists
    const cartItem = new OfflineCart({ userId, productId, price, qty, total });
    
    await cartItem.save();

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📋 Get all cart items for a user
 */

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await OfflineCart.find({ userId })
      .populate("productId", "name brand");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ❌ Remove single item from cart
 */
router.delete("/:userId", async (req, res) => {
  // console.log("Deleting item with id:", req.params.id);
  // try {
  //   const deleted = await OfflineCart.findByIdAndDelete(req.params.id);
  //   if (!deleted) return res.status(404).json({ error: "Item not found" });
  //   res.json({ message: "Item removed from cart" });
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  // }

  // try {
    const { userId } = req.params;
    
    if (!userId) return res.status(400).json({ error: "UserId is required" });

    await OfflineCart.deleteMany({ _id:userId });

    res.json({ message: "Cart cleared successfully" });
  // } catch (error) {
  //   console.error("❌ Error in clearCart:", error.message);
  //   res.status(500).json({ error: "Server error: " + error.message });
  // }

});



/**
 * 🧹 Clear all cart items for a user
 */
router.delete("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await OfflineCart.deleteMany({ userId });
    res.json({ message: "Cart cleared for user" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

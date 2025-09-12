// controllers/orderController.js

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // fetch orders where user is either retailer or supplier
    const orders = await Order.find({
      $or: [{ retailer: userId }, { supplier: userId }],
    })
      .populate({
        path: "items.product",
        select: "name brand price image",
      })
      .populate("supplier", "companyName name")
      .populate("retailer", "companyName name")
      .sort({ createdAt: -1 });

    // format for frontend
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      status: order.status,
      totalAmount: order.totalPrice,
      createdAt: order.createdAt,
      items: order.items,
      supplier: order.supplier || null,
      retailer: order.retailer || null,
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message });
  }
};

export const Checkout = async (req, res) => {
  try {
    const { userId, supplierId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ user: userId}).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Create order
    const newOrder = new Order({
      retailer: userId,
      supplier:supplierId,
      items: cart.items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
      })),
      totalPrice,
    });

    await newOrder.save();

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    res.json({
      message: "✅ Order placed successfully",
      order: await newOrder.populate("items.product"),
    });
  } catch (error) {
    console.error("❌ Error during checkout:", error);
    res.status(500).json({ message: "Error processing checkout" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ retailer: userId })
      .populate("items.product")
      .sort({ createdAt: -1 }); // latest first

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

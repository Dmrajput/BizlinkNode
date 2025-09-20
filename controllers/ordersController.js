// controllers/orderController.js

import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import ComplitedOders from "../models/ComplitedOrders.js";
import RetailerProductsStock from "../models/RetailerStock.js"

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const query = {
      $or: [{ retailer: userId }, { supplier: userId }],
    };

    if (status) {
      query.status = status; // filter by status if provided
    }

    // fetch orders
    const orders = await Order.find(query)
      .populate({
        path: "items.product",
        select: "name brand price image",
      })
      .populate("supplier", "companyName name")
      .populate("retailer", "companyName name email phone address")
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
        price: i.product.price,
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

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find single order by _id and populate product details
    const order = await Order.findById(orderId)
      .populate("items.product")      // ✅ correct path
      .populate("supplier", "companyName") // optional
      .populate("retailer", "companyName email phone address") // optional
      .exec();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, userId } = req.body; // userId is supplier performing action
    const order = await Order.findById(orderId).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Handle "Reject" → directly update
    if (status === "Rejected") {
      order.status = "Rejected";
      order.statusHistory.push({
        status: "Rejected",
        updatedBy: userId,
      });
      await order.save();
      return res.json({ message: "Order rejected", order });
    }

    // Handle "Accept" → move to Processing
    if (status === "Accepted") {
      order.status = "Processing";
      order.statusHistory.push({
        status: status,
        updatedBy: userId,
      });
      await order.save();

      // Optional: automatically move to Processing → Shipped → Delivered
      // setTimeout(async () => {
      //   await advanceOrderStatus(order._id);
      // }, 5000); // 5 seconds for demo, replace with actual logic
      
      return res.json({ message: "Order accepted and progressing", order });
    }

    // Optional: allow manual status update to Processing / Shipped / Delivered
    // const allowedNextStatus = ["Processing","Shipped","Delivered"];
    // if (!allowedNextStatus.includes(status)) {
    //   return res.status(400).json({ message: "Invalid status update" });
    // }

    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: userId,
    });

    await order.save();
    
     // If Delivered, save in DeliveredOrders collection
    if (status === "Delivered") {
      // const deliveredOrderData = {
      //   originalOrderId: order._id,
      //   userId: order.userId,
      //   supplierId: userId,
      //   products: order.products,
      //   totalAmount: order.totalAmount,
      //   statusHistory: order.statusHistory,
      //   deliveredAt: new Date(),
      // };

      // await DeliveredOrder.create(deliveredOrderData);

      // 2️⃣ Save item-wise in RetailerProductsStock
      const retailerStockData = order.items.map((item) => ({
        productId: item.product,
        productName: item.product?.name || item.name || "Unknown Product",
        quantity: item.quantity,
        category: item.product?.category || "Uncategorized",
        size: item.product.size,
        price: item.price,
        retailerId: order.retailer,
        supplierId: order.supplier,
        orderId: order._id,
        deliveredAt: new Date(),
      }));

      await RetailerProductsStock.insertMany(retailerStockData);

      order.status = "Delivered";
      order.statusHistory.push({
        status: status,
        updatedBy: userId,
      });

      await order.save();
      const completedItems = [];
      let totalAmount = 0;
      order.items.forEach((item) => {
        const qty = item.quantity;
        const price = item.price;
        const total = price * qty;

        completedItems.push({
          productId: item.product,
          qty,
          price,
          total,
        });

        totalAmount += total;
      });

        var customerName ='online';
        var mobileNumber = 0;
        // Create new completed order document
        const newOrder = new ComplitedOders({
          userId,
          retailerId:order.retailer,
          customerName,
          mobileNumber,
          items:completedItems,
          totalAmount,
          status: "Completed",
          oderType: "Offline",
        });
    
        await newOrder.save();
    }
    
    res.json({ message: `Order status updated to ${status}`, order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating order status" });
  }
};

// Helper: automatically progress accepted orders
const advanceOrderStatus = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return;

    const statusFlow = ["Accepted", "Processing", "Shipped", "Delivered"];
    const currentIndex = statusFlow.indexOf(order.status);

    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;

    const nextStatus = statusFlow[currentIndex + 1];
    order.status = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      updatedBy: order.supplier, // assume supplier did the update
    });
    await order.save();

    // Schedule next step (for demo only, could be cron)
    setTimeout(() => advanceOrderStatus(order._id), 5000); 
  } catch (err) {
    console.error("Error advancing order status:", err);
  }
};

import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

// @desc Browse suppliers’ products with filters
export const browseProducts = async (req, res) => {
  try {
    const { category, supplier, minPrice, maxPrice } = req.query;

    let filters = {};

    if (category) filters.category = category;
    if (supplier) filters["user.companyName"] = supplier; // assuming supplier is linked to user
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filters)
      .populate("user", "name email role companyName")
      .lean();

    res.json(products);
  } catch (error) {
    console.error("❌ Error browsing products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// ================= CART =================

// @desc Get user cart
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
};

// @desc Add item to cart

export const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [{ product: productId, quantity }] });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity; // update qty if already in cart
    } else {
      cart.items.push({ product: productId, quantity }); // ✅ push new item
    }
  }

  await cart.save();
  res.json(await cart.populate("items.product"));
};

// export const addToCart = async (req, res) => {
//   try {

//     // const { userId, productId, quantity } = req.body;

//     console.log("Incoming body:", req.body);  // 👈 log request body

//     const { userId, productId, quantity } = req.body;

//     if (!userId || !productId || !quantity) {
//       return res.status(400).json({ message: "userId, productId, and quantity are required" });
//     }

//     let cart = await Cart.findOne({ user: userId });

//     if (!cart) {
//       cart = new Cart({ user: userId, items: [] });
//     }

//     // Check if product exists in cart
//     const existingItem = cart.items.find(
//       (item) => item.product.toString() === productId
//     );

//     if (existingItem) {
//       existingItem.quantity += quantity;
//     } else {
//       cart.items.push({ product: productId, quantity });
//     }

//     await cart.save();
//     res.json(cart);
//   } catch (error) {
//     console.error("❌ Error adding to cart:", error);
//     res.status(500).json({ message: "Error adding to cart" });
//   }
// };

// @desc Update cart item quantity

export const updateCartItem = async (req, res) => {
  try {
    const { userId } = req.params;          // ✅ now taken from params
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter(
          (i) => i.product.toString() !== productId
        );
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart" });
  }
};

// export const updateCartItem = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;

//     let cart = await Cart.findOne({ user: userId });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     const item = cart.items.find(
//       (i) => i.product.toString() === productId
//     );

//     if (item) {
//       item.quantity = quantity;
//       if (item.quantity <= 0) {
//         cart.items = cart.items.filter(
//           (i) => i.product.toString() !== productId
//         );
//       }
//     }

//     await cart.save();
//     res.json(cart);
//   } catch (error) {
//     console.error("❌ Error updating cart:", error);
//     res.status(500).json({ message: "Error updating cart" });
//   }
// };

// @desc Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;  // 👈 use params, not body

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("❌ Error removing cart item:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
};

export const Checkout = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
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
      user: userId,
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

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order details" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId })
      .populate("items.product")
      .sort({ createdAt: -1 }); // latest first

    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancel if still pending or processing
    if (order.status !== "Pending" && order.status !== "Processing") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled at this stage" });
    }

    // Update status
    order.status = "Cancelled";
    await order.save();

    res.json({ message: "✅ Order cancelled successfully", order });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    res.status(500).json({ message: "Error cancelling order" });
  }
};
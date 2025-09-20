import Product from "../models/Product.js";
import { logToFile } from "../utils/logger.js";
import OfflineCart from "../models/OfflineCart.js";
import StockHistory from "../models/StockHistory.js";

// ================= GET PRODUCTS =================
export const updateStocks = async (req, res) => {
  try {
    const { id } = req.params;
    const { addStock = 0, price, costPrice, userId, remarks } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // --- store old values for history ---
    const oldQuantity = product.quantity || 0;
    const oldPrice = product.price;
    const oldCostPrice = product.costPrice;

    // --- update product ---
    if (addStock) {
      product.quantity = oldQuantity + Number(addStock);
    }
    if (price !== undefined) {
      product.price = Number(price);
    }
    if (costPrice !== undefined) {
      product.costPrice = Number(costPrice);
    }

    await product.save();
    // --- log stock change ---
    await StockHistory.create({
      product: product._id,
      user: userId, // ✅ pass userId from frontend (who made the change)
      changeType: addStock > 0 ? "add" : addStock < 0 ? "remove" : "edit",
      oldQuantity,
      newQuantity: product.quantity,
      quantityChanged: Number(addStock),
      oldCostPrice,
      newCostPrice: product.costPrice,
      oldSellingPrice: oldPrice,
      newSellingPrice: product.price,
      remarks: remarks || "",
    });

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { user } = req.params;
    const { category, supplier, minPrice, maxPrice } = req.query;
    let query = { user: user };
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Fetch products
    let products = await Product.find(query)
      .populate("user", "-password -__v -createdAt -updatedAt")
      .lean();

    // Fetch offline cart items
    const cartItems = await OfflineCart.find({ userId: user }).lean();

    if (cartItems.length > 0) {
      const cartMap = {};
      cartItems.forEach((item) => {
        // If multiple entries exist for the same product, sum them
        cartMap[item.productId.toString()] =
          (cartMap[item.productId.toString()] || 0) + item.qty;
      });

      // Override product.quantity directly
      products = products.map((product) => {
        const productId = product._id.toString();
        if (cartMap[productId]) {
          return {
            ...product,
            quantity: Math.max(0, product.quantity - cartMap[productId]),
          };
        }
        return product;
      });
    }

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// ================= ADD PRODUCT =================
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      costPrice,
      category,
      quantity,
      unit,
      brand,
      size,
      sku,
      status,
      loggedInUserId,
    } = req.body;

    if (!name || !price || !loggedInUserId) {
      return res
        .status(400)
        .json({ message: "Name, Price, and User are required" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = new Product({
      name,
      price,
      costPrice,
      category,
      quantity,
      unit,
      brand,
      size,
      sku,
      status,
      user: loggedInUserId,
      imageUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error saving product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
};

// ================= UPDATE PRODUCT =================
export const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      name,
      price,
      costPrice,
      category,
      description,
      quantity,
      unit,
      brand,
      size,
      sku,
      status,
    } = req.body;

    let updateFields = {
      name,
      price,
      costPrice,
      category,
      description,
      quantity,
      unit,
      brand,
      size,
      sku,
      status,
    };

    if (req.file) {
      updateFields.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// ================= DELETE PRODUCT =================
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "✅ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

// ================= STOCK MANAGEMENT =================

// ➕ Increment / ➖ Decrement stock
export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { change } = req.body; // e.g. +1 or -1

  if (!change) {
    return res.status(400).json({ message: "Change value is required" });
  }

  try {
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    product.quantity = Math.max(0, (product.quantity || 0) + Number(change));
    await product.save();

    res.json({ message: "✅ Stock updated", product });
  } catch (error) {
    console.error("❌ Error updating stock:", error);
    res.status(500).json({ message: "Error updating stock" });
  }
};

// ✍️ Set stock to absolute value
export const setStock = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity == null || quantity < 0) {
    return res.status(400).json({ message: "Quantity must be >= 0" });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { quantity },
      { new: true, runValidators: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "✅ Stock set successfully", product });
  } catch (error) {
    console.error("❌ Error setting stock:", error);
    res.status(500).json({ message: "Error setting stock" });
  }
};

// ⚠️ Low Stock Products
export const lowStockProducts = async (req, res) => {
  const { threshold = 5 } = req.query;

  try {
    const products = await Product.find({ quantity: { $lte: threshold } });
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching low stock products:", error);
    res.status(500).json({ message: "Error fetching low stock products" });
  }
};


// ================== GET STOCK SUMMARY ==================
export const getStockSummary = async (req, res) => {
  try {
    const { user } = req.params;


    // Fetch all products with their stock levels
    const products = await Product.find({ user }).select(
      "name category brand quantity unit price status"
    );

    // Separate low-stock items (e.g. less than 10 units)
    const lowStock = products.filter((p) => p.quantity <= 10);

    res.json({
      totalProducts: products.length,
      lowStockCount: lowStock.length,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching stock summary:", error);
    res.status(500).json({ message: "Error fetching stock summary" });
  }
};

// ================== ADD STOCK ==================
export const addStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.quantity += Number(quantity);
    await product.save();

    res.json({ message: "✅ Stock updated", product });
  } catch (error) {
    console.error("❌ Error adding stock:", error);
    res.status(500).json({ message: "Error adding stock" });
  }
};

// ================== REDUCE STOCK ==================
export const reduceStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    product.quantity -= Number(quantity);
    await product.save();

    res.json({ message: "✅ Stock reduced", product });
  } catch (error) {
    console.error("❌ Error reducing stock:", error);
    res.status(500).json({ message: "Error reducing stock" });
  }
};

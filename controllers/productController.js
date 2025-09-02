import Product from "../models/Product.js";
import { logToFile } from "../utils/logger.js";

// ================= GET PRODUCTS =================
export const getProducts = async (req, res) => {
  try {
    const { user } = req.params;

    const products = await Product.find({ user })
      .populate("user", "-password -__v -createdAt -updatedAt");

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

// ================= ADD PRODUCT =================
export const addProduct = async (req, res) => {
  try {
    const { name, price, category, quantity, unit, brand, sku, status, loggedInUserId } = req.body;

    if (!name || !price || !loggedInUserId) {
      return res.status(400).json({ message: "Name, Price, and User are required" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = new Product({
      name,
      price,
      category,
      quantity,
      unit,
      brand,
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
      category,
      description,
      quantity,
      unit,
      brand,
      sku,
      status,
    } = req.body;

    let updateFields = { name, price, category, description, quantity, unit, brand, sku, status };

    // ✅ If image re-uploaded, replace old one
    if (req.file) {
      updateFields.image = `/uploads/${req.file.filename}`;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

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

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "✅ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

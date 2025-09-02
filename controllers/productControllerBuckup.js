import Product from "../models/Product.js";
import { logToFile } from "../utils/logger.js";

// @desc Get all products
// export const getProducts = async (req, res) => {
//   try {
//     const { userId,} = req.body;

//     const products = await Product.find()
//       .populate("user", "-password -__v -createdAt -updatedAt"); 
//       // Exclude sensitive fields

//     res.json(products);
//   } catch (error) {
//     console.error("❌ Error fetching products:", error);
//     res.status(500).json({ message: "Error fetching products" });
//   }
// };

export const getProducts = async (req, res) => {
  try {
    const { user } = req.params;
    

    // logToFile(`✅ Fetching products for userId: ${userId}`);

    // if (!user || user === "null" || user === "undefined") {
    //   return res.status(400).json({ message: "UserId is required" });
    // }

    const products = await Product.find({ 'user': user })
      .populate("user", "-password -__v -createdAt -updatedAt");


    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};




// @desc Add a new product
export const addProduct = async (req, res) => {
  const {
    name,
    price,
    category,
    description,
    imageUrl,
    quantity,
    unit,
    brand,
    sku,
    status,
    loggedInUserId, // coming from frontend (supplier/retailer)
  } = req.body;

  if (!name || !price || !loggedInUserId) {
    return res.status(400).json({ message: "Name, Price, and User are required" });
  }

  try {
    const product = new Product({
      name,
      price,
      category,
      description,
      imageUrl,
      quantity,
      unit,
      brand,
      sku,
      status,
      user: loggedInUserId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error saving product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
};

// @desc Update a product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    category,
    description,
    imageUrl,
    quantity,
    unit,
    brand,
    sku,
    status,
  } = req.body;

  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { name, price, category, description, imageUrl, quantity, unit, brand, sku, status },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// @desc Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "✅ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

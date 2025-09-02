import Product from "../models/Product.js";
import User from "../models/User.js";

// @desc Get retailer profile + their listed products
export const getRetailerDashboard = async (req, res) => {
  try {
    const { retailerId } = req.params; // Retailer ID from route

    // ✅ Find retailer details
    const retailer = await User.findById(retailerId).select(
      "-password -__v -createdAt -updatedAt"
    );

    if (!retailer || retailer.role !== "retailer") {
      return res.status(404).json({ message: "Retailer not found" });
    }

    // ✅ Find products listed by this retailer
    const products = await Product.find({ user: retailerId });

    res.json({
      retailer,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching retailer dashboard:", error);
    res.status(500).json({ message: "Error fetching retailer dashboard" });
  }
};

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },

    category: { type: String },
    description: { type: String },

    // New fields
    imageUrl: { type: String }, // single image
    // If you want multiple images:
    // images: [{ type: String }],

    quantity: { type: Number, default: 0 },
    unit: { type: String, default: "pcs" }, // pcs, kg, liter, etc.

    brand: { type: String },
    sku: { type: String, unique: true }, // product code
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Reference to user (supplier/retailer)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;

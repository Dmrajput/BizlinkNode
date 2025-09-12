// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who ordered
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who supplies
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        // selledAt: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

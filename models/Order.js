// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending","Accepted","Rejected","Processing","Shipped","Delivered"],
      default: "Pending",
    },
    statusHistory: [
      {
        status: { type: String, enum: ["Pending","Accepted","Rejected","Processing","Shipped","Delivered"], required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

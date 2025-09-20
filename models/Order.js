import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    retailer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    totalQuantity: { type: Number, default: 0 },

    paymentStatus: { type: String, enum: ["Pending", "Paid", "Refunded"], default: "Pending" },
    
    status: {
      type: String,
      enum: ["Pending","Accepted","Rejected","Processing","Shipped","Delivered"],
      default: "Pending",
    },

    statusHistory: [
      {
        status: { type: String, required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

import mongoose from "mongoose";

const deliveredOrderSchema = new mongoose.Schema({
  originalOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [{ productId: mongoose.Schema.Types.ObjectId, qty: Number, price: Number }],
  totalAmount: Number,
  statusHistory: [{ status: String, updatedBy: mongoose.Schema.Types.ObjectId, date: { type: Date, default: Date.now } }],
  deliveredAt: { type: Date, default: Date.now },
});

export default mongoose.model("DeliveredOrder", deliveredOrderSchema);

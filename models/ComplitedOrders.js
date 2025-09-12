import mongoose from "mongoose";


const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const complitedOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    customerName: { type: String },
    mobileNumber: { type: String },
    items: [orderItemSchema], // 👈 store array of products
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Deleted", "Hold"],
      default: "Pending",
    },
    oderType: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Online",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ComplitedOders", complitedOrderSchema);

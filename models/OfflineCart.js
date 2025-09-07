import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // 🔗 Reference to User model
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

// ✅ Keep total in sync before save
cartSchema.pre("save", function (next) {
  this.total = this.qty * this.price;
  next();
});

export default mongoose.model("OfflineCart", cartSchema);

import mongoose from "mongoose";

const stockHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who made the change
      required: true,
    },

    changeType: {
      type: String,
      enum: ["add", "remove", "edit"], // type of change
      required: true,
    },

    oldQuantity: { type: Number, default: 0 },
    newQuantity: { type: Number, default: 0 },

    quantityChanged: { type: Number, required: true }, // +10, -5

    oldCostPrice: { type: Number },
    newCostPrice: { type: Number },

    purchasePrice: { type: Number }, // price for this stock addition (if applicable)

    oldSellingPrice: { type: Number },
    newSellingPrice: { type: Number },

    remarks: { type: String }, // optional: reason, notes
  },
  { timestamps: true }
);

const StockHistory = mongoose.model("StockHistory", stockHistorySchema);
export default StockHistory;

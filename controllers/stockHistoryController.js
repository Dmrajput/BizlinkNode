// controllers/stockHistoryController.js
import StockHistory from "../models/StockHistory.js";

export const getAllStockHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    const filter = {};
    
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      };
    }

    const history = await StockHistory.find(filter)
      .populate("user", "name email")
      .populate("product", "name sku")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    console.error("❌ Error fetching global stock history:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
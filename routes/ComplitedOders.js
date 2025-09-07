import express from "express";
import {
  saveCompletedOrder,
  getUserCart,
  removeCartItem,
  clearUserCart,
  getSalesSummary,
  generateReport,
  exportReportPDF,
} from "../controllers/ComplitedOders.js";

const router = express.Router();

// router.get("/:userId", async (req, res) => {
//   try {
//     const orders = await ComplitedOders.find({ userId: req.params.userId })
//       .sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


router.post("/", saveCompletedOrder);       // Add / Update item
router.get("/:userId", getUserCart);         // Get user cart
router.delete("/:id", removeCartItem);       // Delete one item
router.delete("/user/:userId", clearUserCart); // Clear all user cart
router.get("/summary/:userId", getSalesSummary); // Clear all user cart
router.get("/reports/:userId", generateReport); // Clear all user cart
router.get("/reports/download/:userId", exportReportPDF); // Clear all user cart


// Get monthly sales summary
// router.get("/monthly/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const sales = await ComplitedOders.aggregate([
//       { $match: { userId: new mongoose.Types.ObjectId(userId), status: "Completed" } },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           totalAmount: { $sum: "$totalAmount" },
//         },
//       },
//       { $sort: { "_id": 1 } },
//     ]);

//     // Format response with month names
//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const result = sales.map((s) => ({
//       month: months[s._id - 1],
//       amount: s.totalAmount,
//     }));

//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

export default router;

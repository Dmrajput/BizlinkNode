import mongoose from "mongoose";
import ComplitedOders from "../models/ComplitedOrders.js";
// import express from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const saveCompletedOrder = async (req, res) => {
  try {
    const { userId, customerName, items, totalAmount, status, oderType } = req.body;

    if (!userId || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    // Create new completed order document
    const newOrder = new ComplitedOders({
      userId,
      customerName,
      items, 
      totalAmount,
      status: status || "Pending",
      oderType: oderType || "Online",
    });

    await newOrder.save();

    return res.status(201).json({
      message: "✅ Order saved successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error saving order:", error.message);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};


// Clear cart after order is completed
// export const clearCart = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     if (!userId) return res.status(400).json({ error: "UserId is required" });

//     await CartData.deleteMany({ userId });

//     res.json({ message: "Cart cleared successfully" });
//   } catch (error) {
//     console.error("❌ Error in clearCart:", error.message);
//     res.status(500).json({ error: "Server error: " + error.message });
//   }
// };


/**
 * 📋 Get all cart items for a user
 */
export const getUserCart = async (req, res) => {
console.log("Fetching orders for user:", req.params);
    try {
        const orders = await ComplitedOders.find({ userId: req.params.userId })
        .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
//   try {
//     const { userId } = req.params;
//     const items = await ComplitedOders.find({ userId }).populate("productId");
//     res.json(items);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
};

/**
 * ❌ Remove single item
 */
export const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ComplitedOders.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item removed", deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🧹 Clear all cart for a user
 */
export const clearUserCart = async (req, res) => {
  try {
    const { userId } = req.params;
    await ComplitedOders.deleteMany({ userId });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get monthly sales summary
export const getMonthyRecord = async (req, res) => {
    console.log("Fetching monthly record for user:", req.params);
  try {
    const { userId } = req.params;

    const sales = await ComplitedOders.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "Completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Format response with month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = sales.map((s) => ({
      month: months[s._id - 1],
      amount: s.totalAmount,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSalesSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userObjId = new mongoose.Types.ObjectId(userId);

    // ---------- Today’s Sales ----------
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await ComplitedOders.aggregate([
      {
        $match: {
          userId: userObjId,
          status: "Completed",
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // ---------- Weekly Sales ----------
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklySales = await ComplitedOders.aggregate([
      {
        $match: {
          userId: userObjId,
          status: "Completed",
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // 1=Sunday, 7=Saturday
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedWeekly = weeklySales.map((w) => ({
      day: weekDays[w._id - 1],
      amount: w.totalAmount,
    }));

    // ---------- Monthly Sales ----------
    const monthlySales = await ComplitedOders.aggregate([
      { $match: { userId: userObjId, status: "Completed" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlySales.map((m) => ({
      month: months[m._id - 1],
      amount: m.totalAmount,
    }));

    // ---------- Response ----------
    const data = {
      today: todaySales[0] || { totalAmount: 0, orderCount: 0 },
      weekly: formattedWeekly,
      monthly: formattedMonthly,
    };
    

    res.json({
      today: todaySales[0] || { totalAmount: 0, orderCount: 0 },
      weekly: formattedWeekly,
      monthly: formattedMonthly,
    });
  } catch (error) {
    console.error("❌ Error fetching sales summary:", error);
    res.status(500).json({ error: error.message });
  }
};


export const generateReport = async (req, res) => {
  try {
    console.log("Generating report with params:", req.params);
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
console.log("Report date range:", startDate, "to", endDate);
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: start, $lte: end } };
    }
console.log("Date filter applied:", dateFilter);
    // Fetch summary
    const summary = await ComplitedOders.aggregate([
      { $match: { userId: userObjId, status: "Completed", ...dateFilter } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Daily breakdown (optional)
    const dailyBreakdown = await ComplitedOders.aggregate([
      { $match: { userId: userObjId, status: "Completed", ...dateFilter } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          dailyAmount: { $sum: "$totalAmount" },
          dailyOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({
      summary: summary[0] || { totalAmount: 0, totalOrders: 0 },
      dailyBreakdown,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: error.message });
  }
};

export const exportReportPDF = async (req, res) => {
//   try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date("2000-01-01");
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch completed orders in date range
    const orders = await ComplitedOders.find({
      userId,
      status: "Completed",
      createdAt: { $gte: start, $lte: end },
    }).lean();

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this period." });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const fileName = `Report_${Date.now()}.pdf`;
    const filePath = path.join("./reports", fileName);

    // Ensure reports folder exists
    fs.mkdirSync("./reports", { recursive: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // PDF Header
    doc.fontSize(18).text("Completed Orders Report", { align: "center" });
    doc.fontSize(12).text(`Date Range: ${start.toDateString()} - ${end.toDateString()}`, { align: "center" });
    doc.moveDown();

    // Table Header
    doc.fontSize(12).text("Customer", { continued: true, width: 100 });
    doc.text("Total Amount", { continued: true, width: 100 });
    doc.text("Order Type", { width: 100 });
    doc.moveDown(0.5);

    let totalAmount = 0;
    let totalOrders = orders.length;

    orders.forEach((order) => {
      doc.text(order.customerName, { continued: true, width: 100 });
      doc.text(`₹${order.totalAmount}`, { continued: true, width: 100 });
      doc.text(order.oderType, { width: 100 });
      totalAmount += order.totalAmount;
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Orders: ${totalOrders}`);
    doc.text(`Total Amount: ₹${totalAmount}`);

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Failed to download report" });
        }
        // Optionally delete after download
        // fs.unlinkSync(filePath);
      });
    });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error generating report" });
//   }
};
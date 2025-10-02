import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; // Mongoose connection

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import cartRoutes from "./routes/OfflinecartRoutes.js";
import ComplitedOdersRoutes from "./routes/CompletedOrders.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import stockHistoryRoutes from "./routes/stockHistoryRoutes.js";
import Retailerstock from "./routes/RetailerStock.js";
import membershipRoutes from "./routes/membershipRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // In production, set to your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/offlinecart", cartRoutes);
app.use("/api/complitedoders", ComplitedOdersRoutes);
app.use("/api/stock-history", stockHistoryRoutes);
app.use("/api/rstock", Retailerstock);
app.use("/api/membership", membershipRoutes);


// Health check
app.get("/ping", (req, res) => res.status(200).send("pong 🏓"));

app.get("/health", async (req, res) => {
  const mongoose = await import("mongoose"); // dynamic import
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: "ok", db: "connected" });
  } else {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// Default route
app.get("/", (req, res) => res.send("🚀 BizLink API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

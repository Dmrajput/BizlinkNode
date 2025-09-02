import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
// import Checkout from "./routes/ordersRoutes.js";

dotenv.config();
connectDB(); // connect to MongoDB

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.json());           // built-in JSON parser
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/suppliers", supplierRoutes);
app.use("/api/cart", supplierRoutes);
// app.post("api/Order", supplierRoutes);
app.use("/api/orders", supplierRoutes);




app.get("/", (req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

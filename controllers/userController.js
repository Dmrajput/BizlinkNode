import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register user (Supplier / Retailer / Admin)
export const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    companyName,
    companyType,
    businessRegNo,
    gstNo,
    panNo,
    phone,
    altPhone,
    address,
    bankDetails,
    categories,
    creditLimit,
    supplierId, //  retailer will send supplierId
  } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (role === "retailer") {
      if (!supplierId) {
        return res.status(400).json({ message: "Retailer must select a supplier" });
      }
      const supplierExists = await User.findOne({ _id: supplierId, role: "supplier" });
      if (!supplierExists) {
        return res.status(400).json({ message: "Invalid supplier selected" });
      }
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      companyName,
      companyType,
      businessRegNo,
      gstNo,
      panNo,
      phone,
      altPhone,
      address,
      bankDetails,
      categories,
      creditLimit,
      supplier: role === "retailer" ? supplierId : undefined,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully!", user });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        supplier: user.supplier || null, // ✅ include supplier info
      },
    });
  } catch (error) {
    console.error("❌ Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};

// ✅ Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("supplier", "companyName name email"); // ✅ show supplier info if retailer

    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// ✅ Search suppliers (autocomplete for retailer signup)
export const searchSuppliers = async (req, res) => {
  try {
    const { q } = req.query;
    const query = {
      role: { $in: ["supplier", "manufacturer"] }, // ✅ allow both
      ...(q && { companyName: { $regex: q, $options: "i" } }),
    };

    const suppliers = await User.find(query)
      .select("companyName _id name email phone")
      .limit(10);
    res.json(suppliers);
  } catch (error) {
    console.error("❌ Supplier search error:", error);
    res.status(500).json({ message: "Error searching suppliers" });
  }
};

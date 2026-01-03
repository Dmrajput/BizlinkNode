import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const client = twilio(accountSid, authToken);

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

export const getUserdata = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password"); 
    // select("-password") removes the password field from response for security

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

export const updateProfile = async (req, res) => {         
  try {
    const { userId } = req.params;
    const updatedData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true, runValidators: true } // return updated user
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

export const updatedPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





// In-memory store for OTPs (use Redis in production)
let otpStore = {};

// Step 1: Send OTP
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = otp;

    // ✅ WhatsApp Sandbox (Twilio)
    const message = await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: "whatsapp:+14155238886", // Twilio sandbox number
      to: `whatsapp:${phone}`,       // Make sure phone is in format +91xxxxxxxxxx
    });

    console.log("Number",phone,"OTP:", otp, " SID:", message.sid);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Twilio error:", error);
    res.status(500).json({ message: error.message });
  }
};


// export const sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     const user = await User.findOne({ phone });
    
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     otpStore[phone] = otp;

//     // Send via Twilio SMS
//     await client.messages.create({
//       body: `Your OTP code is ${otp}`,
//         to: '+917600829332',
//         from: '+14155238886',
//         contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
//         contentVariables: '{"1":"409173"}',
//     });
//     console.log(otp);
//     res.json({ message: "OTP sent successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Step 2: Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (otpStore[phone] && otpStore[phone] === otp) {
      res.json({ success: true, message: "OTP verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 3: Reset password
export const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!otpStore[phone] || otpStore[phone] !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { phone },
      { password: hashedPassword },
      { new: true }
    );

    // clear OTP after success
    delete otpStore[phone];

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().sort({ createdAt: -1 });

    // Include password ONLY for admin users
    const filteredUsers = users.map(user => {
      const userObj = user.toObject();

      if (userObj.role !== "admin") {
        delete userObj.password;
      }

      return userObj;
    });

    res.status(200).json({
      success: true,
      totalUsers: filteredUsers.length,
      users: filteredUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


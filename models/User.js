import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // B2B Role (Supplier / Retailer / Admin)
    role: { 
      type: String, 
      enum: ["supplier", "retailer", "admin"], 
      default: "retailer" 
    },

    // Supplier Reference (Only for Retailers)
    supplier: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: function() { return this.role === "retailer"; } 
    },

    // Company Information
    companyName: { type: String, required: true },
    companyType: { 
      type: String, 
      enum: ["manufacturer", "wholesaler", "distributor", "retailer"], 
      required: true 
    },
    businessRegNo: { type: String },
    gstNo: { type: String },
    panNo: { type: String },

    // Contact Info
    phone: { type: String, required: true },
    altPhone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },

    // Banking / Payment Details
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },

    // Business Details
    categories: [String],
    creditLimit: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    verified: { type: Boolean, default: false },

    // Meta
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;

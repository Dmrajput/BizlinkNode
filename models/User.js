
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

    // Company Information
    companyName: { type: String, required: true },
    companyType: { 
      type: String, 
      enum: ["manufacturer", "wholesaler", "distributor", "retailer"], 
      required: true 
    },
    businessRegNo: { type: String },   // Business Registration Number
    gstNo: { type: String },           // GST / Tax ID
    panNo: { type: String },           // PAN or equivalent (for India)

    // Contact Info
    phone: { type: String, required: true },
    altPhone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    // Banking / Payment Details
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,    // For India; could be SWIFT for international
      bankName: String,
      branch: String,
    },

    // Business Details
    categories: [String],  // E.g. ["Electronics", "Clothing"]
    creditLimit: { type: Number, default: 0 }, // For B2B credit facility
    rating: { type: Number, default: 0, min: 0, max: 5 }, // Average rating
    verified: { type: Boolean, default: false }, // Admin verification

    // Meta
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;


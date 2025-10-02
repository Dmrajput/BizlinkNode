import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  planName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// ✅ Method to auto-check if membership expired
membershipSchema.methods.checkStatus = function () {
  if (new Date() > this.endDate) {
    this.isActive = false;
    return "expired";
  }
  return this.isActive ? "active" : "inactive";
};

export default mongoose.model("Membership", membershipSchema);

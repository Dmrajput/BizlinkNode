import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUsers, 
  searchSuppliers,
  getUserdata,
  updateProfile,
  updatedPassword,
  sendOtp, verifyOtp, resetPassword, getAllUsers
} from "../controllers/userController.js";

const router = express.Router();

// Register
router.post("/", registerUser);

// Login
router.post("/login", loginUser);

// Get all users
router.get("/", getUsers);
router.get("/suppliers/search", searchSuppliers);
router.get("/:userId", getUserdata);
router.put("/:userId", updateProfile);
router.put("/:userId/change-password", updatedPassword);
// router.post("/:userId/forgot-password", forgetPassword);
// router.post("/:userId/reset-password", resetpassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/admin-user", getAllUsers);



export default router;

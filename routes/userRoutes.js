import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUsers, 
  searchSuppliers 
} from "../controllers/userController.js";

const router = express.Router();

// Register
router.post("/", registerUser);

// Login
router.post("/login", loginUser);

// Get all users
router.get("/", getUsers);
router.get("/suppliers/search", searchSuppliers);

export default router;

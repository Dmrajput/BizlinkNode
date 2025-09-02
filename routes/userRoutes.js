import express from "express";
import { registerUser, loginUser, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/", registerUser);  // Register
router.post("/login", loginUser); // Login
router.get("/", getUsers);        // Get all users

export default router;

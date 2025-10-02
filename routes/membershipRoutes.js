import express from "express";
import { 
   createOrUpdateMembership,
  getMembershipStatus,
  cancelMembership
} from "../controllers/membershipController.js";

const router = express.Router();


// ✅ Create or update membership
router.post("/", createOrUpdateMembership);

// ✅ Get membership status
router.get("/status/:userId", getMembershipStatus);

// ✅ Cancel membership
router.put("/cancel/:userId", cancelMembership);


export default router;

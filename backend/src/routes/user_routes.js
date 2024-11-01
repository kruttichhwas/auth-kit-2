import express from "express"
import { logoutUser, registerUser, loginUser, getUser, updateUser, getLoginStatus, verifyEmail, verifyUser } from "../controllers/auth/userController.js";
import { protect } from "../middlewares/auth/checkUser.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", protect, logoutUser);
router.get("/user", protect, getUser);
router.patch("/update", protect, updateUser);
router.get("/login-status", getLoginStatus);
router.get("/verify-email", protect, verifyEmail);
router.get("/verify-user/:verificationToken", verifyUser);

export default router;

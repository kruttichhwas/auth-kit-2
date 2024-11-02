import express from "express"
import { logoutUser, registerUser, loginUser, getUser, updateUser, getLoginStatus, verifyEmail, verifyUser, forgotPassword, changePassword, resetPassword } from "../controllers/auth/userController.js";
import { checkUser } from "../middlewares/auth/checkUser.js";
import { stopUser } from "../middlewares/auth/stopUser.js";

const router = express.Router();

router.post("/register", stopUser, registerUser);
router.post("/login", stopUser, loginUser);
router.get("/logout", checkUser, logoutUser);
router.get("/user", checkUser, getUser);
router.patch("/update", checkUser, updateUser);
router.get("/login-status", getLoginStatus);
router.get("/verify-email", checkUser, verifyEmail);
router.get("/verify-user/:verificationToken", verifyUser);
router.post("/forgot-password", stopUser, forgotPassword);
router.post("/reset-password/:passwordResetToken",stopUser, resetPassword);
router.post("/change-password", checkUser, changePassword)

export default router;

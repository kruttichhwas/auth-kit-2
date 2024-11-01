import express from "express"
import { logoutUser, registerUser, loginUser, getUser, updateUser } from "../controllers/auth/userController.js";
import { protect } from "../middlewares/auth/checkUser.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", protect, logoutUser)
router.get("/user", protect, getUser)
router.patch("/update", protect, updateUser)

export default router;

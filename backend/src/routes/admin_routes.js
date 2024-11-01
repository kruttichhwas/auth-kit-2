import express from "express"
import { protect } from "../middlewares/auth/checkUser.js";
import { adminRoleOnly } from "../middlewares/auth/checkAdmin.js";
import { deleteUser } from "../controllers/auth/adminController.js";

const router = express.Router();

router.delete("/admin/users/:id", protect, adminRoleOnly, deleteUser)

export default router;

import express from "express"
import { protect } from "../middlewares/auth/checkUser.js";
import { adminRoleOnly } from "../middlewares/auth/checkAdmin.js";
import { deleteUser, getAllUsers } from "../controllers/auth/adminController.js";
import { creatorPlusOnly } from "../middlewares/auth/checkCreator.js";

const router = express.Router();

router.delete("/admin/users/:id", protect, adminRoleOnly, deleteUser)
router.get("/get-all-users", protect, creatorPlusOnly, getAllUsers)

export default router;

import express from "express"
import { checkUser } from "../middlewares/auth/checkUser.js";
import { adminRoleOnly } from "../middlewares/auth/checkAdmin.js";
import { deleteUser, getAllUsers } from "../controllers/auth/adminController.js";
import { creatorPlusOnly } from "../middlewares/auth/checkCreator.js";

const router = express.Router();

router.delete("/admin/users/:id", checkUser, adminRoleOnly, deleteUser)
router.get("/get-all-users", checkUser, creatorPlusOnly, getAllUsers)

export default router;

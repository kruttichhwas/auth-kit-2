import asyncHandler from "express-async-handler"
import User from "../../models/auth/user_model.js";

export const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        return res.status(404).json({ message: "user deleted successfully" })
    } catch (error) {
        return res.status(404).json({ message: "user not found" })
    }
});
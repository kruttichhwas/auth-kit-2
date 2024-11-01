import asyncHandler from "express-async-handler"
import User from "../../models/auth/userModel.js";

export const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        return res.status(404).json({ message: "user deleted successfully" })
    } catch (error) {
        return res.status(404).json({ message: "user not found" })
    }
});

export const getAllUsers = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(await User.find().select("-password"))
    } catch (error) {
        return res.status(404).json({message: "some error occured while fetching all users"})
    }
});
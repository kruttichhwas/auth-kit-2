import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import User from "../../models/auth/user_model.js";
export const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "not authorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "user not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(400).json({ message: "some error occured while authorizing" });
    }
});
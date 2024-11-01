import asyncHandler from "express-async-handler"
export const adminRoleOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
        return;
    } else {
        return res.status(403).json({message: "admin access only"})
    }
});
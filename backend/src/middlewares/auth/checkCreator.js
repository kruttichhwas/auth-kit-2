import asyncHandler from "express-async-handler"
export const creatorPlusOnly = asyncHandler(async (req, res, next) => {
    if (req.user && (req.user.role === "creator" || req.user.role === "admin")) {
        next();
        return;
    } else {
        return res.status(403).json({message: "creator plus access only"})
    }
});
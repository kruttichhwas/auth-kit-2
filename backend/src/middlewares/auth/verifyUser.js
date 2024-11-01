import asyncHandler from "express-async-handler"
export const verifiedUserOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next();
        return;
    } else {
        return res.status(403).json({message: "verfied users only"})
    }
});
import asyncHandler from "express-async-handler"
export const stopUser = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            return res.status(401).json({ message: "logout from current session to continue" });
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: "some error occured while authorizing" });
    }
});
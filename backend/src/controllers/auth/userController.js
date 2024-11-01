import asyncHandler from "express-async-handler";
import User from "../../models/auth/user_model.js";
import generateToken from "../../helpers/generate_token.js";
import bcrypt from "bcrypt";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, deleteUser } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "password must be atleast 6 characters long" })
    }
    const userExists = await User.findOne({ email })
    // console.log(userExists)
    if (userExists && deleteUser) {
        const deleteUser = await User.deleteOne({ email })
        if (deleteUser) {
            return res.status(400).json({ message: "user deleted" });
        }
    }
    if (userExists) {
        return res.status(400).json({ message: "user already exists" });
    }
    const user = await User.create({
        name, email, password
    });
    const token = generateToken(user._id);
    // console.log(token)
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
        sameSite: true,
        secure: true
    });
    if (user) {
        const { _id, name, email, role, photo, bio, isVerified } = user;
        res.status(201).json({ _id, name, email, role, photo, bio, isVerified, token });
    } else {
        res.status(400).json({ message: "invalid user data" });
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "all fields are required" });
    }
    const userExists = await User.findOne({ email })
    if (!userExists) {
        return res.status(400).json({ message: "user doesn't exist, please sign up" });
    }
    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
        return res.status(400).json({ message: "invalid credentials" });
    }
    const token = generateToken(userExists._id);
    if (userExists && isMatch) {
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            maxAge: 2 * 24 * 60 * 60 * 1000,
            sameSite: true,
            secure: true
        });
        const { _id, name, email, role, photo, bio, isVerified } = userExists;
        res.status(201).json({ _id, name, email, role, photo, bio, isVerified, token });
    } else {
        res.status(400).json({ message: "invalid credentials" });
    }
});
import asyncHandler from "express-async-handler";
import User from "../../models/auth/user_model.js";
import generateToken from "../../helpers/generate_token.js";
import bcrypt from "bcrypt";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "password must be atleast 6 characters long" })
    }
    const userExists = await User.findOne({ email })
    // console.log(userExists)
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
        return res.status(201).json({ _id, name, email, role, photo, bio, isVerified, token });
    } else {
        return res.status(400).json({ message: "invalid user data" });
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
        return res.status(201).json({ _id, name, email, role, photo, bio, isVerified, token });
    } else {
        return res.status(400).json({ message: "invalid credentials" });
    }
});

export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "user logged out" })
});

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password")
    if (user) {
        return res.status(200).json(user);
    } else {
        return res.status(404).json({ message: "user not found" });
    }
})

export const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        user.photo = req.body.photo || user.photo;
        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } else {
        res.status(404).json({ message: "user not found" })
    }
});
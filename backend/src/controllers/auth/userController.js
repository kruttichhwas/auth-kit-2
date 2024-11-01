import asyncHandler from "express-async-handler";
import User from "../../models/auth/userModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import Token from "../../models/auth/tokenModel.js";
import crypto from "node:crypto"
import { hashToken } from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "all fields are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "password must be atleast 6 characters long" })
    }
    const userExists = await User.findOne({ email })
    if (userExists) {
        return res.status(400).json({ message: "user already exists" });
    }
    const user = await User.create({
        name, email, password
    });
    const token = generateToken(user._id);
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

export const getLoginStatus = asyncHandler(async (req, res) => {
    try {
        const token = req.cookies.token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded) {
            return res.status(404).json(true)
        }
        return res.status(404).json(false)
    } catch (error) {
        return res.status(404).json(false)
    }
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status.json({ message: "user not found" });
    }
    if (user.isVerified) {
        return res.status(400).json({ message: "user already verified" });
    }
    const token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }
    const hashifiedUserID = hashToken(user._id)
    const verificationToken = crypto.randomBytes(64).toString("hex") + hashifiedUserID;
    const hashifiedtoken = hashToken(verificationToken);
    await new Token({
        userId: user._id,
        verificationToken: hashifiedtoken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 2 * 60 * 60 * 1000  //2 hours
    }).save();
    const subject = "Email Verification - TeamAuth";
    const send_to = user.email;
    const reply_to = process.env.TEAM_AUTH_EMAIL;
    const template = "emailVerification";
    const send_from = process.env.TEAM_AUTH_EMAIL;
    const name = user.name;
    const verificationLink = `${process.env.CLIENT_URI}/verify-user/${verificationToken}`;
    try {
        await sendEmail(subject, send_to, reply_to, template, send_from, name, verificationLink);
        return res.status(200).json({ message: "email sent, verify within 2 hrs" });
    } catch (error) {
        console.log("error sending mail", error);
        return res.status(500).json({ message: "email could not be sent" });
    }
});

export const verifyUser = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;
    if (!verificationToken) {
        return res.status(400).json({ message: "invalid verification token" });
    }
    const hashifiedtoken = hashToken(verificationToken);
    const userToken = await Token.findOne({ verificationToken: hashifiedtoken, expiresAt: { $gt: Date.now() } }).select("userId");
    if (!userToken) {
        return res.status(400).json({ message: "token expired" });
    }
    const user = await User.findById(userToken.userId).select("-password");
    if (user) {
        user.isVerified = true;
        await user.save();
        res.status(200).json({ message: "user verification done" });
    } else {
        res.status(404).json({ message: "user not found" })
    }
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "email is required" });
    }
    const user = await User.findOne({ email: email }).select("-password");
    if (!user) {
        return res.status.json({ message: "user not found" });
    }
    const token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }
    const hashifiedUserID = hashToken(user._id)
    const passwordResetToken = crypto.randomBytes(64).toString("hex") + hashifiedUserID;
    const hashifiedtoken = hashToken(passwordResetToken);
    await new Token({
        userId: user._id,
        passwordResetToken: hashifiedtoken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 60 * 1000  //30 minutes
    }).save();
    const subject = "Password Reset - TeamAuth";
    const send_to = user.email;
    const reply_to = process.env.TEAM_AUTH_EMAIL;
    const template = "passwordReset";
    const send_from = process.env.TEAM_AUTH_EMAIL;
    const name = user.name;
    const passwordResetLink = `${process.env.CLIENT_URI}/reset-password/${passwordResetToken}`;
    try {
        await sendEmail(subject, send_to, reply_to, template, send_from, name, passwordResetLink);
        return res.status(200).json({ message: "email sent, reset password within 30 minutes" });
    } catch (error) {
        console.log("error sending mail", error);
        return res.status(500).json({ message: "email could not be sent" });
    }
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { passwordResetToken } = req.params;
    const { newPassword } = req.body;
    if (!passwordResetToken) {
        return res.status(400).json({ message: "invalid password reset token" });
    }
    const hashifiedtoken = hashToken(passwordResetToken);
    const userToken = await Token.findOne({ passwordResetToken: hashifiedtoken, expiresAt: { $gt: Date.now() } }).select("userId");
    if (!userToken) {
        return res.status(400).json({ message: "token expired" });
    }
    const user = await User.findById(userToken.userId).select("-password");
    if (user) {
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "password reset done" });
    } else {
        res.status(404).json({ message: "user not found" })
    }
});
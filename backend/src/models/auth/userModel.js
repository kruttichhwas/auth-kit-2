import mongoose from "mongoose";
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"]
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true,
        trim: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "please enter a password"]
    },
    photo: {
        type: String,
        default: "https://iabc.bc.ca/wp-content/uploads/2018/05/unknown_profile.png"
    },
    bio: {
        type: String,
        default: "i am a new user"
    },
    role: {
        type: String,
        enum: ["user", "admin", "creator"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, minimize: true });

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword
    next()
});

const User = mongoose.model("User", UserSchema);

export default User;
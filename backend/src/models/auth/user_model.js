import mongoose from "mongoose";

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
}, {timestamps: true, minimize: true} );

const User = mongoose.model("User", UserSchema);

export default User;
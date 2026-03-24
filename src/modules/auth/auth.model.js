import { required } from "joi";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50,
        required: [true, "Name is required"]    // [requiredBoll, err msg]
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, ""],
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ["customer", "seller", "admin"],
        default: "customer"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {type: String, select: false},
    refreshToken: {type: String, select: false},
    resetPasswordToken: {type: String, select: false},
    resetPasswordExpires: {type: Date, select: false},
}, {timestamps: true})


export default mongoose.model("User", userSchema)

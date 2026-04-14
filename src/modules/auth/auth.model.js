
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    avatar: {
        type: String,
        default: false
    },
    verificationToken: {type: String, select: false},
    refreshToken: {type: String, select: false},
    resetPasswordToken: {type: String, select: false},
    resetPasswordExpires: {type: Date, select: false},
}, {timestamps: true})

// hash password before saving
userSchema.pre('save', async function() {                   // hooks in moongoose: pre, post
    if(!this.isModified("password")) return;             // isModified is also a hook
    this.password = await bcrypt.hash(this.password, 12)        // salt value: 8-12 range (standard), salt val increase, hashing will take time
})

userSchema.methods.comparePassword = async function(clearTextPassword) {        // .methods lly polyphills, u can create ur methods
    return bcrypt.compare(clearTextPassword, this.password)
}


export default mongoose.model("User", userSchema)

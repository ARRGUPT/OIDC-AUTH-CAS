import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils.js";
import User from "./auth.model.js";
import ApiError from "../../common/utils/api-error.js";
import { sendResetPasswordEmail, sendVerificationEmail } from "../../common/config/email.js";
import crypto from "crypto";
import fs from "node:fs"
import imagekit from "../../common/config/imagekit.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict("User with this Email already exists");

  const { rawToken, hashedToken } = generateResetToken();

  const user = await User.create({
    // DB mai ye sb rakh diya, user === mongoose document naki obj
    name,
    email,
    password,
    role,
    verificationToken: hashedToken,
  });

  // send an email to user with token: rawToken
  try{
    await sendVerificationEmail(email, rawToken)
  } catch(error) {
    console.error(error)
  }

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;

  return userObj;
};

const login = async ({ email, password }) => {
  // take email and find user in DB
  // then check if password is correct
  // check if verified or not
  // generate and send token
  // store hashed refreshToken in DB

  const user = await User.findOne({email}).select("+password"); // we got full userObj {email, password, role, ...}
  if (!user) throw ApiError.unauthorised("Invalid Email or password");

  // check password
  const isMatch = await user.comparePassword(password)
  if(!isMatch) throw ApiError.unauthorised("Invalid email or password")

  if (!user.isVerified) {
    throw ApiError.forbidden("please verify your email before login");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashToken(refreshToken); // User obj ki copy = user(mongoose doc), pehle iss copied user obj mai k:v pair dala
  await user.save({ validateBeforeSave: false }); // phir DB mai store ker diya

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  return { user: userObj, accessToken, refreshToken };
};

const refresh = async (token) => {
  if (!token) throw ApiError.unauthorised("Refresh token missing");
  const decoded = verifyRefreshToken(token); // this is our env level check

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user) throw ApiError.unauthorised("User not found");

  if (user.refreshToken !== hashToken(token)) {
    // this is our DB level check
    throw ApiError.unauthorised("Invalid refresh token — please log in again");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });

  return { accessToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const verifyEmail = async (token) => {
  const trimmed = String(token).trim();
  if (!trimmed) {
    throw ApiError.badRequest("Invalid or expired verification token");
  }

  const hashedToken = hashToken(trimmed)
  const user = await User.findOne({verificationToken: hashedToken}).select("+verificationToken")

  if(!user) throw ApiError.badRequest("Invalid or expired verification token");
  
  await User.findByIdAndUpdate(user._id, {
    $set: { isVerified: true },
    $unset: { verificationToken: 1 },
  });

  return user
}

const forgotPassword = async (email) => {
    const user = await User.findOne({email})
    if(!user) throw ApiError.notFound("No account with this email")

    const {rawToken, hashedToken} = generateResetToken()

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000                 // 15 min expiry time
    await user.save()

    try{
      await sendResetPasswordEmail(email, rawToken)
    } catch(err) {
      console.error("Failed to send reset email:", err.message);
    }
}

const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token)

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires")

  if (!user) throw ApiError.badRequest("Invalid or expired reset token");

  user.password = newPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()
}

const getMe = async (userID) => {
  const user = await User.findById(userID)
  if(!user) throw ApiError.notFound("User not found");
  return user
}

const avatarUpload = async (userID, file) => {
  try {
    const fileStream = fs.createReadStream(file.path)
    const uploadResponse = await imagekit.files.upload({
      file:fileStream,
      fileName:file.filename,
      folder:"/user-avatars"
    })

    await User.findByIdAndUpdate(userID, {avatar:uploadResponse.url}, {new:true})

    fs.unlinkSync(file.path);

    return {
      url:uploadResponse.url,
      fileId:uploadResponse.fileId
    }
  } catch (error) {
      try {
        if(file.path && fs.existsSync(file.path)){
          fs.unlinkSync(file.path);
        }
      } catch (error) {
          console.error("Error deleting temp file:", error);
      }

      throw error;
  }
}

export { register, login, refresh, logout, verifyEmail, forgotPassword, resetPassword, getMe, avatarUpload};

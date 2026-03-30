import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.utils";
import User from "./auth.model.js";
import ApiError from "../../common/utils/api-error.js";
import { sendVerificationEmail } from "../../common/config/email.js";

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
    await sendVerificationEmail(email, token)
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

  const user = await User.findOne(email).select("+password"); // we got full userObj {email, password, role, ...}
  if (!user) throw ApiError.unauthorised("Invalid Email or password");

  // somehow I will check password
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
    throw ApiError.unauthorised("Invalid refresh token");
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id });

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.refreshToken;
  delete userObj.password; // this like here is optional

  return { user: userObj, accessToken, refreshToken };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const forgotPassword = async (email) => {
    const user = await User.findOne({email})
    if(!user) throw ApiError.notFound("No account with this email")

    const {rawToken, hashedToken} = generateResetToken()

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000                 // 15 min expiry time
    await user.save()

    // TODO: mail bhejna ni aata
}

const verifyEmail = async (token) => {
  const hashedToken = hashToken(token)
  const user = await User.findOne({verificationToken: hashedToken}).select("+verificationToken")

  if(!user) throw ApiError.badRequest("Invalid or expired token");
  
  user.isVerified = true;
  user.verificationToken = undefined
  await user.save()
  return user
}

const getMe = async (userID) => {
  const user = await User.findById(userID)
  if(!user) throw ApiError.notFound("User not found");
  return user
}

export { register, login, refresh, logout, forgotPassword, verifyEmail, getMe};

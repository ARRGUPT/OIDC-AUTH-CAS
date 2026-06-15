import mongoose from "mongoose";

const authorizationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    clientId: {
      type: String,
      required: true,
    },

    redirectUri: {
      type: String,
      required: true,
    },

    scope: {
      type: String,
      default: "openid email profile",
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const AuthorizationCode = mongoose.model("AuthorizationCode", authorizationCodeSchema);

export default AuthorizationCode;

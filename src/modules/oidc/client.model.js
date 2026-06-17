import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    clientSecret: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    redirectUris: {
      type: [String],
      required: true,
      default: [],
    },

    allowedScopes: {
      type: [String],
      default: ["openid", "email", "profile"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Client = mongoose.model("Client", clientSchema);

export default Client;

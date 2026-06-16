import crypto from "node:crypto";
import path from "node:path";

import jose from "node-jose";

import User from "../auth/auth.model.js";
import ApiError from "../../common/utils/api-error.js";
import { PUBLIC_KEY } from "../../common/utils/cert.utils.js";
import {generateIdToken,verifyIdToken} from "../../common/utils/oidc-token.utils.js";
import AuthorizationCode from "./authorization-code.model.js";
import { findClient } from "./oidc.clients.js";

const getIssuer = () => {
  return (
    process.env.OIDC_ISSUER || `http://localhost:${process.env.PORT || 5000}`
  );
};

export const openidConfiguration = async (req, res) => {
  const issuer = getIssuer();

  return res.json({
    issuer,
    authorization_endpoint: `${issuer}/o/authorize`,
    token_endpoint: `${issuer}/o/token`,
    userinfo_endpoint: `${issuer}/o/userinfo`,
    jwks_uri: `${issuer}/.well-known/jwks.json`,

    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],

    subject_types_supported: ["public"],                        // public: same user gets same sub(user id) everywhere | pairwise: diff sub
    id_token_signing_alg_values_supported: ["RS256"],

    scopes_supported: ["openid", "email", "profile"],           // client can request full claim (sub, email, ...)

    claims_supported: [
      "sub",
      "email",
      "email_verified",
      "name",
      "given_name",
      "picture",
    ],
  });
};

export const jwks = async (req, res) => {
  const key = await jose.JWK.asKey(PUBLIC_KEY, "pem");
  const publicJwk = key.toJSON();

  publicJwk.kid = "main-key";
  publicJwk.use = "sig";
  publicJwk.alg = "RS256";

  return res.json({ keys: [publicJwk] });
};

export const oAuthenticate = async (req, res) => {
  return res.sendFile(path.resolve("public", "authenticate.html"));
};

export const oLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw ApiError.unauthorised("Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw ApiError.unauthorised("Invalid email or password");
  }

  if (!user.isVerified) {
    throw ApiError.forbidden("Please verify your email before login");
  }

  req.session.userId = String(user._id);

  return res.json({
    success: true,
    message: "Logged in success",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const oAuthorize = async (req, res) => {
  const {
    response_type,
    client_id,
    redirect_uri,
    scope = "openid email profile",
    state,                                    // is a security value, used to prevent CSRF attacks and help client application remember context
  } = req.query;

  // console.log(req.session);

  if (response_type !== "code") {
    return res.status(400).json({
      error: "unsupported_response_type",
      error_description: "Only response_type=code is supported",
    });
  }

  const client = findClient(client_id);

  if (!client) {
    return res.status(400).json({
      error: "invalid_client",
      error_description: "Invalid client_id",
    });
  }

  if (!client.redirectUris.includes(redirect_uri)) {
    return res.status(400).json({
      error: "invalid_redirect_uri",
      error_description: "redirect_uri is not registered for this client",
    });
  }

  if (!req.session.userId) {
  return res.status(401).json({
    error: "login_required",
    error_description: "Please login first",
  });
}

  const code = crypto.randomBytes(32).toString("hex");

  await AuthorizationCode.create({
    code,
    user: req.session.userId,
    clientId: client_id,
    redirectUri: redirect_uri,
    scope,
    expiresAt: new Date(Date.now() + 1 * 60 * 1000),         // 1 min
  });

  const redirectUrl = new URL(redirect_uri);

  redirectUrl.searchParams.set("code", code);

  if (state) {
    redirectUrl.searchParams.set("state", state);
  }

  return res.redirect(redirectUrl.toString());
};

export const token = async (req, res) => {
  const {
    grant_type,
    code,
    client_id,
    client_secret,
    redirect_uri,
  } = req.body;

  if (grant_type !== "authorization_code") {
    return res.status(400).json({
      error: "unsupported_grant_type",
      error_description: "Only authorization_code grant is supported",
    });
  }

  const client = findClient(client_id);

  if (!client || client.clientSecret !== client_secret) {
    return res.status(401).json({
      error: "invalid_client",
      error_description: "Invalid client credentials",
    });
  }

  const authCode = await AuthorizationCode.findOne({ code }).populate("user");

  if (!authCode) {
    return res.status(400).json({
      error: "invalid_grant",
      error_description: "Invalid authorization code",
    });
  }

  if (authCode.used) {
    return res.status(400).json({
      error: "invalid_grant",
      error_description: "Authorization code already used",
    });
  }

  if (authCode.expiresAt < new Date()) {                    // 10:01:00 < 10:03:00
    return res.status(400).json({
      error: "invalid_grant",
      error_description: "Authorization code expired",
    });
  }

  if (authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri) {
    return res.status(400).json({
      error: "invalid_grant",
      error_description: "Authorization code does not match client or redirect_uri",
    });
  }

  authCode.used = true;
  await authCode.save();

  const idToken = generateIdToken(authCode.user);

  return res.json({
    token_type: "Bearer",
    expires_in: 3600,
    id_token: idToken,
  });
};

export const oLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw ApiError.internal("Logout failed");
    }

    res.clearCookie("trush.sid");

    return res.json({
      success: true,
      message: "Logged out success",
    });
  });
};

export const userInfo = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw ApiError.unauthorised("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);
  const claims = verifyIdToken(token);

  const user = await User.findById(claims.sub);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return res.json({
    sub: String(user._id),
    email: user.email,
    email_verified: user.isVerified,
    name: user.name,
    given_name: user.name?.split(" ")[0] || "",
    picture: user.avatar || null,
  });
};

import jwt from "jsonwebtoken";
import { PRIVATE_KEY, PUBLIC_KEY } from "./cert.utils.js";

const getIssuer = () => {
  return (
    process.env.OIDC_ISSUER || `http://localhost:${process.env.PORT || 5000}`
  );
};

export const generateIdToken = (user) => {
  const now = Math.floor(Date.now() / 1000);

  const claims = {
    iss: getIssuer(),
    sub: String(user._id),
    email: user.email,
    email_verified: Boolean(user.isVerified),
    exp: now + 60 * 60,
    iat: now,
    given_name: user.name?.split(" ")[0] || "",
    name: user.name,
    picture: user.avatar || undefined,
  };

  return jwt.sign(claims, PRIVATE_KEY, {
    algorithm: "RS256",
    keyid: "main-key",
  });
};

export const generateAccessToken = (user, clientId, scope) => {
  const now = Math.floor(Date.now() / 1000);

  const claims = {
    iss: getIssuer(),
    sub: String(user._id),
    aud: clientId,
    scope,
    token_use: "access_token",
    exp: now + 60 * 60,
    iat: now,
  };

  return jwt.sign(claims, PRIVATE_KEY, {
    algorithm: "RS256",
    keyid: "main-key",
  });
};

export const verifyIdToken = (token) => {
  return jwt.verify(token, PUBLIC_KEY, {
    algorithms: ["RS256"],
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, PUBLIC_KEY, {
    algorithms: ["RS256"],
  });
};

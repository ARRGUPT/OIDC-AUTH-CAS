import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";

import authRoute from "./modules/auth/auth.routes.js";
import oidcRoute from "./modules/oidc/oidc.routes.js";
import ApiError from "./common/utils/api-error.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    name: "trush.sid", // cookei key
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "session",
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,             // 2 days
    },
  }),
);

app.use("/api/auth", authRoute);
app.use("/", oidcRoute);

// catch-all for undefined routes
// app.all handle all HTTP methods(GET, POST, ...)
// if req not match to previous route, then come here and throw error
app.all("{*path}", (req, res) => {
  throw ApiError.notFound(`Route ${req.originalUrl} not found`);
});

export default app;

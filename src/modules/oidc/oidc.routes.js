import { Router } from "express";
import * as controller from "./oidc.controller.js";

const router = Router();

router.get("/.well-known/openid-configuration", controller.openidConfiguration);
router.get("/.well-known/jwks.json", controller.jwks);

router.get("/o/authenticate", controller.oAuthenticate)
router.get("/o/authorize", controller.authorize);
router.post("/o/token", controller.token);
router.get("/o/userinfo", controller.userInfo);

export default router;

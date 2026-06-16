import { Router } from "express";
import * as controller from "./oidc.controller.js";

const router = Router();

router.get("/.well-known/openid-configuration", controller.openidConfiguration);
router.get("/.well-known/jwks.json", controller.jwks);

// router.get("/o/authenticate", controller.oAuthenticate)
router.post("/o/login", controller.oLogin)
router.post("/o/logout", controller.oLogout);

router.get("/o/authorize", controller.oAuthorize);

router.post("/o/token", controller.token);
router.post("/o/revoke", controller.revoke)
router.post("/o/introspect", controller.introspect)

router.get("/o/userinfo", controller.userInfo);

export default router;

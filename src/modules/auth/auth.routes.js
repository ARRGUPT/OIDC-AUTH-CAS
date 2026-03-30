import { Router } from "express";
import * as controller from "./auth.controller.js"
import validate from "../../common/middleware/validate.middleware.js";
import RegisterDto from "./dto/register.dto.js";
import { authenticate } from "./auth.middleware.js";
import LoginDto from "./dto/login.dto.js";
import { verifyEmail } from "./auth.service.js";

const router = Router()

router.post("/register", validate(RegisterDto), controller.register)
router.post("/login", validate(LoginDto), controller.login)
router.post("/logout", authenticate, controller.logout)
router.get("/verify/:token", controller.verifyEmail)
router.get("/me", authenticate, controller.getMe)

export default router

import * as authService from "./auth.service.js"
import ApiResponse from "../../common/utils/api-response.js"

const register = async (req, res) => {
    const user = await authService.register(req.body)
    ApiResponse.created(res, "Registration Success", user)
}

const login = async (req, res) => {
    const {user, accessToken, refreshToken} = await authService.login(req.body)

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,                                 // prevent js from accessing cookei
        maxAge: 7 * 24 * 60 * 60 * 1000,                // expiry: 7 days
        // secure: true,                                   // Cookie is only sent over HTTPS
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    })

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        // secure: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    })

    ApiResponse.ok(res, "Login Successful", {user})
}

const logout = async (req, res) => {
    await authService.logout(req.user.id)
    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")
    ApiResponse.ok(res, "Logout successfull")
}

const verifyEmail = async (req, res) => {
    const user = await authService.verifyEmail(req.params.token)

    ApiResponse.ok(res, "Email verified successfully")
}

const getMe = async (req, res) => {
    const user = await authService.getMe(req.user.id)
    return ApiResponse.ok(res, "User profile", user)
}

export {register, login, logout, verifyEmail, getMe}

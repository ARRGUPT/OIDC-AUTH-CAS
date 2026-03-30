import ApiError from "../../common/utils/api-error";
import { verifyAccessToken } from "../../common/utils/jwt.utils";
import User from "./auth.model.js"

const authenticate = async (req, res, next) => {                        // authenticate === isLoggedin (lly)
    let token;
    if(req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
    }

    if(!token) throw ApiError.unauthorised("Not Authenticated");
    const decoded = verifyAccessToken(token)
    const user = User.findById(decoded.id);
    if(!user) throw ApiError.unauthorised("User no longer exists");

    req.user = {                // req mai user field add ker rhe hai
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
    }

    next()
}

const authorize = (...roles) => {           // roles is an array
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            throw ApiError.forbidden("You do not have permission to perform this action")
        }
        next()
    }
}

export {authenticate, authorize}

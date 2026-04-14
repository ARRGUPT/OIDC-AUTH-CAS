import Joi from "joi"
import BaseDto from "../../../common/dto/base.dto.js"

class LoginDto extends BaseDto {
    static schema = Joi.object({
        email: Joi.string().email().max(50).lowercase().required(),
        password: Joi.string()
        .messages({
        "string.min": "Password must contain at least 8 characters",            // define validation rule
        "any.required": "Password is required",                                 // custom messages
        })
        .min(8).max(50).required(),
    })
}

export default LoginDto

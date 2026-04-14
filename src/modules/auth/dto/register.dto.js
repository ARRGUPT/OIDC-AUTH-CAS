import Joi from "joi";
import BaseDto from "../../../common/dto/base.dto.js";

class RegisterDto extends BaseDto {
    static schema = Joi.object({
        name: Joi.string().trim().min(2).max(50).required(),
        email: Joi.string().email().max(50).lowercase().required(),
        password: Joi.string()
        .messages({
        "string.min": "Password must contain at least 8 characters",            // define validation rule
        "any.required": "Password is required",                                 // custom messages
        })
        .min(8).max(50).required(),
        role: Joi.string().valid("customer", "seller").default("customer"),
    })
}

export default RegisterDto

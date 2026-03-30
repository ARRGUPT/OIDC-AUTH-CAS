import Joi from "joi"
import BaseDto from "../../../common/dto/base.dto"

class LoginDto extends BaseDto {
    static schema = Joi.object({
        email: Joi.string().email().max(50).lowercase().required(),
        password: Joi.string()
        .message("Password must contain 8 char minimum")
        .min(8).max(50).required(),
    })
}

export default LoginDto

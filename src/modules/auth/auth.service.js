import { generateResetToken } from "../../common/utils/jwt.utils"
import User from "./auth.model.js"
import ApiError from "../../common/utils/api-error.js"


const register = async ({name, email, password, role}) => {
    const existing = await User.findOne({email})
    if(existing) throw ApiError.conflict("User with this Email already exists");

    const {rawToken, hashedToken} = generateResetToken()
    
    const user = await User.create({             // DB mai ye sb rakh diya, user === mongoose document naki obj
        name,
        email,
        password,
        role,
        verificationToken: hashedToken
    })

    // TODO: send an email to user with token: rawToken

    const userObj = user.toObject()
    delete userObj.password
    delete userObj.verificationToken

    return userObj
}


export {register}

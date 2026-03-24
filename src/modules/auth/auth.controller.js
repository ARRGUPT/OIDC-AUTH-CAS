import * as authService from "./auth.service.js"
import ApiResponse from "../../common/utils/api-response.js"

const register = async (req, res) => {
    const user = await authService.register(req.body)
    ApiResponse.created(res, "Registrtion Success", user)
}

export {register}

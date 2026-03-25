class ApiError extends Error {
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)         // for logging bagera
    }

    static badRequest(message = "Bad request") {
        return new ApiError(400, message)
    }

    static unauthorised(message = "unauthorised") {
        return new ApiError(401, message)
    }

    static conflict(message = "conflict") {
        return new ApiError(409, message)
    }

    static forbidden(message = "forbidden") {               // preventing logging in non-verifed users
        return new ApiError(412, message)
    }

    static notFound(message = "not found") {               // can use unauthorise
        return new ApiError(412, message)
    }
}

export default ApiError

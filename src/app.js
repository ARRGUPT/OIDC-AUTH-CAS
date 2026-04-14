import cookieParser from "cookie-parser"
import express from "express"
import authRoute from "./modules/auth/auth.routes.js"
import ApiError from "./common/utils/api-error.js"

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())

app.use("/api/auth", authRoute)

// catch-all for undefined routes
// app.all handle all HTTP methods(GET, POST, ...)
// if req not match to previous route, then come here and throw error
app.all("{*path}", (req, res) => {
    throw ApiError.notFound(`Route ${req.originalUrl} not found`)
})

export default app

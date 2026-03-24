import mongoose from "mongoose";

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI)              // (mongoose <-> mongoDB) conn done
    console.log(`MongoDB connected: ${conn.connection.host}`)
}

export default connectDB

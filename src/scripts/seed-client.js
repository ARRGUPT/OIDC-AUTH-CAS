import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "../common/config/db.js";
import Client from "../modules/oidc/client.model.js";

const seedClient = async () => {
  await connectDB();

  const clientId = "trush-blog";
  //   const clientSecret = "trush-blog-secret";
  const plainClientSecret = crypto.randomBytes(32).toString("hex");
  const hashedClientSecret = await bcrypt.hash(plainClientSecret, 10);

  const existingClient = await Client.findOne({ clientId });

  if (existingClient) {
    console.log("Client already exists");
    process.exit(0);
  }

  await Client.create({
    clientId,
    clientSecret: hashedClientSecret,
    name: "Trush Blog",
    redirectUris: ["http://localhost:3000/callback"],
    allowedScopes: ["openid", "email", "profile"],
  });

  console.log("Client created successfully");
  console.log("CLIENT SECRET:", plainClientSecret);
  process.exit(0);
};

seedClient();

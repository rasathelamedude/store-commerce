import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

export const {
  PORT,
  DB_CONNECTION_URI,
  ACCESS_SECRET_KEY,
  REFRESH_SECRET_KEY,
  REDIS_URI,
  NODE_ENV,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  CLIENT_URL,
} = process.env;

import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

export const PORT = process.env.PORT || 5110;
export const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;
export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
export const REDIS_URI = process.env.REDIS_URI;
export const NODE_ENV = process.env.NODE_ENV
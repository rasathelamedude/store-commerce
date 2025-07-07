import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

export const PORT = process.env.PORT || 5110;
export const DB_CONNECTION_URI = process.env.DB_CONNECTION_URI;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

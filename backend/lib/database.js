import mongoose from "mongoose";
import { DB_CONNECTION_URI } from "../config/env.js";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_CONNECTION_URI + "");

    console.log("Successfully connected to the database!");
  } catch (error) {
    console.log(
      `Error occured while connecting to the database ${error.message}`
    );

    process.exit(1);
  }
};

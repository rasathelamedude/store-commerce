import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET_KEY, JWT_EXPIRES_IN } from "../config/env.js";

export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: "Signed up successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const signIn = async (req, res, next) => {
  try {
  } catch (error) {}
};

export const signOut = async (req, res, next) => {};

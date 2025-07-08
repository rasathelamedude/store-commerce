import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from "../config/env.js";
import { redis } from "../lib/redis.js";
import { NODE_ENV } from "../config/env.js";

// helper function to generate tokens;
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET_KEY, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET_KEY, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// helper function to store refresh token;
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token: ${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  ); // expire in 7 days;
};

// helper function to set cookies;
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevents xss attacks;
    sameSite: "strict", // prevents CSRF attacks;
    secure: NODE_ENV === "production", // only true in prod;
    maxAge: 15 * 60 * 1000, // expires in 15 minutes;
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const signUp = async (req, res, next) => {
  try {
    // get user details;
    const { name, email, password } = req.body;

    // check if user already exists;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // create user;
    const user = await User.create({
      name,
      email,
      password,
    });

    // generate tokens;
    const { accessToken, refreshToken } = generateTokens(user._id);

    // save refresh token in the database (redis);
    await storeRefreshToken(user._id, refreshToken);

    // set cookies;
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      message: "Signed up successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: refreshToken,
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

export const signOut = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
      await redis.del(`refresh_token: ${decoded._id}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

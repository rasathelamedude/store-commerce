import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from "../lib/env.js";
import { redis } from "../lib/redis.js";
import { NODE_ENV } from "../lib/env.js";

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

export const signUp = async (req, res) => {
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

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User doesn't exist!");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Password is invalid!");
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
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

export const signOut = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY); // we need the id associated with it;
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

export const refreshToken = async (req, res) => {
  // re-creating (refreshing) an access token if it's expired;

  // 1. user has to first provide a refresh token (from cookies);
  // 2. decode that refresh token to get the user's ID;
  // 3. get the value of that ID in our redis database;
  // 4. if the provided refresh token is not the same as the one in the redis, error;
  // 5. if not create a new token and set the cookie for it;

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res
        .status(401)
        .json({ success: false, message: "No refresh token is provided" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const storedToken = await redis.get(`refresh_token: ${decoded.userId}`);

    if (storedToken !== refreshToken) {
      res
        .status(401)
        .json({ success: false, message: "refresh token is invalid" });
    }

    const accessToken = jwt.sign({ userId: decoded._id }, ACCESS_SECRET_KEY, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: NODE_ENV === "production",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Fetched user profile",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

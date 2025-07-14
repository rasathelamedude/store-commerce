import jwt from "jsonwebtoken";
import { ACCESS_SECRET_KEY } from "../lib/env.js";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const decoded = jwt.verify(accessToken, ACCESS_SECRET_KEY);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new Error("User not found!");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminRoute = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      throw new Error("Access denied - Admin only");
    }
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};

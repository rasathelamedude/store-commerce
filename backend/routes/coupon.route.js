import { Router } from "express";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const couponRouter = Router();

couponRouter.get("/", protectRoute, getCoupon);
couponRouter.post("/validate", protectRoute, validateCoupon);

export default couponRouter;
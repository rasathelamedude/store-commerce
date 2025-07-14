import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
  getProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.post("/refresh-token", refreshToken);
authRouter.get("/profile", protectRoute, getProfile);

export default authRouter;

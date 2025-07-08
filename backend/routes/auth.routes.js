import { Router } from "express";
import {
  signUp,
  signIn,
  signOut,
  refreshToken,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", signOut);
authRouter.post("/refresh-token", refreshToken);

export default authRouter;

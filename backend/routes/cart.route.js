import { Router } from "express";
import {
  addToCart,
  deleteAllFromCart,
  updateQuantity,
  getCartProducts,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const cartRouter = Router();

cartRouter.get("/", protectRoute, getCartProducts);

cartRouter.post("/", protectRoute, addToCart);

cartRouter.put("/:productId", protectRoute, updateQuantity);

cartRouter.delete("/:productId", protectRoute, deleteAllFromCart);

export default cartRouter;

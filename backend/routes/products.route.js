import { Router } from "express";
import {
  getAllProducts,
  getFeaturedProducts,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const productRouter = Router();

productRouter.get("/", protectRoute, adminRoute, getAllProducts);
productRouter.get("/", getFeaturedProducts);

export default productRouter;

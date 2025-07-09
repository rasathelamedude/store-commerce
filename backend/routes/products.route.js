import { Router } from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProducts
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const productRouter = Router();

productRouter.get("/", protectRoute, adminRoute, getAllProducts);
productRouter.get("/", getFeaturedProducts);

productRouter.post("/", protectRoute, adminRoute, createProducts);

export default productRouter;

import { Router } from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProducts,
  deleteProduct,
  getRecommendedProducts,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const productRouter = Router();

productRouter.get("/", protectRoute, adminRoute, getAllProducts);
productRouter.get("/featured", getFeaturedProducts);
productRouter.get("/recommendations", getRecommendedProducts);

productRouter.post("/", protectRoute, adminRoute, createProducts);

productRouter.delete("/:productId", protectRoute, adminRoute, deleteProduct);

export default productRouter;

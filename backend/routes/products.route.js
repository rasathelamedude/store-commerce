import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const productRouter = Router();

productRouter.get("/", protectRoute, adminRoute, getAllProducts);

export default productRouter;

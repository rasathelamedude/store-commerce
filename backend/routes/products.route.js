import { Router } from "express";
import { getAllProducts } from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.get("/", protectRoute, adminRoute, getAllProducts);

export default productRouter;

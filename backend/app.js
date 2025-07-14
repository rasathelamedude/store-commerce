import { PORT } from "./lib/env.js";
import express from "express";
import authRouter from "./routes/auth.route.js";
import { connectToDatabase } from "./lib/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRouter from "./routes/products.route.js";
import cartRouter from "./routes/cart.route.js";
import couponRouter from "./routes/coupon.route.js";
import paymentRouter from "./routes/payment.route.js";
import analyticsRouter from "./routes/analytics.route.js";

const app = express();

// built-in | third part middlewares;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(cookieParser()); // needed to work with cookies;

// routes;
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);

  await connectToDatabase();
});

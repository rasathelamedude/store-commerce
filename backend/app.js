import { PORT } from "./config/env.js";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import { connectToDatabase } from "./lib/database.js";
import cors from "cors";
import cookieParser from "cookie-parser";

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
app.use(cookieParser());

// routes;
app.use("/api/v1/auth", authRouter);

app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);

  await connectToDatabase();
});

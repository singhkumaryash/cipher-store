import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.set("trust proxy", 1);

// header security middleware
app.use(helmet());

// log middleware
const logFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(logFormat));

// cors middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRoute from "./routes/user.routes.js";
import credentialRoute from "./routes/credential.routes.js";
import platformRoute from "./routes/platform.routes.js";

// routes middlewares
app.use("/api/v1/users", userRoute);
app.use("/api/v1/credentials", credentialRoute);
app.use("/api/v1/platforms", platformRoute);

app.use((err, req, res, _) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(err);

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],

    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;

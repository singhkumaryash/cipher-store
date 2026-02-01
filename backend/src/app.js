import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

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

export default app;

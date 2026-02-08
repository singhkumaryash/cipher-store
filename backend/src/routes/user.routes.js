import { Router } from "express";
import {
  changePassword,
  deleteUser,
  getUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/update").patch(verifyJWT, updateUser);

router.route("/delete").delete(verifyJWT, deleteUser);

router.route("/change-password").patch(verifyJWT, changePassword);

router.route("/:id").get(getUser);

export default router;

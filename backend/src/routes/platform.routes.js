import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addPlatform,
  deletePlatform,
  getAllPlatforms,
  getPlatform,
  updatePlatform,
} from "../controllers/platform.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(addPlatform).get(getAllPlatforms);

router
  .route("/:id")
  .get(getPlatform)
  .patch(updatePlatform)
  .delete(deletePlatform);

export default router;

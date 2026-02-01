import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCredential,
  getCredentials,
  getCredentialById,
  updateCredentials,
  deleteCredential,
  revealPassword,
} from "../controllers/credential.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(addCredential).get(getCredentials);

router.route("/:id/reveal").get(revealPassword);

router
  .route("/:id")
  .get(getCredentialById)
  .patch(updateCredentials)
  .delete(deleteCredential);

export default router;

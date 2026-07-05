import express from "express";
import * as authController from "../controllers/authController.js";
import { validateBody } from "../middlewares/validationMiddlewares.js";
import {
    loginSchema,
    signupSchema,
    githubSignupSchema
} from "@socket-talk/shared/schemas/authSchemas.js";
import { requireAuth } from "../middlewares/authMiddlewares.js";

const authRouter = express.Router();

authRouter.get("/me", requireAuth, authController.getUser);

authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/signup", validateBody(signupSchema), authController.signup);
authRouter.post("/logout", requireAuth, authController.logout);

authRouter.get("/github", authController.redirectToGithubOauth);
authRouter.get("/github/callback", authController.handleGithubOauthCallback);
authRouter.get("/github/pending-signup", authController.getGithubPendingSignupData);

authRouter.post("/github/pending-signup", validateBody(githubSignupSchema), authController.signupWithGithub);

export default authRouter;

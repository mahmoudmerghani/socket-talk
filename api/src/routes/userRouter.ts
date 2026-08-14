import express from "express";
import { requireAuth } from "../middlewares/authMiddlewares.js";
import * as userController from "../controllers/userController.js";
import {
    uploadImage,
    handleMulterError,
} from "../middlewares/imageMiddlewares.js";

const userRouter = express.Router();

userRouter.use(requireAuth);

userRouter.get("/", userController.getUsers);

userRouter.get("/:userId", userController.getUser);

const avatarMaxSize = 2 * 1024 * 1024; // 2 MB

userRouter.patch(
    "/me/avatar",
    uploadImage(avatarMaxSize, "avatar"),
    handleMulterError(avatarMaxSize, "avatar"),
    userController.updateAvatar,
);

export default userRouter;

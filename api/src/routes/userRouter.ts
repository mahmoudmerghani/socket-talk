import express from "express";
import multer, { memoryStorage } from "multer";
import { requireAuth } from "../middlewares/authMiddlewares.js";
import { HttpError } from "../utils/HttpError.js";
import * as userController from "../controllers/userController.js";
import type { ErrorRequestHandler } from "express";

const userRouter = express.Router();

userRouter.use(requireAuth);

const upload = multer({
    storage: memoryStorage(),
    limits: {
        fileSize: 1024 * 1024,
    },
}).single("avatar");

const handleMulterError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                throw new HttpError(413, "Image must be at most 1 MB.");
            case "LIMIT_UNEXPECTED_FILE":
                throw new HttpError(
                    400,
                    `Unexpected field: "${err.field}". Expected "avatar".`,
                );
            case "LIMIT_FILE_COUNT":
                throw new HttpError(400, "Only one file may be uploaded.");
            default:
                throw new HttpError(400, "Invalid file upload.");
        }
    }

    throw err;
};

userRouter.patch("/me/avatar", upload, handleMulterError, userController.updateAvatar);

export default userRouter;

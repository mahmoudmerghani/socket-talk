import multer, { memoryStorage } from "multer";
import { HttpError } from "../utils/HttpError.js";
import type { ErrorRequestHandler } from "express";

export const uploadImage = (fileSize: number, name: string) =>
    multer({
        storage: memoryStorage(),
        limits: {
            fileSize, // 2 MB,
        },
    }).single(name);

export const handleMulterError: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                throw new HttpError(413, "Image must be at most 2 MB.");
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

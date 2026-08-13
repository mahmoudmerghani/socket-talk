import type { RequestHandler } from "express";
import { updateUserAvatar } from "../services/imageService.js";
import { HttpError } from "../utils/HttpError.js";

export const updateAvatar: RequestHandler = async (req, res) => {
    if (!req.file) {
        throw new HttpError(400, "Group image is required");
    }

    const result = await updateUserAvatar(req.user.id, req.file.buffer);

    res.json(result);
};

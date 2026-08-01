import type { RequestHandler } from "express";
import { updateUserAvatar } from "../services/imageService.js";

export const updateAvatar: RequestHandler = async (req, res) => {
    const result = await updateUserAvatar(
        req.user.id,
        req.file!.buffer,
    );

    res.json(result);
};

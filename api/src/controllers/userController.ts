import type { RequestHandler } from "express";
import * as userService from "../services/userService.js";

export const updateAvatar: RequestHandler = async (req, res) => {
    const result = await userService.updateAvatar(
        req.user.id,
        req.user.avatarPath,
        req.file!.buffer,
    );

    res.json(result);
};

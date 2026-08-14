import * as userService from "../services/userService.js";
import type { RequestHandler } from "express";
import { updateUserAvatar } from "../services/imageService.js";
import { HttpError } from "../utils/HttpError.js";
import {
    searchUsersQuerySchema,
    userIdParamSchema,
} from "@socket-talk/shared/schemas/userSchemas.js";

export const getUsers: RequestHandler = async (req, res) => {
    if (req.query.q !== undefined) {
        const { q } = searchUsersQuerySchema.parse(req.query);
        const users = await userService.searchUsersByUsernameOrDisplayName(q);
        res.json(users);
    } else {
        const users = await userService.getAllUsers();
        res.json(users);
    }
};

export const getUser: RequestHandler = async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);

    const user = await userService.getUserById(userId);

    res.json(user);
};

export const updateAvatar: RequestHandler = async (req, res) => {
    if (!req.file) {
        throw new HttpError(400, "Group image is required");
    }

    const result = await updateUserAvatar(req.user.id, req.file.buffer);

    res.json(result);
};

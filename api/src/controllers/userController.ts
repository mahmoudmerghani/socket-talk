import * as userService from "../services/userService.js";
import type { Controller } from "../utils/controller.js";
import { updateUserAvatar } from "../services/imageService.js";
import { HttpError } from "../utils/HttpError.js";
import {
    searchUsersQuerySchema,
    userIdParamSchema,
} from "@socket-talk/shared/schemas/userSchemas.js";
import {
    toGetUserResponse,
    toGetUsersResponse,
    toUpdateAvatarResponse,
} from "../mappers/userMappers.js";

export const getUsers: Controller<"/users", "GET"> = async (req, res) => {
    if (req.query.q !== undefined) {
        const { q } = searchUsersQuerySchema.parse(req.query);
        const users = await userService.searchUsersByUsernameOrDisplayName(q);
        res.json(toGetUsersResponse(users));
    } else {
        const users = await userService.getAllUsers();
        res.json(toGetUsersResponse(users));
    }
};

export const getUser: Controller<"/users/:userId", "GET"> = async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);

    const user = await userService.getUserById(userId);

    res.json(toGetUserResponse(user));
};

export const updateAvatar: Controller<"/users/me/avatar", "PATCH"> = async (req, res) => {
    if (!req.file) {
        throw new HttpError(400, "Group image is required");
    }

    const result = await updateUserAvatar(req.user.id, req.file.buffer);

    res.json(toUpdateAvatarResponse(result));
};

import type { Controller } from "../utils/controller.js";
import * as conversationService from "../services/conversationService.js";
import * as imageService from "../services/imageService.js";
import {
    conversationIdParamSchema,
    createGroupSchema,
    searchGroupsQuerySchema,
} from "@socket-talk/shared/schemas/conversationSchemas.js";
import { HttpError } from "../utils/HttpError.js";
import {
    toCreateGroupResponse,
    toGetGroupInfoResponse,
    toGetGroupMembersResponse,
    toGetGroupsResponse,
    toUpdateGroupImageResponse,
} from "../mappers/groupMappers.js";

export const getGroups: Controller<"/groups", "GET"> = async (req, res) => {
    if (req.query.q !== undefined) {
        const { q } = searchGroupsQuerySchema.parse(req.query);
        const groups = await conversationService.searchGroupsByName(q);
        res.json(toGetGroupsResponse(groups));
    } else {
        const groups = await conversationService.getAllGroups();
        res.json(toGetGroupsResponse(groups));
    }
};

export const getGroupInfo: Controller<
    "/groups/:conversationId",
    "GET"
> = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    const result = await conversationService.getGroupInfo(conversationId);

    res.json(toGetGroupInfoResponse(result));
};

export const addUserToGroup: Controller<
    "/groups/:conversationId/members",
    "POST"
> = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    await conversationService.addUserToGroup(req.user.id, conversationId);

    res.status(204).end();
};

export const removeUserFromGroup: Controller<
    "/groups/:conversationId/members",
    "DELETE"
> = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    await conversationService.removeUserFromGroup(req.user.id, conversationId);

    res.status(204).end();
};

export const getGroupMembers: Controller<
    "/groups/:conversationId/members",
    "GET"
> = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    const members = await conversationService.getGroupMembers(conversationId);

    res.json(toGetGroupMembersResponse(members));
};

export const createGroup: Controller<"/groups", "POST"> = async (req, res) => {
    const body = createGroupSchema.parse(req.body);

    const group = await conversationService.createGroup(req.user.id, body);

    res.json(toCreateGroupResponse(group));
};

export const updateGroupImage: Controller<
    "/groups/:conversationId/group-image",
    "PATCH"
> = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    if (!req.file) {
        throw new HttpError(400, "Group image is required");
    }

    const result = await imageService.updateGroupImage(
        req.user.id,
        conversationId,
        req.file.buffer,
    );

    res.json(toUpdateGroupImageResponse(result));
};

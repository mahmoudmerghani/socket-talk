import type { RequestHandler } from "express";
import * as conversationService from "../services/conversationService.js";
import * as imageService from "../services/imageService.js";
import {
    conversationIdParamSchema,
    createGroupSchema,
    searchGroupsQuerySchema,
} from "@socket-talk/shared/schemas/conversationSchemas.js";
import { HttpError } from "../utils/HttpError.js";

export const getGroups: RequestHandler = async (req, res) => {
    if (req.query.q !== undefined) {
        const { q } = searchGroupsQuerySchema.parse(req.query);
        const groups = await conversationService.searchGroupsByName(q);
        res.json(groups);
    } else {
        const groups = await conversationService.getAllGroups();
        res.json(groups);
    }
};

export const getGroupInfo: RequestHandler = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    const result = await conversationService.getGroupInfo(conversationId);

    res.json(result);
};

export const addUserToGroup: RequestHandler = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    await conversationService.addUserToGroup(req.user.id, conversationId);

    res.status(204).end();
};

export const removeUserFromGroup: RequestHandler = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    await conversationService.removeUserFromGroup(req.user.id, conversationId);

    res.status(204).end();
};


export const getGroupMembers: RequestHandler = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    const members = await conversationService.getGroupMembers(conversationId);

    res.json(members);
};

export const createGroup: RequestHandler = async (req, res) => {
    const body = createGroupSchema.parse(req.body);

    const group = await conversationService.createGroup(req.user.id, body);

    res.json(group);
};

export const updateGroupImage: RequestHandler = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    if (!req.file) {
        throw new HttpError(400, "Group image is required");
    }

    const result = imageService.updateGroupImage(
        req.user.id,
        conversationId,
        req.file.buffer,
    );

    res.json(result);
};

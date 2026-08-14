import * as conversationService from "../services/conversationService.js";
import * as messageService from "../services/messageService.js";
import type { RequestHandler } from "express";
import { userIdParamSchema } from "@socket-talk/shared/schemas/userSchemas.js";
import { createMessageSchema } from "@socket-talk/shared/schemas/messageSchemas.js";

export const getDM: RequestHandler = async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);

    const dm = await conversationService.getDM(req.user.id, userId);

    res.json(dm);
};

export const sendMessageToUser: RequestHandler = async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);
    const body = createMessageSchema.parse(req.body);

    const message = await messageService.sendMessageToUser(
        req.user.id,
        userId,
        body,
    );

    res.json(message);
};

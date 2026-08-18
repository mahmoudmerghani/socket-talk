import * as conversationService from "../services/conversationService.js";
import * as messageService from "../services/messageService.js";
import type { Controller } from "../utils/controller.js";
import { userIdParamSchema } from "@socket-talk/shared/schemas/userSchemas.js";
import { createMessageSchema } from "@socket-talk/shared/schemas/messageSchemas.js";
import {
    toGetDMResponse,
    toSendMessageToUserResponse,
} from "../mappers/directMappers.js";

export const getDM: Controller<"/directs/:userId", "GET"> = async (
    req,
    res,
) => {
    const { userId } = userIdParamSchema.parse(req.params);

    const dm = await conversationService.getDM(req.user.id, userId);

    res.json(toGetDMResponse(dm));
};

export const sendMessageToUser: Controller<
    "/directs/:userId/messages",
    "POST"
> = async (req, res) => {
    const { userId } = userIdParamSchema.parse(req.params);
    const body = createMessageSchema.parse(req.body);

    const message = await messageService.sendMessageToUser(
        req.user.id,
        userId,
        body,
    );

    res.json(toSendMessageToUserResponse(message));
};

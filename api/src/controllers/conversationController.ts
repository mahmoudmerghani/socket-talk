import type { Controller } from "../utils/controller.js";
import * as conversationService from "../services/conversationService.js";
import * as messageService from "../services/messageService.js";
import {
    getConversationMessagesQuerySchema,
    conversationIdParamSchema,
    readMessageSchema,
} from "@socket-talk/shared/schemas/conversationSchemas.js";
import { createMessageSchema } from "@socket-talk/shared/schemas/messageSchemas.js";
import {
    toGetAllUserConversationsResponse,
    toGetConversationMessagesWithQueryResponse,
    toGetConversationMessagesWithoutQueryResponse,
    toSendMessageToConversationResponse,
} from "../mappers/conversationMappers.js";

export const getAllUserConversations: Controller<
    "/conversations",
    "GET"
> = async (req, res) => {
    const conversations = await conversationService.getAllUserConversations(
        req.user.id,
    );

    res.json(toGetAllUserConversationsResponse(conversations));
};

export const getConversationMessages: Controller<
    "/conversations/:conversationId/messages",
    "GET"
> = async (req, res) => {
    // thrown zod errors are handled by the global error handler
    const { before, around, after } = getConversationMessagesQuerySchema.parse(
        req.query,
    );
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    if (before !== undefined) {
        const messages =
            await messageService.getConversationMessagesBeforeCursor(
                req.user.id,
                conversationId,
                before,
            );

        res.json(toGetConversationMessagesWithQueryResponse(messages));
    } else if (around !== undefined) {
        const messages =
            await messageService.getConversationMessagesAroundCursor(
                req.user.id,
                conversationId,
                around,
            );

        res.json(toGetConversationMessagesWithQueryResponse(messages));
    } else if (after !== undefined) {
        const messages =
            await messageService.getConversationMessagesAfterCursor(
                req.user.id,
                conversationId,
                after,
            );

        res.json(toGetConversationMessagesWithQueryResponse(messages));
    } else {
        const messages =
            await messageService.getConversationMessagesAroundLastReadMessage(
                req.user.id,
                conversationId,
            );

        res.json(toGetConversationMessagesWithoutQueryResponse(messages));
    }
};

export const updateLastReadMessage: Controller<
    "/conversations/:conversationId/read",
    "POST"
> = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const { messageId } = readMessageSchema.parse(req.body);

    await messageService.updateLastReadMessage(
        req.user.id,
        conversationId,
        messageId,
    );

    res.status(204).end();
};

export const sendMessageToConversation: Controller<
    "/conversations/:conversationId/messages",
    "POST"
> = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const message = createMessageSchema.parse(req.body);

    const result = await messageService.sendMessageToConversation(
        req.user.id,
        conversationId,
        message,
    );

    res.json(toSendMessageToConversationResponse(result));
};

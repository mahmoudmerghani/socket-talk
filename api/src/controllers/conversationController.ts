import type { RequestHandler } from "express";
import * as conversationService from "../services/conversationService.js";
import * as messageService from "../services/messageService.js";
import {
    getConversationMessagesQuerySchema,
    conversationIdParamSchema,
    readMessageSchema,
} from "@socket-talk/shared/schemas/conversationSchemas.js";

export const getAllUserConversations: RequestHandler = async (req, res) => {
    const conversations = await conversationService.getAllUserConversations(
        req.user.id,
    );

    res.json(conversations);
};

export const getConversationMessages: RequestHandler = async (req, res) => {
    // thrown zod errors are handled by the global error handler
    const { before, around, after } = getConversationMessagesQuerySchema.parse(
        req.query,
    );
    const { conversationId } = conversationIdParamSchema.parse(req.params);

    let messages;

    if (before !== undefined) {
        messages = await messageService.getConversationMessagesBeforeCursor(
            req.user.id,
            conversationId,
            before,
        );
    } else if (around !== undefined) {
        messages = await messageService.getConversationMessagesAroundCursor(
            req.user.id,
            conversationId,
            around,
        );
    } else if (after !== undefined) {
        messages = await messageService.getConversationMessagesAfterCursor(
            req.user.id,
            conversationId,
            after,
        );
    } else {
        messages =
            await messageService.getConversationMessagesAroundLastReadMessage(
                req.user.id,
                conversationId,
            );
    }

    res.json(messages);
};

export const updateLastReadMessage: RequestHandler = async (req, res) => {
    const { conversationId } = conversationIdParamSchema.parse(req.params);
    const { messageId } = readMessageSchema.parse(req.body);

    await messageService.updateLastReadMessage(
        req.user.id,
        conversationId,
        messageId,
    );

    res.status(204).end();
};

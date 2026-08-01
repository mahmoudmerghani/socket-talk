import type { CreateMessageRequest } from "@socket-talk/shared/schemas/messageSchemas.js";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../utils/HttpError.js";
import { getConversationParticipant } from "./conversationService.js";

export async function sendMessage(
    senderId: number,
    conversationId: number,
    messageData: CreateMessageRequest,
) {
    if (!(await getConversationParticipant(senderId, conversationId))) {
        throw new HttpError(403, "Forbidden");
    }

    const message = await prisma.message.create({
        data: {
            content: messageData.content,
            senderId,
            conversationId,
        },
    });

    return message;
}

import type { DM } from "../services/conversationService.js";
import type { Message } from "../services/messageService.js";
import type { SuccessResBodyOf } from "../utils/controller.js";

export function toGetDMResponse(
    dm: DM,
): SuccessResBodyOf<"/directs/:userId", "GET"> {
    return {
        conversationId: dm.conversationId,
        userId1: dm.userId1,
        userId2: dm.userId2,
    };
}

export function toSendMessageToUserResponse(
    message: Message,
): SuccessResBodyOf<"/directs/:userId/messages", "POST"> {
    return {
        content: message.content,
        conversationId: message.conversationId,
        id: message.id,
        senderId: message.senderId,
        sentAt: message.sentAt.toISOString(),
        sequenceNumber: message.sequenceNumber,
    };
}

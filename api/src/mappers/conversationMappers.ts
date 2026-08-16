import type {
    GetAllUserConversationsResponse,
    GetConversationMessagesWithoutQueryResponse,
    GetConversationMessagesWithQueryResponse,
    SendMessageToConversationResponse,
} from "@socket-talk/shared";
import type { Conversations } from "../services/conversationService.js";
import type {
    ConversationMessagesWithoutQuery,
    ConversationMessagesWithQuery,
    Message,
} from "../services/messageService.js";

export function toGetAllUserConversationsResponse(
    conversations: Conversations,
): GetAllUserConversationsResponse {
    return conversations.map((c): GetAllUserConversationsResponse[number] => {
        switch (c.type) {
            case "DIRECT":
                return {
                    id: c.id,
                    type: "DIRECT",
                    unreadMessagesCount: c.unreadMessagesCount,
                    lastMessage: c.lastMessage && {
                        senderId: c.lastMessage.senderId,
                        senderName: c.lastMessage.senderName,
                        content: c.lastMessage.content,
                        sentAt: c.lastMessage.sentAt.toISOString(),
                    },
                    otherUser: {
                        id: c.otherUser.id,
                        displayName: c.otherUser.displayName,
                        avatarColor: c.otherUser.avatarColor,
                        avatarUrl: c.otherUser.avatarUrl,
                    },
                };

            case "GROUP":
                return {
                    type: "GROUP",
                    id: c.id,
                    group: {
                        avatarColor: c.group.avatarColor,
                        avatarUrl: c.group.avatarUrl,
                        name: c.group.name,
                    },
                    lastMessage: c.lastMessage && {
                        content: c.lastMessage.content,
                        senderId: c.lastMessage.senderId,
                        senderName: c.lastMessage.senderName,
                        sentAt: c.lastMessage.sentAt.toISOString(),
                    },
                    unreadMessagesCount: c.unreadMessagesCount,
                };

            case "SELF":
                return {
                    type: "SELF",
                    id: c.id,
                    lastMessage: c.lastMessage && {
                        content: c.lastMessage.content,
                        sentAt: c.lastMessage.sentAt.toISOString(),
                    },
                };
        }
    });
}

export function toGetConversationMessagesWithoutQueryResponse(
    messagesObj: ConversationMessagesWithoutQuery,
): GetConversationMessagesWithoutQueryResponse {
    type messagesArray =
        GetConversationMessagesWithoutQueryResponse["messages"];
    type OthersLastReadMessageIdsArray =
        GetConversationMessagesWithoutQueryResponse["othersLastReadMessageIds"];

    return {
        lastReadMessageId: messagesObj.lastReadMessageId,
        messages: messagesObj.messages.map((m): messagesArray[number] => ({
            content: m.content,
            id: m.id,
            sender: {
                avatarColor: m.sender.avatarColor,
                avatarUrl: m.sender.avatarUrl,
                displayName: m.sender.displayName,
                id: m.sender.id,
                username: m.sender.username,
            },
            sentAt: m.sentAt.toISOString(),
            sequenceNumber: m.sequenceNumber,
        })),
        othersLastReadMessageIds: messagesObj.othersLastReadMessageIds.map(
            (o): OthersLastReadMessageIdsArray[number] => ({
                lastReadMessageId: o.lastReadMessageId,
                userId: o.userId,
            }),
        ),
    };
}

export function toGetConversationMessagesWithQueryResponse(
    messagesArray: ConversationMessagesWithQuery,
): GetConversationMessagesWithQueryResponse {
    type messageObj = GetConversationMessagesWithQueryResponse[number];

    return messagesArray.map(
        (m): messageObj => ({
            content: m.content,
            id: m.id,
            sender: {
                avatarColor: m.sender.avatarColor,
                avatarUrl: m.sender.avatarUrl,
                displayName: m.sender.displayName,
                id: m.sender.id,
                username: m.sender.username,
            },
            sentAt: m.sentAt.toISOString(),
            sequenceNumber: m.sequenceNumber,
        }),
    );
}

export function toSendMessageToConversationResponse(
    message: Message,
): SendMessageToConversationResponse {
    return {
        content: message.content,
        conversationId: message.conversationId,
        id: message.id,
        senderId: message.senderId,
        sentAt: message.sentAt.toISOString(),
        sequenceNumber: message.sequenceNumber,
    };
}

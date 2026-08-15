import type { GetAllUserConversationsResponse } from "@socket-talk/shared";
import type { Conversations } from "../services/conversationService.js";

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

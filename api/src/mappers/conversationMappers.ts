import type { Conversations } from "../services/conversationService.js";
import type {
    ConversationMessagesWithoutQuery,
    ConversationMessagesWithQuery,
    Message,
} from "../services/messageService.js";
import type { SuccessResBodyOf } from "../utils/controller.js";

export function toGetAllUserConversationsResponse(
    conversations: Conversations,
): SuccessResBodyOf<"/conversations", "GET"> {
    // response body in case of a successful response status 200
    type ConversationElement = SuccessResBodyOf<
        "/conversations",
        "GET"
    >[number];

    return conversations.map((c): ConversationElement => {
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
                        id: c.lastMessage.id,
                        sequenceNumber: c.lastMessage.sequenceNumber,
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
                        id: c.lastMessage.id,
                        sequenceNumber: c.lastMessage.sequenceNumber,
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
): SuccessResBodyOf<"/conversations/:conversationId/messages", "GET"> {
    type MessagesElement =
        SuccessResBodyOf<
            "/conversations/:conversationId/messages",
            "GET"
        > extends object | Array<infer M>
            ? M
            : never;

    type OthersLastReadMessageIdsArray =
        SuccessResBodyOf<
            "/conversations/:conversationId/messages",
            "GET"
        > extends { othersLastReadMessageIds: infer O } | Array<any>
            ? O
            : never;

    return {
        lastReadMessageId: messagesObj.lastReadMessageId,
        messages: messagesObj.messages.map(
            (m): MessagesElement => ({
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
        ),
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
): SuccessResBodyOf<"/conversations/:conversationId/messages", "GET"> {
    type MessagesElement =
        SuccessResBodyOf<
            "/conversations/:conversationId/messages",
            "GET"
        > extends object | Array<infer M>
            ? M
            : never;

    return messagesArray.map(
        (m): MessagesElement => ({
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
): SuccessResBodyOf<"/conversations/:conversationId/messages", "POST"> {
    return {
        content: message.content,
        conversationId: message.conversationId,
        id: message.id,
        senderId: message.senderId,
        sentAt: message.sentAt.toISOString(),
        sequenceNumber: message.sequenceNumber,
    };
}

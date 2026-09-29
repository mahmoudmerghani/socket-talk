import type { CreateMessageRequest } from "@socket-talk/shared/schemas/messageSchemas.js";
import { prisma } from "../../lib/prisma.js";
import {
    getOrCreateDM,
    requireConversationParticipant,
} from "./conversationService.js";
import { Prisma } from "../../generated/prisma/client.js";
import { withTransaction } from "../utils/withTransaction.js";
import { HttpError } from "../utils/HttpError.js";
import { eventBus } from "../eventBus.js";
import { getUserById } from "./userService.js";

export const MESSAGES_PAGE_SIZE = 50;

export async function updateLastReadMessage(
    userId: number,
    conversationId: number,
    messageId: number,
    tx?: Prisma.TransactionClient,
) {
    const { count } = await withTransaction(tx, async (tx) => {
        await requireConversationParticipant(userId, conversationId, tx);

        const message = await tx.message.findUnique({
            where: {
                id: messageId,
            },
            select: {
                conversationId: true,
            },
        });

        if (!message || message.conversationId !== conversationId) {
            throw new HttpError(400, "Bad Request");
        }
        // lastReadId can only move forward to latest messages
        const result = await tx.conversationParticipant.updateMany({
            where: {
                userId,
                conversationId,
                OR: [
                    { lastReadMessageId: null },
                    { lastReadMessageId: { lt: messageId } },
                ],
            },
            data: {
                lastReadMessageId: messageId,
            },
        });

        return result;
    });

    if (count > 0) {
        eventBus.emit("message_read", {
            conversationId,
            messageId,
            userId,
        });
    }
}

// generic sendTo
export async function sendMessageToConversation(
    senderId: number,
    conversationId: number,
    messageData: CreateMessageRequest,
    emitEvent: boolean = true,
    tx?: Prisma.TransactionClient,
) {
    const message = await withTransaction(tx, async (tx) => {
        await requireConversationParticipant(senderId, conversationId, tx);

        const { sequenceCounter } = await tx.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                sequenceCounter: { increment: 1 },
            },
        });

        const message = await tx.message.create({
            data: {
                content: messageData.content,
                sequenceNumber: sequenceCounter,
                senderId,
                conversationId,
            },
            select: {
                id: true,
                content: true,
                sentAt: true,
                sequenceNumber: true,
                conversationId: true,
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        avatarColor: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        await updateLastReadMessage(senderId, conversationId, message.id, tx);

        return message;
    });

    if (emitEvent) {
        eventBus.emit("message_created", {
            ...message,
            clientMessageId: messageData.clientMessageId,
        });
    }

    return message;
}

export async function sendMessageToUser(
    senderId: number,
    receiverId: number,
    messageData: CreateMessageRequest,
    tx?: Prisma.TransactionClient,
) {
    const { message, dm, isNew } = await withTransaction(tx, async (tx) => {
        const { dm, isNew } = await getOrCreateDM(senderId, receiverId, tx);

        const message = await sendMessageToConversation(
            senderId,
            dm.conversationId,
            messageData,
            !isNew,
            tx,
        );

        return { message, dm, isNew };
    });

    if (isNew) {
        const [user1, user2] = await Promise.all([
            getUserById(dm.userId1),
            getUserById(dm.userId2),
        ]);

        eventBus.emit("dm_created", {
            firstMessage: message,
            dm: { conversationId: dm.conversationId, user1, user2 },
        });
    }

    return message;
}

async function getConversationParticipantsLastReadMessageIds(
    conversationId: number,
) {
    return prisma.conversationParticipant.findMany({
        where: {
            conversationId,
        },
        select: {
            lastReadMessageId: true,
            userId: true,
        },
    });
}

async function getConversationMessagesBetween(
    conversationId: number,
    lowerBoundCursor: number,
    upperBoundCursor: number,
) {
    return prisma.message.findMany({
        where: {
            AND: [
                {
                    sequenceNumber: {
                        gte: lowerBoundCursor,
                    },
                },
                {
                    sequenceNumber: {
                        lte: upperBoundCursor,
                    },
                },
            ],
            conversationId,
        },
        select: {
            id: true,
            content: true,
            sentAt: true,
            sequenceNumber: true,
            conversationId: true,
            sender: {
                select: {
                    id: true,
                    displayName: true,
                    username: true,
                    avatarColor: true,
                    avatarUrl: true,
                },
            },
        },
        orderBy: {
            sequenceNumber: "asc",
        },
    });
}

export async function getConversationMessagesAroundCursor(
    userId: number,
    conversationId: number,
    cursor: number,
) {
    await requireConversationParticipant(userId, conversationId);

    const lowerBound = cursor - Math.floor(MESSAGES_PAGE_SIZE / 2) + 1;
    const upperBound = cursor + Math.floor(MESSAGES_PAGE_SIZE / 2);

    const messagesPromise = getConversationMessagesBetween(
        conversationId,
        lowerBound,
        upperBound,
    );

    const firstBeforePromise = prisma.message.findFirst({
        where: {
            conversationId,
            sequenceNumber: {
                lt: lowerBound,
            },
        },
    });

    const firstAfterPromise = prisma.message.findFirst({
        where: {
            conversationId,
            sequenceNumber: {
                gt: upperBound,
            },
        },
    });

    const [messages, firstBefore, firstAfter] = await Promise.all([
        messagesPromise,
        firstBeforePromise,
        firstAfterPromise,
    ]);

    return {
        messages,
        hasBefore: firstBefore !== null,
        hasAfter: firstAfter !== null,
    };
}

export async function getConversationMessagesBeforeCursor(
    userId: number,
    conversationId: number,
    cursor: number,
) {
    await requireConversationParticipant(userId, conversationId);

    const lowerBound = cursor - MESSAGES_PAGE_SIZE;
    const upperBound = cursor - 1;

    const messagesPromise = getConversationMessagesBetween(
        conversationId,
        lowerBound,
        upperBound,
    );

    const firstBeforePromise = prisma.message.findFirst({
        where: {
            conversationId,
            sequenceNumber: {
                lt: lowerBound,
            },
        },
    });

    const [messages, firstBefore] = await Promise.all([
        messagesPromise,
        firstBeforePromise,
    ]);

    return { messages, hasBefore: firstBefore !== null };
}

export async function getConversationMessagesAfterCursor(
    userId: number,
    conversationId: number,
    cursor: number,
) {
    await requireConversationParticipant(userId, conversationId);

    const lowerBound = cursor + 1;
    const upperBound = cursor + MESSAGES_PAGE_SIZE;

    const messagesPromise = getConversationMessagesBetween(
        conversationId,
        lowerBound,
        upperBound,
    );

    const firstAfterPromise = prisma.message.findFirst({
        where: {
            conversationId,
            sequenceNumber: {
                gt: upperBound,
            },
        },
    });

    const [messages, firstAfter] = await Promise.all([
        messagesPromise,
        firstAfterPromise,
    ]);

    return { messages, hasAfter: firstAfter !== null };
}

// initial messages when user opens a conversation
export async function getConversationMessagesAroundLastReadMessage(
    userId: number,
    conversationId: number,
) {
    const { lastReadMessage, conversation } =
        await requireConversationParticipant(userId, conversationId);

    let lowerBound: number;
    let upperBound: number;

    if (!lastReadMessage) {
        // get the last page of messages in the conversation
        const lastMessageSequence = conversation.sequenceCounter;

        lowerBound = lastMessageSequence - MESSAGES_PAGE_SIZE + 1;
        upperBound = lastMessageSequence;
    } else {
        // get messages around the last read message
        const lastReadMessageSequence = lastReadMessage.sequenceNumber;

        lowerBound =
            lastReadMessageSequence - Math.floor(MESSAGES_PAGE_SIZE / 2) + 1;
        upperBound =
            lastReadMessageSequence + Math.floor(MESSAGES_PAGE_SIZE / 2);
    }

    const firstBeforePromise = prisma.message.findFirst({
        where: {
            conversationId,
            sequenceNumber: {
                lt: lowerBound,
            },
        },
    });

    const firstAfterPromise = prisma.message.findFirst({
        where: {
            conversationId,
            sequenceNumber: {
                gt: upperBound,
            },
        },
    });

    const [messages, othersLastReadMessageIds, firstBefore, firstAfter] =
        await Promise.all([
            getConversationMessagesBetween(
                conversationId,
                lowerBound,
                upperBound,
            ),
            getConversationParticipantsLastReadMessageIds(conversationId),
            firstBeforePromise,
            firstAfterPromise,
        ]);

    return {
        messages,
        othersLastReadMessageIds,
        lastReadMessageId: lastReadMessage?.id ?? null,
        hasBefore: firstBefore !== null,
        hasAfter: firstAfter !== null,
    };
}

export type ConversationMessagesWithoutQuery = Awaited<
    ReturnType<typeof getConversationMessagesAroundLastReadMessage>
>;

export type ConversationMessagesWithQuery = {
    messages: Awaited<
        ReturnType<typeof getConversationMessagesAfterCursor>
    >["messages"];
    hasMoreAfter?: boolean;
    hasMoreBefore?: boolean;
};

export type Message = Awaited<ReturnType<typeof sendMessageToConversation>>;

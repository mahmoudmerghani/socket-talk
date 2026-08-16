import type { CreateMessageRequest } from "@socket-talk/shared/schemas/messageSchemas.js";
import { prisma } from "../../lib/prisma.js";
import {
    getOrCreateDM,
    requireConversationParticipant,
} from "./conversationService.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { withTransaction } from "../utils/withTransaction.js";
import { HttpError } from "../utils/HttpError.js";

export const MESSAGES_PAGE_SIZE = 50;

export async function updateLastReadMessage(
    userId: number,
    conversationId: number,
    messageId: number,
    tx?: Prisma.TransactionClient,
) {
    await requireConversationParticipant(userId, conversationId);

    return withTransaction(tx, async (tx) => {
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
        return tx.conversationParticipant.updateMany({
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
    });
}

// generic sendTo
export async function sendMessageToConversation(
    senderId: number,
    conversationId: number,
    messageData: CreateMessageRequest,
    tx?: Prisma.TransactionClient,
) {
    await requireConversationParticipant(senderId, conversationId);

    return withTransaction(tx, async (tx) => {
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
        });

        await updateLastReadMessage(senderId, conversationId, message.id, tx);

        return message;
    });
}

export async function sendMessageToUser(
    senderId: number,
    receiverId: number,
    messageData: CreateMessageRequest,
    tx?: Prisma.TransactionClient,
) {
    return withTransaction(tx, async (tx) => {
        const DM = await getOrCreateDM(senderId, receiverId, tx);

        return sendMessageToConversation(
            senderId,
            DM.conversationId,
            messageData,
            tx,
        );
    });
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

    const messages = await getConversationMessagesBetween(
        conversationId,
        lowerBound,
        upperBound,
    );

    return messages;
}

export async function getConversationMessagesBeforeCursor(
    userId: number,
    conversationId: number,
    cursor: number,
) {
    await requireConversationParticipant(userId, conversationId);

    const lowerBound = cursor - MESSAGES_PAGE_SIZE;
    const upperBound = cursor - 1;

    const messages = await getConversationMessagesBetween(
        conversationId,
        lowerBound,
        upperBound,
    );

    return messages;
}

export async function getConversationMessagesAfterCursor(
    userId: number,
    conversationId: number,
    cursor: number,
) {
    await requireConversationParticipant(userId, conversationId);

    const lowerBound = cursor + 1;
    const upperBound = cursor + MESSAGES_PAGE_SIZE;

    const messages = await getConversationMessagesBetween(
        conversationId,
        lowerBound,
        upperBound,
    );

    return messages;
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

    const [messages, othersLastReadMessageIds] = await Promise.all([
        getConversationMessagesBetween(conversationId, lowerBound, upperBound),
        getConversationParticipantsLastReadMessageIds(conversationId),
    ]);

    return {
        messages,
        othersLastReadMessageIds,
        lastReadMessageId: lastReadMessage?.id ?? null,
    };
}

export type ConversationMessagesWithoutQuery = Awaited<
    ReturnType<typeof getConversationMessagesAroundLastReadMessage>
>;

export type ConversationMessagesWithQuery =
    ConversationMessagesWithoutQuery["messages"];

export type Message = Awaited<ReturnType<typeof sendMessageToConversation>>;

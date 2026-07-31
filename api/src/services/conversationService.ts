import { prisma } from "../../lib/prisma.js";
import { AVATAR_COLORS } from "@socket-talk/shared/schemas/authSchemas.js";
import { type CreateGroupRequest } from "@socket-talk/shared/schemas/conversationSchemas.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { withTransaction } from "../utils/withTransaction.js";
import { HttpError } from "../utils/HttpError.js";

export async function createGroup(
    userId: number,
    groupData: CreateGroupRequest,
    tx?: Prisma.TransactionClient,
) {
    return withTransaction(tx, async (tx) => {
        const conversation = await tx.conversation.create({
            data: {
                type: "GROUP",
            },
        });

        const avatarColor =
            AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!;

        const group = await tx.group.create({
            data: {
                name: groupData.name,
                avatarColor,
                creatorId: userId,
                conversationId: conversation.id,
            },
        });

        await tx.conversationParticipant.create({
            data: {
                userId,
                conversationId: conversation.id,
            },
        });

        return { conversation, group };
    });
}

export async function addUserToGroup(
    userId: number,
    conversationId: number,
    dbClient: Prisma.TransactionClient | typeof prisma = prisma,
) {
    await dbClient.conversationParticipant.create({
        data: {
            userId,
            conversationId,
        },
    });
}

export async function getDM(userId1: number, userId2: number) {
    // order ids
    const [id1, id2] =
        userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    return prisma.dM.findUnique({
        where: {
            userId1_userId2: {
                userId1: id1,
                userId2: id2,
            },
        },
    });
}

export async function createDM(
    userId1: number,
    userId2: number,
    tx?: Prisma.TransactionClient,
) {
    if (userId1 === userId2) {
        throw new HttpError(400, "Cannot create self DM");
    }

    if (await getDM(userId1, userId2)) {
        throw new HttpError(409, "DM already exists");
    }

    // order ids
    const [id1, id2] =
        userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    return withTransaction(tx, async (tx) => {
        const conversation = await tx.conversation.create({
            data: {
                type: "DIRECT",
            },
        });

        await tx.conversationParticipant.create({
            data: {
                userId: userId1,
                conversationId: conversation.id,
            },
        });

        await tx.conversationParticipant.create({
            data: {
                userId: userId2,
                conversationId: conversation.id,
            },
        });

        const DM = await tx.dM.create({
            data: {
                userId1: id1,
                userId2: id2,
                conversationId: conversation.id,
            },
        });

        return { conversation, DM };
    });
}

export async function getSelfChat(userId: number) {
    return prisma.selfChat.findUnique({
        where: {
            userId,
        },
    });
}

export async function createSelfChat(
    userId: number,
    tx?: Prisma.TransactionClient,
) {
    if (await getSelfChat(userId)) {
        throw new HttpError(409, "Self chat already exists");
    }

    return withTransaction(tx, async (tx) => {
        const conversation = await tx.conversation.create({
            data: {
                type: "SELF",
            },
        });

        await tx.conversationParticipant.create({
            data: {
                userId,
                conversationId: conversation.id,
            },
        });

        const selfChat = await tx.selfChat.create({
            data: {
                userId,
                conversationId: conversation.id,
            },
        });

        return { conversation, selfChat };
    });
}

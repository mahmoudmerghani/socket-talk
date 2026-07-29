import { prisma } from "../../lib/prisma.js";
import { AVATAR_COLORS } from "@socket-talk/shared/schemas/authSchemas.js";
import { type CreateGroupRequest } from "@socket-talk/shared/schemas/conversationSchemas.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { withTransaction } from "../utils/withTransaction.js";

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

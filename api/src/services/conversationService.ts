import { prisma } from "../../lib/prisma.js";
import { AVATAR_COLORS } from "@socket-talk/shared/schemas/authSchemas.js";
import { type CreateGroupRequest } from "@socket-talk/shared/schemas/conversationSchemas.js";
import { Prisma } from "../../generated/prisma/client.js";
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

export async function getGroupMembers(conversationId: number) {
    const result = await prisma.conversationParticipant.findMany({
        where: {
            conversationId,
        },
        select: {
            joinedAt: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarColor: true,
                    avatarUrl: true,
                },
            },
        },
    });

    return result.map((r) => ({ ...r.user, joinedAt: r.joinedAt }));
}

export async function getGroupInfo(conversationId: number) {
    const group = await prisma.group.findUnique({
        where: {
            conversationId,
        },
    });

    if (!group) {
        throw new HttpError(404, "Not Found");
    }

    const members = await getGroupMembers(conversationId);

    return { group, members };
}

export async function getAllGroups() {
    return prisma.group.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

export async function addUserToGroup(
    userId: number,
    conversationId: number,
    dbClient: Prisma.TransactionClient | typeof prisma = prisma,
) {
    const group = await dbClient.group.findUnique({
        where: {
            conversationId,
        },
    });

    if (!group) {
        throw new HttpError(404, "Not Found");
    }

    try {
        await dbClient.conversationParticipant.create({
            data: {
                userId,
                conversationId,
            },
        });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            throw new HttpError(409, "User already in group");
        }

        throw err;
    }
}

export async function removeUserFromGroup(
    userId: number,
    conversationId: number,
    dbClient: Prisma.TransactionClient | typeof prisma = prisma,
) {
    const group = await dbClient.group.findUnique({
        where: {
            conversationId,
        },
    });

    if (!group) {
        throw new HttpError(404, "Not Found");
    }

    try {
        await dbClient.conversationParticipant.delete({
            where: {
                userId_conversationId: {
                    conversationId,
                    userId,
                },
            },
        });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2025"
        ) {
            throw new HttpError(404, "User is not a member of this group");
        }

        throw err;
    }
}

export async function addUserToGlobalGroup(
    userId: number,
    tx?: Prisma.TransactionClient,
) {
    return withTransaction(tx, async (tx) => {
        // GLOBAL group is created by the seed file
        const group = await tx.group.findFirst({
            where: {
                name: "GLOBAL",
            },
            orderBy: {
                conversation: {
                    createdAt: "asc",
                },
            },
        });

        if (!group) {
            throw new Error("GLOBAL group was not created");
        }

        try {
            await tx.conversationParticipant.create({
                data: {
                    userId,
                    conversationId: group.conversationId,
                },
            });
        } catch (err) {
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2002"
            ) {
                throw new HttpError(409, "User already in GLOBAL group");
            }

            throw err;
        }
    });
}

export async function searchGroupsByName(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const LIMIT = 20;

    const prefixMatches = await prisma.group.findMany({
        where: {
            name: { startsWith: trimmedQuery, mode: "insensitive" },
        },
        take: LIMIT,
    });

    const remaining = LIMIT - prefixMatches.length;
    if (remaining <= 0) return prefixMatches;

    const prefixIds = prefixMatches.map((g) => g.conversationId);

    const containsMatches = await prisma.group.findMany({
        where: {
            conversationId: { notIn: prefixIds },
            name: { contains: trimmedQuery, mode: "insensitive" },
        },
        take: remaining,
    });

    return [...prefixMatches, ...containsMatches];
}

export async function getDM(userId1: number, userId2: number) {
    // order ids

    const [id1, id2] =
        userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    const dm = await prisma.dM.findUnique({
        where: {
            userId1_userId2: {
                userId1: id1,
                userId2: id2,
            },
        },
    });

    if (!dm) {
        throw new HttpError(404, "Not Found");
    }

    return dm;
}

export async function getOrCreateDM(
    userId1: number,
    userId2: number,
    tx?: Prisma.TransactionClient,
) {
    if (userId1 === userId2) {
        throw new HttpError(400, "Cannot create self DM");
    }

    try {
        const existingDm = await getDM(userId1, userId2);
        return existingDm;
    } catch (err) {
        if (err instanceof HttpError && err.status === 404) {
            // order ids to guarantee that no other DM exists with the reverse order
            // which can create a duplicate DM with the same two users
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

                return DM;
            });
        } else {
            throw err;
        }
    }
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

export async function getConversation(conversationId: number) {
    return prisma.conversation.findUnique({
        where: {
            id: conversationId,
        },
    });
}

export async function requireConversationParticipant(
    userId: number,
    conversationId: number,
    tx?: Prisma.TransactionClient,
) {
    return withTransaction(tx, async (tx) => {
        const conversationParticipant =
            await tx.conversationParticipant.findUnique({
                where: {
                    userId_conversationId: {
                        conversationId,
                        userId,
                    },
                },
                select: {
                    userId: true,
                    conversationId: true,
                    joinedAt: true,
                    lastReadMessageId: true,
                    lastReadMessage: true,
                    conversation: true,
                },
            });

        if (!conversationParticipant) {
            throw new HttpError(403, "Forbidden");
        }

        return conversationParticipant;
    });
}

export async function getAllUserConversations(userId: number) {
    const conversations = await prisma.conversationParticipant.findMany({
        where: {
            userId,
        },
        select: {
            lastReadMessage: true,
            conversation: {
                select: {
                    id: true,
                    type: true,
                    sequenceCounter: true,
                    DM: {
                        select: {
                            user1: true,
                            user2: true,
                        },
                    },
                    selfChat: true,
                    group: true,
                    messages: {
                        select: {
                            id: true,
                            content: true,
                            sentAt: true,
                            sender: {
                                select: {
                                    id: true,
                                    displayName: true,
                                },
                            },
                        },
                        orderBy: {
                            sequenceNumber: "desc",
                        },
                        take: 1,
                    },
                },
            },
        },
    });

    const userConversations = conversations.map((c) => {
        const lastMessage = c.conversation.messages[0] ?? null;

        const unreadMessagesCount =
            c.lastReadMessage !== null
                ? c.conversation.sequenceCounter -
                  c.lastReadMessage.sequenceNumber
                : c.conversation.sequenceCounter;

        switch (c.conversation.type) {
            case "DIRECT": {
                const dm = c.conversation.DM;

                if (!dm) {
                    throw new Error(
                        `Invalid DIRECT conversation ${c.conversation.id}: missing DM`,
                    );
                }

                const otherUser = dm.user1.id === userId ? dm.user2 : dm.user1;

                return {
                    type: "DIRECT" as const,
                    id: c.conversation.id,
                    unreadMessagesCount,
                    lastMessage: lastMessage && {
                        content: lastMessage.content,
                        sentAt: lastMessage.sentAt,
                        senderId: lastMessage.sender.id,
                        senderName: lastMessage.sender.displayName,
                    },
                    otherUser: {
                        id: otherUser.id,
                        displayName: otherUser.displayName,
                        avatarColor: otherUser.avatarColor,
                        avatarUrl: otherUser.avatarUrl,
                    },
                };
            }

            case "GROUP": {
                const group = c.conversation.group;

                if (!group) {
                    throw new Error(
                        `Invalid GROUP conversation ${c.conversation.id}: missing Group`,
                    );
                }

                return {
                    type: "GROUP" as const,
                    id: c.conversation.id,
                    unreadMessagesCount,
                    lastMessage: lastMessage && {
                        content: lastMessage.content,
                        sentAt: lastMessage.sentAt,
                        senderId: lastMessage.sender.id,
                        senderName: lastMessage.sender.displayName,
                    },
                    group: {
                        name: group.name,
                        avatarColor: group.avatarColor,
                        avatarUrl: group.avatarUrl,
                    },
                };
            }

            case "SELF": {
                const selfChat = c.conversation.selfChat;

                if (!selfChat) {
                    throw new Error(
                        `Invalid SELF conversation ${c.conversation.id}: missing Self chat`,
                    );
                }

                return {
                    type: "SELF" as const,
                    id: c.conversation.id,
                    lastMessage: lastMessage && {
                        content: lastMessage.content,
                        sentAt: lastMessage.sentAt,
                    },
                };
            }
        }
    });

    userConversations.sort(
        (a, b) =>
            (b.lastMessage?.sentAt.getTime() ?? 0) -
            (a.lastMessage?.sentAt.getTime() ?? 0),
    );

    return userConversations;
}

export async function requireGroupAdmin(
    userId: number,
    conversationId: number,
) {
    const group = await prisma.group.findUnique({
        where: {
            conversationId,
            creatorId: userId,
        },
    });

    if (!group) {
        throw new HttpError(403, "Forbidden");
    }

    return group;
}

export type Conversations = Awaited<ReturnType<typeof getAllUserConversations>>;
export type Groups = Awaited<ReturnType<typeof getAllGroups>>;
export type GroupInfo = Awaited<ReturnType<typeof getGroupInfo>>;
export type GroupMembers = Awaited<ReturnType<typeof getGroupMembers>>;
export type CreateGroupReturnType = Awaited<ReturnType<typeof createGroup>>;
export type DM = Awaited<ReturnType<typeof getDM>>;

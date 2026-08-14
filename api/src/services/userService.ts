import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AVATAR_COLORS } from "@socket-talk/shared/schemas/authSchemas.js";
import { withTransaction } from "../utils/withTransaction.js";
import { addUserToGlobalGroup, createSelfChat } from "./conversationService.js";
import { HttpError } from "../utils/HttpError.js";

type DBClient = typeof prisma | Prisma.TransactionClient;

export async function getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    return user;
}

export async function getUserByUsername(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            username,
        },
    });

    return user;
}

export async function getUserByEmailOrUsername(identifier: string) {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{ username: identifier }, { email: identifier }],
        },
    });

    return user;
}

export async function createUser(
    user: Omit<Prisma.UserCreateInput, "avatarColor">,
    tx?: Prisma.TransactionClient,
) {
    return withTransaction(tx, async (tx) => {
        const avatarColor =
            AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!;

        const newUser = await tx.user.create({
            data: { ...user, avatarColor: avatarColor },
        });

        await addUserToGlobalGroup(newUser.id, tx);

        await createSelfChat(newUser.id, tx);

        return newUser;
    });
}

export async function createOauthAccount(
    data: Prisma.OauthAccountUncheckedCreateInput,
    dbClient: DBClient = prisma,
) {
    const account = await dbClient.oauthAccount.create({
        data,
    });

    return account;
}

export async function getUserById(userId: number) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatarColor: true,
            avatarUrl: true,
        },
    });

    if (!user) {
        throw new HttpError(404, "Not Found");
    }

    return user;
}

export async function getAllUsers() {
    return prisma.user.findMany({
        orderBy: {
            displayName: "asc",
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatarColor: true,
            avatarUrl: true,
        },
    });
}

export async function searchUsersByUsernameOrDisplayName(query: string) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const LIMIT = 20;
    const select = {
        id: true,
        username: true,
        displayName: true,
        avatarColor: true,
        avatarUrl: true,
    } as const;

    // prefix matches have a higher ranking
    const prefixMatches = await prisma.user.findMany({
        where: {
            OR: [
                { username: { startsWith: trimmedQuery, mode: "insensitive" } },
                {
                    displayName: {
                        startsWith: trimmedQuery,
                        mode: "insensitive",
                    },
                },
            ],
        },
        take: LIMIT,
        select,
    });

    const remaining = LIMIT - prefixMatches.length;
    if (remaining <= 0) return prefixMatches;

    const prefixIds = prefixMatches.map((u) => u.id);

    const containsMatches = await prisma.user.findMany({
        where: {
            id: { notIn: prefixIds },
            OR: [
                { username: { contains: trimmedQuery, mode: "insensitive" } },
                {
                    displayName: {
                        contains: trimmedQuery,
                        mode: "insensitive",
                    },
                },
            ],
        },
        take: remaining,
        select,
    });

    return [...prefixMatches, ...containsMatches];
}

import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AVATAR_COLORS } from "@socket-talk/shared/schemas/authSchemas.js";
import { withTransaction } from "../utils/withTransaction.js";
import { addUserToGlobalGroup, createSelfChat } from "./conversationService.js";

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

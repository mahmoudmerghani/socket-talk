import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AVATAR_COLORS } from "@socket-talk/shared/schemas/authSchemas.js";

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

export async function createUser(
    user: Omit<Prisma.UserCreateInput, "avatarColor">,
) {
    const avatarColor =
        AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!;

    const newUser = await prisma.user.create({
        data: { ...user, avatarColor: avatarColor },
        select: {
            id: true,
        },
    });

    return newUser;
}

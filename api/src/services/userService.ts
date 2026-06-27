import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AVATAR_COLOR } from "@socket-talk/shared/schemas/userSchemas.js";

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
        AVATAR_COLOR[Math.floor(Math.random() * AVATAR_COLOR.length)]!;

    const newUser = await prisma.user.create({
        data: { ...user, avatarColor: avatarColor },
        select: {
            id: true,
        },
    });

    return newUser;
}

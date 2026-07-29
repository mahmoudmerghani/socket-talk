import { prisma } from "../../lib/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { AVATAR_COLORS } from "@socket-talk/shared/schemas/authSchemas.js";
import { HttpError } from "../utils/HttpError.js";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { supabase } from "../../lib/supabase.js";
import { withTransaction } from "../utils/withTransaction.js";
import { addUserToGroup } from "./conversationService.js";

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

        await addUserToGroup(newUser.id, 0, tx); // 0 is the id of the global group

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

async function deleteAvatar(oldAvatarPath: string) {
    const { error } = await supabase.storage
        .from("avatars")
        .remove([oldAvatarPath]);

    if (error) throw error;
}

export async function updateAvatar(
    userId: number,
    oldAvatarPath: string | null,
    avatar: Buffer,
) {
    const supportedFormats = ["jpeg", "png", "webp"];

    let metadata;
    let image;

    try {
        image = sharp(avatar);
        metadata = await image.metadata();
    } catch {
        throw new HttpError(400, "Invalid image file.");
    }

    if (!supportedFormats.includes(metadata.format)) {
        throw new HttpError(400, "Unsupported image format.");
    }

    const transformedImage = await image
        .resize(256, 256, {
            fit: "cover",
        })
        .webp({
            quality: 80,
        })
        .toBuffer();

    // random for cache busting
    const path = `${userId}/${randomBytes(16).toString("hex")}.webp`;

    const { error } = await supabase.storage
        .from("avatars")
        .upload(path, transformedImage, {
            contentType: "image/webp",
            upsert: true,
        });

    if (error) throw error;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { publicUrl } = data;

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            avatarPath: path,
            avatarUrl: publicUrl,
        },
    });

    if (oldAvatarPath) {
        deleteAvatar(oldAvatarPath).catch((e) => {
            console.error(e);
        });
    }

    return { publicUrl };
}

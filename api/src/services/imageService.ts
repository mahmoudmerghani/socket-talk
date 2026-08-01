import { HttpError } from "../utils/HttpError.js";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { supabase } from "../../lib/supabase.js";
import { prisma } from "../../lib/prisma.js";

type BucketName = "avatars" | "group-images";

async function uploadAvatarImage(
    imageBuf: Buffer,
    bucketName: BucketName,
    path: string,
) {
    const supportedFormats = ["jpeg", "png", "webp"];

    let metadata;
    let image;

    try {
        image = sharp(imageBuf);
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

    const { error } = await supabase.storage
        .from(bucketName)
        .upload(path, transformedImage, {
            contentType: "image/webp",
            upsert: true,
        });

    if (error) throw error;

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);

    return data;
}

async function deleteImage(bucketName: BucketName, oldPath: string) {
    const { error } = await supabase.storage.from(bucketName).remove([oldPath]);

    if (error) throw error;
}

export async function updateUserAvatar(userId: number, avatar: Buffer) {
    const { avatarPath: oldPath } = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
        select: {
            avatarPath: true,
        },
    });

    const path = `${userId}/${randomBytes(16).toString("hex")}.webp`;
    const { publicUrl } = await uploadAvatarImage(avatar, "avatars", path);

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            avatarPath: path,
            avatarUrl: publicUrl,
        },
    });

    if (oldPath) {
        deleteImage("avatars", oldPath).catch((e) => {
            console.error(e);
        });
    }

    return { publicUrl, path };
}

export async function updateGroupImage(conversationId: number, image: Buffer) {
    const { avatarPath: oldPath } = await prisma.group.findUniqueOrThrow({
        where: {
            conversationId,
        },
        select: {
            avatarPath: true,
        },
    });

    const path = `${conversationId}/${randomBytes(16).toString("hex")}.webp`;
    const { publicUrl } = await uploadAvatarImage(image, "group-images", path);

    await prisma.group.update({
        where: {
            conversationId,
        },
        data: {
            avatarPath: path,
            avatarUrl: publicUrl,
        },
    });

    if (oldPath) {
        deleteImage("group-images", oldPath).catch((e) => {
            console.error(e);
        });
    }

    return { publicUrl, path };
}

import {
    createGroup,
    createSelfChat,
} from "../services/conversationService.js";
import { prisma } from "../../lib/prisma.js";
import { hash } from "bcryptjs";
import { AVATAR_COLORS } from "@socket-talk/shared";

async function main() {
    const [username, displayName, password] = process.argv.slice(2);

    if (!username || !password || !displayName) {
        console.log("Username, Display name, Password are required");
        return;
    }

    const hashedPassword = await hash(password, 10);

    await prisma.$transaction(async (tx) => {
        const avatarColor =
            AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!;

        const newUser = await tx.user.create({
            data: {
                displayName,
                username,
                password: hashedPassword,
                avatarColor: avatarColor,
            },
        });

        await createGroup(newUser.id, { name: "GLOBAL" }, tx);
        await createSelfChat(newUser.id, tx);
    });

    console.log("DONE");
}

main();

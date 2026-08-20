import {
    createGroup,
    createSelfChat,
} from "../services/conversationService.js";
import { sendMessageToConversation } from "../services/messageService.js";
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

        const { conversation } = await createGroup(
            newUser.id,
            { name: "GLOBAL" },
            tx,
        );
        await createSelfChat(newUser.id, tx);

        const isProduction = process.env.NODE_ENV === "production";

        if (!isProduction) {
            const promises = Array(200);

            for (let i = 0; i < 200; i++) {
                promises.push(
                    sendMessageToConversation(
                        newUser.id,
                        conversation.id,
                        {
                            content: `Message #${i + 1}`,
                        },
                        tx,
                    ),
                );
            }

            await Promise.all(promises);
        }
    });

    console.log("DONE");
}

main();

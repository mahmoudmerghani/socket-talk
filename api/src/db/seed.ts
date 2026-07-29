import { createUser } from "../services/userService.js";
import { createGroup } from "../services/conversationService.js";
import { prisma } from "../../lib/prisma.js";
import { hash } from "bcryptjs";

async function main() {
    const [username, displayName, password] = process.argv.slice(2);

    if (!username || !password || !displayName) {
        console.log("Username, Display name, Password are required");
        return;
    }

    const hashedPassword = await hash(password, 10);

    await prisma.$transaction(async (tx) => {
        const user = await createUser(
            {
                username,
                displayName,
                password: hashedPassword,
            },
            tx,
        );

        await createGroup(user.id, { name: "GLOBAL" }, tx);
    });

    console.log("DONE");
}

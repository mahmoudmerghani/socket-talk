import type {
    LoginRequest,
    SignupRequest,
} from "@socket-talk/shared/schemas/authSchemas.js";
import * as userService from "./userService.js";
import { HttpError } from "../utils/HttpError.js";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "../../lib/prisma.js";

export async function signupUser(userData: SignupRequest) {
    const exist =
        (await userService.getUserByEmail(userData.email)) ||
        (await userService.getUserByUsername(userData.username));

    if (exist) {
        throw new HttpError(409, "User already exists");
    }

    const hashedPassword = await hash(userData.password, 10);

    // this may error (excess property passwordConfirm)
    const user = await userService.createUser({
        ...userData,
        password: hashedPassword,
    });

    return user;
}

export async function createUserSession(userId: number) {
    const randomId = randomBytes(16).toString("hex");
    const expireDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const session = await prisma.session.create({
        data: {
            id: randomId,
            expiresAt: new Date(expireDate),
            userId,
        },
    });

    return session;
}

export async function loginUser({ identifier, password }: LoginRequest) {
    const user = await userService.getUserByEmailOrUsername(identifier);
    const err = new HttpError(401, "Invalid username or password");

    if (!user) {
        throw err;
    }

    // github or other Oauth user
    if (user.password === null) {
        throw err;
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
        throw err;
    }

    const session = await createUserSession(user.id);
    const { password: _, ...userWithoutPassword } = user;

    return { session, user: userWithoutPassword };
}

export async function verifySession(sessionId: string) {
    const err = new HttpError(401, "Invalid session");

    const session = await prisma.session.findUnique({
        where: {
            id: sessionId,
        },
    });

    if (!session || Date.now() > session.expiresAt.getTime()) {
        throw err;
    }

    return session;
}

export async function getAuthenticatedUser(sessionId: string) {
    const session = await verifySession(sessionId);

    const user = await prisma.user.findUnique({
        where: {
            id: session.userId,
        },
    });

    if (!user) {
        throw new HttpError(401, "Invalid session");
    }

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
}

export async function logoutUser(sessionId: string) {
    await prisma.session.deleteMany({
        where: {
            id: sessionId,
        },
    });
}

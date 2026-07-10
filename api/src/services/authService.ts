import type {
    LoginRequest,
    SignupRequest,
    GithubSignupRequest,
} from "@socket-talk/shared/schemas/authSchemas.js";
import * as userService from "./userService.js";
import { HttpError } from "../utils/HttpError.js";
import { hash, compare } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "../../lib/prisma.js";

export async function signupUser(userData: SignupRequest) {
    const exist =
        (userData.email &&
            (await userService.getUserByEmail(userData.email))) ||
        (await userService.getUserByUsername(userData.username));

    if (exist) {
        throw new HttpError(409, "User already exists");
    }

    const hashedPassword = await hash(userData.password, 10);

    // this may error (excess property passwordConfirm)
    const user = await userService.createUser({
        displayName: userData.displayName,
        username: userData.username,
        password: hashedPassword,
        email: userData.email || null,
    });

    const session = await createUserSession(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return { session, user: userWithoutPassword };
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

export function createOauthState() {
    return randomBytes(16).toString("hex");
}

export async function getGithubUser(code: string) {
    const err = new Error("Unexpected github oauth error");

    const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            redirect_uri: `${process.env.API_URL}/auth/github/callback`,
        }),
    });

    if (!res.ok) {
        throw err;
    }

    const body = (await res.json()) as Record<string, unknown>;

    if (!("access_token" in body)) {
        throw err;
    }

    const userRes = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${body.access_token}`,
        },
    });2

    if (!userRes.ok) {
        throw err;
    }

    const user = (await userRes.json()) as {
        login: string;
        id: number;
        avatar_url: string;
        name: string | null;
    };

    const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${body.access_token}`,
        },
    });

    if (!emailRes.ok) {
        throw err;
    }

    const emails = (await emailRes.json()) as {
        email: string;
        primary: boolean;
        verified: boolean;
    }[];

    const chosenEmail = emails.find((e) => e.primary && e.verified)?.email;

    return {
        id: user.id,
        username: user.login,
        displayName: user.name,
        avatarUrl: user.avatar_url,
        email: chosenEmail ?? null,
    };
}

export async function loginWithGithub(code: string) {
    const user = await getGithubUser(code);
    const exists = await prisma.oauthAccount.findUnique({
        where: {
            providerId_provider: {
                provider: "GITHUB",
                providerId: user.id.toString(),
            },
        },
        include: {
            user: true,
        },
    });

    if (exists) {
        const session = await createUserSession(exists.user.id);
        const { password: _, ...userWithoutPassword } = exists.user;
        return { session, user: userWithoutPassword };
    }

    // if user doesn't exist then return github user data to continue sign up

    return user;
}

export async function signupWithGithub(
    userSignupData: GithubSignupRequest,
    userGithubData: Awaited<ReturnType<typeof getGithubUser>>,
) {
    // user provided data have priority over prefilled github data except email (verified by github)

    const user = await userService.createUser({
        displayName: userSignupData.displayName,
        username: userSignupData.username,
        avatarUrl: userGithubData.avatarUrl,
        email: userGithubData.email ?? userSignupData.email ?? null,
        isVerified: userGithubData.email !== null,
    });

    await userService.createOauthAccount({
        provider: "GITHUB",
        providerId: userGithubData.id.toString(),
        userId: user.id,
    });

    const session = await createUserSession(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return {
        session,
        user: userWithoutPassword,
    };
}

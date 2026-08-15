import type { RequestHandler } from "express";
import * as authService from "../services/authService.js";
import { HttpError } from "../utils/HttpError.js";
import { OAUTH_FAILURE_GITHUB_CODE } from "@socket-talk/shared";
import { toAuthUserResponse } from "../mappers/userMappers.js";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
} as const;

export const login: RequestHandler = async (req, res) => {
    const { user, session } = await authService.loginUser(req.body);

    // allow cross-origin cookies in production (different client and api origins)
    res.cookie("sid", session.id, {
        ...cookieOptions,
        expires: session.expiresAt,
    });

    res.json(toAuthUserResponse(user));
};

export const logout: RequestHandler = async (req, res) => {
    await authService.logoutUser(req.cookies.sid);
    res.clearCookie("sid");

    res.status(204).end();
};

export const signup: RequestHandler = async (req, res) => {
    const { user, session } = await authService.signupUser(req.body);

    res.cookie("sid", session.id, {
        ...cookieOptions,
        expires: session.expiresAt,
    });

    res.json(toAuthUserResponse(user));
};

export const getUser: RequestHandler = async (req, res) => {
    res.json(toAuthUserResponse(req.user));
};

export const redirectToGithubOauth: RequestHandler = (req, res) => {
    const state = authService.createOauthState();

    res.cookie("oauth-state", state, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 10, // 10 mins
    });

    const url = new URL("https://github.com/login/oauth/authorize");

    url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
    url.searchParams.set(
        "redirect_uri",
        `${process.env.API_URL}/auth/github/callback`,
    );
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", state);

    res.redirect(url.toString());
};

export const handleGithubOauthCallback: RequestHandler = async (req, res) => {
    const { code, state, error } = req.query;

    if (error || !code || !state || state !== req.cookies["oauth-state"]) {
        console.error("github oauth error:", {
            error,
            code,
            state,
        });

        return res.redirect(
            `${process.env.CLIENT_URL}/auth/github?error=${OAUTH_FAILURE_GITHUB_CODE}`,
        );
    }

    res.clearCookie("oauth-state");

    const result = await authService.loginWithGithub(code as string);

    if ("session" in result) {
        res.cookie("sid", result.session.id, {
            ...cookieOptions,
            expires: result.session.expiresAt,
        });

        return res.redirect(process.env.CLIENT_URL!);
    }

    // continue sign up with github data prefilled
    res.cookie(
        "github-pending-signup",
        Buffer.from(JSON.stringify(result)).toString("base64url"),
        {
            ...cookieOptions,
            signed: true,
            maxAge: 1000 * 60 * 10, // 10 mins
        },
    );

    res.redirect(`${process.env.CLIENT_URL}/auth/github/pending-signup`);
};

export const getGithubPendingSignupData: RequestHandler = (req, res) => {
    const cookie: string | undefined =
        req.signedCookies["github-pending-signup"];

    if (!cookie) {
        throw new HttpError(400, "Invalid cookie");
    }

    const data = JSON.parse(Buffer.from(cookie, "base64url").toString());

    res.json(data);
};

export const signupWithGithub: RequestHandler = async (req, res) => {
    const cookie: string | undefined =
        req.signedCookies["github-pending-signup"];

    if (!cookie) {
        throw new HttpError(400, "Invalid cookie");
    }

    const githubData = JSON.parse(Buffer.from(cookie, "base64url").toString());

    const { user, session } = await authService.signupWithGithub(
        req.body,
        githubData,
    );

    res.cookie("sid", session.id, {
        ...cookieOptions,
        expires: session.expiresAt,
    });

    res.json(toAuthUserResponse(user));
};

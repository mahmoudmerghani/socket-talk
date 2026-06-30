import type { RequestHandler } from "express";
import * as authService from "../services/authService.js";

export const login: RequestHandler = async (req, res) => {
    const { user, session } = await authService.loginByUsername(req.body);

    const isProduction = process.env.NODE_ENV === "production";

    // allow cross-origin cookies in production (different client and api origins)
    res.cookie("sid", session.id, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        expires: session.expiresAt,
        path: "/",
    });

    res.json(user);
};

export const logout: RequestHandler = async (req, res) => {
    await authService.logoutUser(req.cookies.sid);
    res.clearCookie("sid");

    res.end();
};

export const signup: RequestHandler = async (req, res) => {
    const user = await authService.signupUser(req.body);

    res.status(201).json(user);
};

export const getUser: RequestHandler = async (req, res) => {
    res.json(req.user);
};

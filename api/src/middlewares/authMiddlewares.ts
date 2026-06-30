import type { RequestHandler } from "express";
import { HttpError } from "../utils/HttpError.js";
import { getAuthenticatedUser } from "../services/authService.js";

export const requireAuth: RequestHandler = async (req, res, next) => {
    const sessionId: string = req.cookies.sid;

    if (!sessionId) {
        throw new HttpError(401, "Authentication required");
    }

    const user = await getAuthenticatedUser(sessionId);
    req.user = user;
    
    next();
};

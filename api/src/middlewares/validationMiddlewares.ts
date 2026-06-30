import type { RequestHandler } from "express";
import type { ZodType } from "zod/v4";
import { HttpError } from "../utils/HttpError.js";

export function validateBody(schema: ZodType) {
    const middleware: RequestHandler = (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const msg = result.error.issues.map((i) => i.message).join("\n");
            throw new HttpError(400, msg);
        }
        
        req.body = result.data;
        next();
    };

    return middleware;
}

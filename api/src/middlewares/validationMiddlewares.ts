import type { RequestHandler } from "express";
import type { ZodSafeParseResult, ZodType } from "zod/v4";
import { HttpError } from "../utils/HttpError.js";

export function validate(
    schema: ZodType,
    reqObj: "body" | "params" | "query" = "body",
) {
    const middleware: RequestHandler = (req, res, next) => {
        const result = schema.safeParse(req[reqObj]);

        if (!result.success) {
            const msg = result.error.issues.map((i) => i.message).join("\n");
            throw new HttpError(400, msg);
        }

        if (!req.validatedData || typeof req.validatedData !== "object") {
            req.validatedData = {};
        }

        // in express 5, req.query has only a getter so assigning will throw
        if (reqObj !== "query") {
            req[reqObj] = result.data;
        }
        req.validatedData[reqObj] = result.data;

        next();
    };

    return middleware;
}

export function handleZodErrors(result: ZodSafeParseResult<unknown>) {
    if (!result.success) {
        const msg = result.error.issues.map((i) => i.message).join("\n");
        throw new HttpError(400, msg);
    }
}

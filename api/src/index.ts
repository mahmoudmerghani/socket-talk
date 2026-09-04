import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import conversationRouter from "./routes/conversationRouter.js";
import groupRouter from "./routes/groupRouter.js";
import directRouter from "./routes/directRouter.js";
import { HttpError } from "./utils/HttpError.js";
import { ZodError } from "zod/v4";
import type { ErrorRequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ResError } from "@socket-talk/shared";
import { createServer } from "node:http";
import { setupWebSocket } from "./websocket.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    }),
);

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/conversations", conversationRouter);
app.use("/groups", groupRouter);
app.use("/directs", directRouter);

const errorHandler: ErrorRequestHandler<ParamsDictionary, ResError> = (
    err,
    req,
    res,
    next,
) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            error: err.message,
            status: err.status,
            ...(err.code !== undefined ? { code: err.code } : {}),
        });
    }

    if (err instanceof ZodError) {
        const msg = err.issues.map((i) => i.message).join("\n");
        return res.status(400).json({
            error: msg,
            status: 400,
        });
    }

    console.error(err);
    return res.status(500).json({
        error: "Server error",
        status: 500,
    });
};

app.use(errorHandler);

const server = createServer(app);

setupWebSocket(server);

server.listen(process.env.PORT, () => {
    console.log("Running on: " + process.env.PORT);
});

import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import cors from "cors";
import { HttpError } from "./utils/HttpError.js";
import type { ErrorRequestHandler } from "express";

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

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            error: err.message,
            ...(err.code !== undefined ? { code: err.code } : {}),
        });
    }

    console.error(err);
    return res.status(500).json({
        error: "Server error",
    });
};

app.use(errorHandler);

app.listen(process.env.PORT, (err) => {
    if (err) throw err;

    console.log("Running on: " + process.env.PORT);
});

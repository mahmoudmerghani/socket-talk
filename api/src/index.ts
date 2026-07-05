import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import authRouter from "./routes/authRouter.js";

const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/auth", authRouter);

app.listen(process.env.PORT, (err) => {
    if (err) throw err;

    console.log("Running on: " + process.env.PORT);
});

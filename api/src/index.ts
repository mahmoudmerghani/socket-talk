import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";

const app = express();

app.use(cookieParser());

app.listen(process.env.PORT);

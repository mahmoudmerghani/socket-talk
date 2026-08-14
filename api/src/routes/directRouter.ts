import express from "express";
import { requireAuth } from "../middlewares/authMiddlewares.js";
import * as directController from "../controllers/directController.js";

const directRouter = express.Router();

directRouter.use(requireAuth);

directRouter.get("/:userId", directController.getDM);

directRouter.post("/:userId/messages", directController.sendMessageToUser);

export default directRouter;

import express from "express";
import * as conversationController from "../controllers/conversationController.js";
import { requireAuth } from "../middlewares/authMiddlewares.js";

const conversationRouter = express.Router();

conversationRouter.use(requireAuth);

conversationRouter.get("/", conversationController.getAllUserConversations);

conversationRouter.get(
    "/:conversationId/messages",
    conversationController.getConversationMessages,
);

conversationRouter.post(
    "/:conversationId/messages",
    conversationController.sendMessageToConversation,
);

conversationRouter.post(
    "/:conversationId/read",
    conversationController.updateLastReadMessage,
);

export default conversationRouter;

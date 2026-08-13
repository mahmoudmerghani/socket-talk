import express from "express";
import * as groupController from "../controllers/groupController.js";
import { requireAuth } from "../middlewares/authMiddlewares.js";
import {
    uploadImage,
    handleMulterError,
} from "../middlewares/imageMiddlewares.js";

const groupRouter = express.Router();

groupRouter.use(requireAuth);


groupRouter.get("/", groupController.getGroups);
groupRouter.post("/", groupController.createGroup);

groupRouter.get("/:conversationId", groupController.getGroupInfo);

groupRouter.get("/:conversationId/members", groupController.getGroupMembers);
groupRouter.post("/:conversationId/members", groupController.addUserToGroup);
groupRouter.delete("/:conversationId/members", groupController.removeUserFromGroup);


const maxGroupImageSize = 2 * 1024 * 1024; // 2 MB
groupRouter.patch(
    "/:conversationId/group-image",
    uploadImage(maxGroupImageSize, "group-image"),
    handleMulterError(maxGroupImageSize, "group-image"),
    groupController.updateGroupImage,
);

export default groupRouter;

import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";
import { markMessageSeen } from "../controllers/message.controller.js";
const messageRouter = express.Router(); 

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute,getMessages);
messageRouter.put("/seen/:id", protectRoute, markMessageSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;
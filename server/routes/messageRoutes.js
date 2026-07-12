import express from "express";
import { getChatMessages, sendMessage, sseController } from "../controllers/messageController.js";
import { uplaod } from "../config/multer.js";
import { protect } from "../middlewares/auth.js";

const messageRouter = express.Router();

messageRouter.get('/:userId',sseController)
messageRouter.post('/send',uplaod.single('image'),protect,sendMessage)
messageRouter.post('/get',protect,getChatMessages)

export default messageRouter
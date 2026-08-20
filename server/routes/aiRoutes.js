import express from "express";
import { protect } from "../middlewares/auth.js";
import { chatWithAI } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post('/chat', protect, chatWithAI);

export default aiRouter;
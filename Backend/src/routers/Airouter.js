import express from "express";

import { chatWithAI } from "../controllers/Aicontroller.js";

import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/chat",
  Protect,
  chatWithAI
);

export default router;
import express from "express";

import {
  getProgress,
} from "../controllers/progressController.js";

import {
  Protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  Protect,
  getProgress
);

export default router;
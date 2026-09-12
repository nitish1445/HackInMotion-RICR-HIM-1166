import express from "express";

import {
  createExplanation,
  getMyExplanations,
} from "../controllers/explanationController.js";

import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  Protect,
  createExplanation
);

router.get(
  "/",
  Protect,
  getMyExplanations
);

export default router;
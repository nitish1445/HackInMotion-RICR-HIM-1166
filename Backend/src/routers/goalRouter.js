import express from "express";

import {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController.js";

import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  Protect,
  createGoal
);

router.get(
  "/",
  Protect,
  getGoals
);

router.get(
  "/:goalId",
  Protect,
  getGoalById
);

router.put(
  "/:goalId",
  Protect,
  updateGoal
);

router.delete(
  "/:goalId",
  Protect,
  deleteGoal
);

export default router;
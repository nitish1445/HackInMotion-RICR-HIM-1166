import express from "express";

import {
  getDashboardOverview,
  updateActiveGoal,
  addTask,
  updateTask,
  updateStudyHours,
  addAchievement,
} from "../controllers/dashboardController.js";

import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/overview",
  Protect,
  getDashboardOverview
);

/*
|--------------------------------------------------------------------------
| Goal
|--------------------------------------------------------------------------
*/

router.put(
  "/goal",
  Protect,
  updateActiveGoal
);

/*
|--------------------------------------------------------------------------
| Tasks
|--------------------------------------------------------------------------
*/

router.post(
  "/tasks",
  Protect,
  addTask
);

router.patch(
  "/tasks/:taskId",
  Protect,
  updateTask
);

/*
|--------------------------------------------------------------------------
| Study hours
|--------------------------------------------------------------------------
*/

router.patch(
  "/study-hours",
  Protect,
  updateStudyHours
);

/*
|--------------------------------------------------------------------------
| Achievements
|--------------------------------------------------------------------------
*/

router.post(
  "/achievements",
  Protect,
  addAchievement
);

export default router;
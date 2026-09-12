import express from "express";

import {
  getTestConfigOptions,
  generateTest,
  submitTest,
  getTestHistory,
  getTestResult,
} from "../controllers/testController.js";

import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Config options (subjects/difficulties/question counts)
|--------------------------------------------------------------------------
*/

router.get(
  "/config",
  Protect,
  getTestConfigOptions
);

/*
|--------------------------------------------------------------------------
| Generate
|--------------------------------------------------------------------------
*/

router.post(
  "/generate",
  Protect,
  generateTest
);

/*
|--------------------------------------------------------------------------
| History
|--------------------------------------------------------------------------
*/

router.get(
  "/history",
  Protect,
  getTestHistory
);

/*
|--------------------------------------------------------------------------
| Result (summary + review)
|--------------------------------------------------------------------------
*/

router.get(
  "/results/:testId",
  Protect,
  getTestResult
);

/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

router.post(
  "/:testId/submit",
  Protect,
  submitTest
);

export default router;
import express from "express";

import {
  getAssessmentSubjects,
  getAssessmentQuestions,
  submitAssessment,
  getLatestAssessment,
  getAssessmentHistory,
} from "../controllers/assessmentController.js";

import { Protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Subjects
|--------------------------------------------------------------------------
*/

router.get(
  "/subjects",
  Protect,
  getAssessmentSubjects
);

/*
|--------------------------------------------------------------------------
| Questions
|--------------------------------------------------------------------------
*/

router.get(
  "/questions",
  Protect,
  getAssessmentQuestions
);

/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

router.post(
  "/submit",
  Protect,
  submitAssessment
);

/*
|--------------------------------------------------------------------------
| Results
|--------------------------------------------------------------------------
*/

router.get(
  "/latest",
  Protect,
  getLatestAssessment
);

router.get(
  "/history",
  Protect,
  getAssessmentHistory
);

export default router;
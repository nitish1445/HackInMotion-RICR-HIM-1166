import express from "express";

import {
  createStudyPlan,
  getStudyPlan,
  updateSession,
  regenerateStudyPlan,
  getMyStudyPlan,
  updateMySession,
} from "../controllers/studyPlanController.js";

import { Protect } from "../middlewares/authMiddleware.js";

const router =
  express.Router();

/*
=========================================================
MY STUDY PLAN
=========================================================
*/

router.get(
  "/my-plan",
  Protect,
  getMyStudyPlan,
);

router.patch(
  "/my-plan/session/:sessionId/complete",
  Protect,
  updateMySession,
);

/*
=========================================================
CREATE STUDY PLAN
=========================================================
*/

router.post(
  "/:goalId",
  Protect,
  createStudyPlan,
);

/*
=========================================================
GET STUDY PLAN
=========================================================
*/

router.get(
  "/:goalId",
  Protect,
  getStudyPlan,
);

/*
=========================================================
UPDATE SESSION
=========================================================
*/

router.patch(
  "/:goalId/session/:sessionId",
  Protect,
  updateSession,
);

/*
=========================================================
REGENERATE
=========================================================
*/

router.post(
  "/:goalId/regenerate",
  Protect,
  regenerateStudyPlan,
);

export default router;
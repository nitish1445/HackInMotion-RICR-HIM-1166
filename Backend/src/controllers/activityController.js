import Goal from "../models/goalModel.js";
import LearningActivity from "../models/learningActivityModel.js";

import {
  buildActivityHeatmap,
  getAvailableYears,
  startOfUtcDay,
  endOfUtcDay,
  toDateKey,
  ROLLING_WINDOW,
} from "../service/learningActivityService.js";

import {
  getCompetitionForUser,
  getActiveLearnerCount,
} from "../service/leaderboardService.js";

import {
  SUBJECTS,
  resolveSubject,
} from "../service/assessmentQuestionProvider.js";

import { ACTIVE_LEARNER_WINDOW_DAYS } from "../config/learningActivityConfig.js";

const addDays = (date, days) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

/*
=========================================================
GET LEARNING ACTIVITY (heatmap + streak + summary)

GET /dashboard/activity?period=last-12-months | <year>

`period` defaults to a rolling 371-day window ("Last 12
Months"). A 4-digit year (e.g. "2026") switches to that
calendar year, clamped to today if it's the current year.
Only real activity is ever returned — an account with no
activity gets an empty grid and zeroed totals, never
fabricated numbers.
=========================================================
*/

export const getLearningActivityOverview = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = req.user._id;
    const { period } = req.query;

    const today = startOfUtcDay(new Date());

    let windowStart;
    let windowEnd;
    let resolvedPeriod;

    if (period && /^\d{4}$/.test(String(period))) {
      const year = Number(period);
      const currentYear = today.getUTCFullYear();

      if (year > currentYear || year < currentYear - 20) {
        return res.status(400).json({
          success: false,
          message: "Invalid year requested.",
        });
      }

      windowStart = new Date(Date.UTC(year, 0, 1));
      windowEnd =
        year === currentYear
          ? endOfUtcDay(today)
          : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
      resolvedPeriod = String(year);
    } else {
      windowEnd = endOfUtcDay(today);
      windowStart = addDays(today, -(ROLLING_WINDOW - 1));
      resolvedPeriod = "last-12-months";
    }

    const [heatmap, availableYears, allTimeCount] = await Promise.all([
      buildActivityHeatmap({ userId, windowStart, windowEnd }),
      getAvailableYears(userId),
      LearningActivity.countDocuments({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        period: resolvedPeriod,
        windowStart: toDateKey(windowStart),
        windowEnd: toDateKey(windowEnd),
        availableYears,
        isNewUser: allTimeCount === 0,
        ...heatmap,
      },
    });
  } catch (error) {
    console.error("GET LEARNING ACTIVITY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load learning activity.",
    });
  }
};

/*
=========================================================
GET COMPETITION (active learners + rank + position)

GET /dashboard/competition?subject=<subject>

If `subject` is omitted, falls back to the subject of the
user's most recently created learning goal. If the user has
no subject context at all yet, returns an honest "no
position established" response rather than a fake rank.
=========================================================
*/

export const getCompetitionOverview = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userId = req.user._id;
    const { subject } = req.query;

    let resolvedSubject = null;

    if (subject && String(subject).trim()) {
      resolvedSubject = resolveSubject(subject);

      if (!resolvedSubject) {
        return res.status(400).json({
          success: false,
          message: `Unsupported subject. Supported subjects: ${SUBJECTS.join(", ")}.`,
        });
      }
    }

    if (!resolvedSubject) {
      const latestGoal = await Goal.findOne({ user: userId }).sort({
        createdAt: -1,
      });

      if (latestGoal?.subject) {
        resolvedSubject = resolveSubject(latestGoal.subject);
      }
    }

    if (!resolvedSubject) {
      const activeLearners = await getActiveLearnerCount(null);

      return res.status(200).json({
        success: true,
        data: {
          subject: null,
          subjects: SUBJECTS,
          activeLearners,
          activeLearnerWindowDays: ACTIVE_LEARNER_WINDOW_DAYS,
          eligible: false,
          rank: null,
          totalEligible: 0,
          ahead: null,
          behind: null,
          score: null,
          scoreBreakdown: null,
          message:
            "Create a learning goal to establish your subject and see where you stand.",
        },
      });
    }

    const competition = await getCompetitionForUser({
      userId,
      subject: resolvedSubject,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...competition,
        subjects: SUBJECTS,
        message: competition.eligible
          ? null
          : "Complete an assessment to establish your learning position.",
      },
    });
  } catch (error) {
    console.error("GET COMPETITION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load competition data.",
    });
  }
};

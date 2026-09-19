import AssessmentResult from "../models/assessmentResultModel.js";
import Goal from "../models/goalModel.js";
import LearningActivity from "../models/learningActivityModel.js";
import TestResult from "../models/testResultModel.js";

import {
  ACTIVE_LEARNER_WINDOW_DAYS,
  CONSISTENCY_WINDOW_DAYS,
  LEADERBOARD_CACHE_TTL_MS,
  RANKING_WEIGHTS,
} from "../config/learningActivityConfig.js";

const leaderboardCache = new Map();
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfUtcDay = (date) => {
  const value = new Date(date);
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  );
};

const clamp = (value) => Math.max(0, Math.min(100, value));

const cacheKeyFor = (subject) => subject || "__all__";

const getCachedLeaderboard = (subject) => {
  const cached = leaderboardCache.get(cacheKeyFor(subject));

  if (!cached || cached.expiresAt <= Date.now()) {
    leaderboardCache.delete(cacheKeyFor(subject));
    return null;
  }

  return cached.entries;
};

const setCachedLeaderboard = (subject, entries) => {
  leaderboardCache.set(cacheKeyFor(subject), {
    entries,
    expiresAt: Date.now() + LEADERBOARD_CACHE_TTL_MS,
  });
};

const latestByUser = (results) => {
  const latest = new Map();

  for (const result of results) {
    const userId = String(result.user);
    if (!latest.has(userId)) latest.set(userId, result);
  }

  return latest;
};

const buildLeaderboard = async (subject) => {
  const cached = getCachedLeaderboard(subject);
  if (cached) return cached;

  const subjectFilter = subject ? { subject } : {};
  const activitySince = new Date(Date.now() - CONSISTENCY_WINDOW_DAYS * DAY_MS);

  const [assessments, tests, goals, activities] = await Promise.all([
    AssessmentResult.find(subjectFilter)
      .sort({ completedAt: -1 })
      .select("user subject percentage completedAt")
      .lean(),
    TestResult.find({ ...subjectFilter, status: "completed" })
      .select("user subject percentage")
      .lean(),
    Goal.find(subjectFilter).select("user subject progress updatedAt").lean(),
    LearningActivity.find({
      ...(subject ? { subject } : {}),
      occurredAt: { $gte: activitySince },
    })
      .select("user occurredAt")
      .lean(),
  ]);

  const latestAssessments = latestByUser(assessments);
  const testScores = new Map();

  for (const test of tests) {
    const userId = String(test.user);
    const scores = testScores.get(userId) || [];
    scores.push(Number(test.percentage) || 0);
    testScores.set(userId, scores);
  }

  const progressByUser = new Map();
  for (const goal of goals) {
    const userId = String(goal.user);
    const current = progressByUser.get(userId) || [];
    current.push(Number(goal.progress) || 0);
    progressByUser.set(userId, current);
  }

  const activeDaysByUser = new Map();
  for (const activity of activities) {
    const userId = String(activity.user);
    const activeDays = activeDaysByUser.get(userId) || new Set();
    activeDays.add(startOfUtcDay(activity.occurredAt).toISOString());
    activeDaysByUser.set(userId, activeDays);
  }

  const entries = [...latestAssessments].map(([userId, assessment]) => {
    const testsForUser = testScores.get(userId) || [];
    const performanceValues = [
      Number(assessment.percentage) || 0,
      ...testsForUser,
    ];
    const performance =
      performanceValues.reduce((sum, value) => sum + value, 0) /
      performanceValues.length;
    const consistency = clamp(
      ((activeDaysByUser.get(userId)?.size || 0) / CONSISTENCY_WINDOW_DAYS) * 100
    );
    const progressValues = progressByUser.get(userId) || [];
    const learningProgress = progressValues.length
      ? progressValues.reduce((sum, value) => sum + value, 0) /
        progressValues.length
      : 0;
    const score = Math.round(
      performance * RANKING_WEIGHTS.performance +
        consistency * RANKING_WEIGHTS.consistency +
        learningProgress * RANKING_WEIGHTS.learningProgress
    );

    return {
      userId,
      subject: assessment.subject,
      score: clamp(score),
      scoreBreakdown: {
        performance: Math.round(performance),
        consistency: Math.round(consistency),
        learningProgress: Math.round(learningProgress),
      },
    };
  });

  entries.sort((a, b) => b.score - a.score || a.userId.localeCompare(b.userId));
  setCachedLeaderboard(subject, entries);
  return entries;
};

export const getActiveLearnerCount = async (subject = null) => {
  const since = new Date(Date.now() - ACTIVE_LEARNER_WINDOW_DAYS * DAY_MS);
  const filter = { occurredAt: { $gte: since } };
  if (subject) filter.subject = subject;

  return LearningActivity.distinct("user", filter).then((users) => users.length);
};

export const getCompetitionForUser = async ({ userId, subject }) => {
  const leaderboard = await buildLeaderboard(subject);
  const index = leaderboard.findIndex((entry) => String(entry.userId) === String(userId));

  if (index === -1) {
    return {
      subject,
      activeLearners: await getActiveLearnerCount(subject),
      eligible: false,
      rank: null,
      totalEligible: leaderboard.length,
      ahead: null,
      behind: null,
      score: null,
      scoreBreakdown: null,
    };
  }

  const current = leaderboard[index];
  return {
    subject,
    activeLearners: await getActiveLearnerCount(subject),
    eligible: true,
    rank: index + 1,
    totalEligible: leaderboard.length,
    ahead: index,
    behind: leaderboard.length - index - 1,
    score: current.score,
    scoreBreakdown: current.scoreBreakdown,
  };
};
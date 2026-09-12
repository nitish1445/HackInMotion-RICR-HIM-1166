import AssessmentResult from "../models/assessmentResultModel.js";
import TestResult from "../models/testResultModel.js";

import {
  resolveSubject,
  getTopicsForSubject,
} from "./assessmentQuestionProvider.js";

import {
  WEAK_THRESHOLD,
  STRONG_THRESHOLD,
  RECENCY_DECAY,
  MAX_RECENT_TESTS,
  MAX_RECENT_ASSESSMENTS,
  CATEGORY_PRIORITY,
} from "../config/adaptivePlanningConfig.js";

/*
=========================================================
CATEGORIZE

Central, single-file definition of weak/average/strong so
no other module hardcodes these boundaries.
=========================================================
*/

export const categorizeScore = (score) => {
  if (score === null || score === undefined) return "unassessed";
  if (score >= STRONG_THRESHOLD) return "strong";
  if (score >= WEAK_THRESHOLD) return "average";
  return "weak";
};

/*
=========================================================
GET USER TOPIC PERFORMANCE

Builds a per-topic performance profile for a user+subject
from real, backend-owned data only (the user's own
AssessmentResult and TestResult documents) — never trusts
anything the client claims about its own scores.

Returns:
{
  resolvable: boolean,       // false if `subject` isn't in the known question-bank taxonomy
  hasPerformanceData: boolean, // false if the user has no assessment/test data at all for this subject
  topics: string[],          // every known topic for this subject
  performance: [
    { topic, score: number|null, category, priority, dataPoints: number }
  ]
}
=========================================================
*/

export const getUserTopicPerformance = async (userId, subject) => {
  const resolvedSubject = resolveSubject(subject);

  if (!resolvedSubject) {
    return {
      resolvable: false,
      hasPerformanceData: false,
      topics: [],
      performance: [],
    };
  }

  const topics = getTopicsForSubject(resolvedSubject);

  const [assessments, tests] = await Promise.all([
    AssessmentResult.find({ user: userId, subject: resolvedSubject })
      .sort({ completedAt: -1 })
      .limit(MAX_RECENT_ASSESSMENTS),

    TestResult.find({
      user: userId,
      subject: resolvedSubject,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .limit(MAX_RECENT_TESTS),
  ]);

  /*
   * Flatten every topicPerformance entry from every result
   * into { topic, percentage, completedAt } data points.
   */
  const dataPointsByTopic = new Map();

  const addDataPoints = (results) => {
    for (const result of results) {
      for (const tp of result.topicPerformance || []) {
        if (!dataPointsByTopic.has(tp.topic)) {
          dataPointsByTopic.set(tp.topic, []);
        }

        dataPointsByTopic.get(tp.topic).push({
          percentage: tp.percentage,
          completedAt: result.completedAt,
        });
      }
    }
  };

  addDataPoints(assessments);
  addDataPoints(tests);

  let hasPerformanceData = false;

  const performance = topics.map((topic) => {
    const points = (dataPointsByTopic.get(topic) || [])
      .slice()
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (points.length === 0) {
      return {
        topic,
        score: null,
        category: "unassessed",
        priority: CATEGORY_PRIORITY.unassessed,
        dataPoints: 0,
      };
    }

    hasPerformanceData = true;

    /*
     * Weighted average, most recent data point weighted
     * heaviest (rank 0), decaying for older ones.
     */
    let weightedSum = 0;
    let weightTotal = 0;

    points.forEach((point, rank) => {
      const weight = Math.pow(RECENCY_DECAY, rank);
      weightedSum += point.percentage * weight;
      weightTotal += weight;
    });

    const score = Math.round(weightedSum / weightTotal);
    const category = categorizeScore(score);

    return {
      topic,
      score,
      category,
      priority: CATEGORY_PRIORITY[category],
      dataPoints: points.length,
    };
  });

  return {
    resolvable: true,
    hasPerformanceData,
    topics,
    performance,
  };
};
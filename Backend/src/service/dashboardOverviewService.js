import AssessmentResult from "../models/assessmentResultModel.js";
import TestResult from "../models/testResultModel.js";
import Goal from "../models/goalModel.js";
import StudyPlan from "../models/studyPlanModel.js";

import { getUserTopicPerformance } from "./performanceService.js";
import { calculateLevel } from "./assessmentScoringService.js";

/*
=========================================================
LEVEL EXPLANATIONS

Dynamic, student-friendly explanation of what the current
level actually means — never a bare label.
=========================================================
*/

const LEVEL_EXPLANATIONS = {
  Foundation:
    "You are building your fundamentals. Focus on core concepts before moving to advanced topics.",
  Beginner:
    "You understand some fundamentals but need more consistent practice.",
  Intermediate:
    "You have a good foundation and can solve common problems, but some topics need deeper practice.",
  Advanced:
    "You demonstrate strong understanding across most assessed topics.",
};

/*
 * category (from performanceService) -> student-friendly,
 * non-judgmental label. The TOPIC is described this way,
 * never the student.
 */
const CATEGORY_LABELS = {
  weak: "Needs Improvement",
  average: "Developing",
  strong: "Strong",
  unassessed: "Not Yet Assessed",
};

/*
=========================================================
BUILD LEARNING OVERVIEW

Aggregates AssessmentResult + TestResult + StudyPlan (via
the active Goal) into everything the Overview page needs,
in one call. Every number here is derived from the user's
own real records — nothing is invented, and anything
without enough data is reported as unavailable rather than
guessed at.
=========================================================
*/

export const buildLearningOverview = async (userId) => {
  const [assessmentSubjects, testSubjects] = await Promise.all([
    AssessmentResult.distinct("subject", { user: userId }),
    TestResult.distinct("subject", { user: userId, status: "completed" }),
  ]);

  const subjects = [...new Set([...assessmentSubjects, ...testSubjects])];

  if (subjects.length === 0) {
    return { hasAnyData: false };
  }

  const [allAssessments, allTests] = await Promise.all([
    AssessmentResult.find({ user: userId, subject: { $in: subjects } }).sort({
      completedAt: -1,
    }),
    TestResult.find({
      user: userId,
      subject: { $in: subjects },
      status: "completed",
    }).sort({ completedAt: -1 }),
  ]);

  /*
   * Focus subject: whichever subject the user most recently
   * practiced (assessment or mock test), so the detailed
   * breakdown is always about what they're actually working
   * on right now.
   */
  const latestAssessmentOverall = allAssessments[0] || null;
  const latestTestOverall = allTests[0] || null;

  let focusSubject = subjects[0];

  if (latestAssessmentOverall && latestTestOverall) {
    focusSubject =
      latestAssessmentOverall.completedAt > latestTestOverall.completedAt
        ? latestAssessmentOverall.subject
        : latestTestOverall.subject;
  } else if (latestAssessmentOverall) {
    focusSubject = latestAssessmentOverall.subject;
  } else if (latestTestOverall) {
    focusSubject = latestTestOverall.subject;
  }

  const subjectAssessments = allAssessments.filter(
    (a) => a.subject === focusSubject
  ); // already sorted desc (most recent first)

  const subjectTests = allTests.filter((t) => t.subject === focusSubject);

  const latestAssessment = subjectAssessments[0] || null;
  const previousAssessment = subjectAssessments[1] || null;

  /*
   * Mock test stats for the focus subject.
   */
  const testStats =
    subjectTests.length > 0
      ? {
          completed: subjectTests.length,
          averageScore: Math.round(
            subjectTests.reduce((sum, t) => sum + t.percentage, 0) /
              subjectTests.length
          ),
          bestScore: Math.max(...subjectTests.map((t) => t.percentage)),
          latestScore: subjectTests[0].percentage,
          latestDifficulty: subjectTests[0].difficulty,
        }
      : null;

  /*
   * Topic performance — reuses the exact same
   * assessment+mock-test recency-weighted profile the
   * Adaptive Planner uses, so the dashboard and the study
   * plan always agree on what's weak/strong.
   */
  const profile = await getUserTopicPerformance(userId, focusSubject);

  const topics = profile.performance.map((p) => ({
    topic: p.topic,
    score: p.score,
    category: p.category,
    label: CATEGORY_LABELS[p.category],
    priority: p.priority,
  }));

  const strongTopics = topics.filter((t) => t.category === "strong");
  const improvementTopics = topics.filter((t) => t.category === "weak");

  const assessedTopics = topics.filter((t) => t.category !== "unassessed");
  const topicAccuracy =
    assessedTopics.length > 0
      ? Math.round(
          assessedTopics.reduce((sum, t) => sum + t.score, 0) /
            assessedTopics.length
        )
      : null;

  /*
   * Study plan progress, via the user's active goal.
   */
  const activeGoal = await Goal.findOne({
    user: userId,
    status: "active",
  }).sort({ createdAt: -1 });

  let studyPlanData = { hasData: false };

  if (activeGoal) {
    const plan = await StudyPlan.findOne({
      user: userId,
      goal: activeGoal._id,
    }).sort({ createdAt: -1 });

    if (plan) {
      const totalDays = plan.days.length;

      const completedDays = plan.days.filter(
        (day) =>
          day.sessions.length > 0 && day.sessions.every((s) => s.completed)
      ).length;

      const progress = totalDays
        ? Math.round((completedDays / totalDays) * 100)
        : 0;

      let todayFocus = null;

      for (const day of plan.days) {
        const incomplete = day.sessions.filter((s) => !s.completed);

        if (incomplete.length > 0) {
          const next =
            incomplete.find((s) => s.priority === "high") || incomplete[0];

          todayFocus = {
            topic: next.topic,
            type: next.type,
            priority: next.priority,
            duration: next.duration,
            activities: next.activities || [],
          };
          break;
        }
      }

      studyPlanData = {
        hasData: true,
        adaptive: plan.adaptive,
        progress,
        completedDays,
        totalDays,
        todayFocus,
        weakTopics: plan.weakTopics,
        strongTopics: plan.strongTopics,
        goalTitle: activeGoal.title,
        goalSubject: activeGoal.subject,
      };
    }
  }

  /*
   * Overall score — the average of whichever of these three
   * signals actually exist for this user, never a guess at
   * a missing one.
   */
  const components = [];
  if (latestAssessment) components.push(latestAssessment.percentage);
  if (testStats) components.push(testStats.averageScore);
  if (topicAccuracy !== null) components.push(topicAccuracy);

  const overallScore =
    components.length > 0
      ? Math.round(components.reduce((sum, v) => sum + v, 0) / components.length)
      : null;

  const level = overallScore !== null ? calculateLevel(overallScore) : null;

  /*
   * Improvement — only meaningful with 2+ assessments of
   * the same subject.
   */
  const improvement =
    latestAssessment && previousAssessment
      ? {
          hasComparison: true,
          value: latestAssessment.percentage - previousAssessment.percentage,
        }
      : { hasComparison: false };

  /*
   * Progress history for the trend view — chronological
   * (oldest first), only ever real completed assessments.
   */
  const progressHistory = [...subjectAssessments]
    .reverse()
    .map((a, i) => ({
      label: `Assessment ${i + 1}`,
      percentage: a.percentage,
      date: a.completedAt,
    }));

  /*
   * Recommendation — from the real adaptive plan's next
   * incomplete session when one exists, otherwise from the
   * weakest assessed topic.
   */
  let recommendation = null;

  if (studyPlanData.hasData && studyPlanData.todayFocus) {
    recommendation = {
      topic: studyPlanData.todayFocus.topic,
      priority: studyPlanData.todayFocus.priority,
      steps:
        studyPlanData.todayFocus.activities.length > 0
          ? studyPlanData.todayFocus.activities
          : [`Continue working on ${studyPlanData.todayFocus.topic}`],
      source: "study-plan",
    };
  } else if (improvementTopics.length > 0) {
    const weakest = [...improvementTopics].sort((a, b) => a.score - b.score)[0];

    recommendation = {
      topic: weakest.topic,
      priority: "high",
      steps: [
        `Review ${weakest.topic} fundamentals`,
        `Practice a few problems on ${weakest.topic}`,
        "Take a short retest to check your progress",
      ],
      source: "topic-performance",
    };
  }

  /*
   * Smart summary — deterministically templated from the
   * numbers already computed above (not a live AI call):
   * this keeps it fast, free, and impossible to hallucinate,
   * while still reading like a natural-language summary.
   */
  const summaryParts = [];

  if (overallScore !== null) {
    summaryParts.push(
      `Your current performance in ${focusSubject} is ${level} with an overall score of ${overallScore}%.`
    );
  }

  if (strongTopics.length > 0) {
    summaryParts.push(
      `You're strongest in ${strongTopics
        .slice(0, 2)
        .map((t) => t.topic)
        .join(" and ")}.`
    );
  }

  if (improvementTopics.length > 0) {
    const names = improvementTopics.slice(0, 2).map((t) => t.topic).join(" and ");
    const isSingular = improvementTopics.length === 1;
    const verb = isSingular ? "needs" : "need";
    const areaWord = isSingular ? "this area" : "these areas";

    summaryParts.push(
      studyPlanData.hasData
        ? `${names} ${verb} more practice, so your current study plan is prioritizing ${areaWord}.`
        : `${names} ${verb} more practice.`
    );
  }

  if (improvement.hasComparison) {
    const direction = improvement.value >= 0 ? "improved" : "decreased";
    summaryParts.push(
      `Your performance has ${direction} by ${Math.abs(improvement.value)}% compared with your previous assessment.`
    );
  }

  const smartSummary =
    summaryParts.length > 0
      ? summaryParts.join(" ")
      : "Complete a Knowledge Assessment or Mock Test to see your personalized performance summary here.";

  return {
    hasAnyData: true,
    focusSubject,
    level,
    levelExplanation: level ? LEVEL_EXPLANATIONS[level] : null,
    overallScore,
    improvement,
    breakdown: {
      assessment: latestAssessment
        ? { available: true, score: latestAssessment.percentage }
        : { available: false },
      mockTest: testStats
        ? { available: true, score: testStats.averageScore }
        : { available: false },
      topicAccuracy:
        topicAccuracy !== null
          ? { available: true, score: topicAccuracy }
          : { available: false },
      studyPlanCompletion: studyPlanData.hasData
        ? { available: true, score: studyPlanData.progress }
        : { available: false },
    },
    topics,
    strongTopics,
    improvementTopics,
    assessment: latestAssessment
      ? {
          hasData: true,
          score: latestAssessment.percentage,
          level: latestAssessment.level,
          topicsAssessed: latestAssessment.topicPerformance.length,
          needsImprovementCount: latestAssessment.weakTopics.length,
          lastCompletedAt: latestAssessment.completedAt,
        }
      : { hasData: false },
    mockTests: testStats
      ? { hasData: true, ...testStats, latestSubject: focusSubject }
      : { hasData: false },
    studyPlan: studyPlanData,
    progressHistory,
    recommendation,
    smartSummary,
  };
};
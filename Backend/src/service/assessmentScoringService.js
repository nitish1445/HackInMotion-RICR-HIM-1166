/*
=========================================================
CONFIG

Thresholds are intentionally centralized here so they can
be tuned later without touching controller logic.
=========================================================
*/

/*
 * Overall percentage -> assessed level.
 * Checked top-down; first match wins.
 */
export const LEVEL_THRESHOLDS = [
  { min: 90, level: "Advanced" },
  { min: 70, level: "Intermediate" },
  { min: 40, level: "Beginner" },
  { min: 0, level: "Foundation" },
];

export const STRONG_TOPIC_THRESHOLD = 75;
export const WEAK_TOPIC_THRESHOLD = 60;

/*
=========================================================
LEVEL
=========================================================
*/

export const calculateLevel = (percentage) => {
  const match = LEVEL_THRESHOLDS.find((t) => percentage >= t.min);
  return match ? match.level : "Foundation";
};

/*
=========================================================
TOPIC-WISE PERFORMANCE

`gradedAnswers` is an array of:
  { topic, isCorrect }
one entry per answered question, already resolved
against the question bank by the caller.
=========================================================
*/

export const calculateTopicPerformance = (gradedAnswers) => {
  const byTopic = new Map();

  for (const { topic, isCorrect } of gradedAnswers) {
    if (!byTopic.has(topic)) {
      byTopic.set(topic, { totalQuestions: 0, correctAnswers: 0 });
    }

    const entry = byTopic.get(topic);
    entry.totalQuestions += 1;

    if (isCorrect) {
      entry.correctAnswers += 1;
    }
  }

  const topicPerformance = Array.from(byTopic.entries()).map(
    ([topic, { totalQuestions, correctAnswers }]) => ({
      topic,
      totalQuestions,
      correctAnswers,
      percentage: Math.round((correctAnswers / totalQuestions) * 100),
    })
  );

  const strongTopics = topicPerformance
    .filter((t) => t.percentage >= STRONG_TOPIC_THRESHOLD)
    .map((t) => t.topic);

  const weakTopics = topicPerformance
    .filter((t) => t.percentage < WEAK_TOPIC_THRESHOLD)
    .map((t) => t.topic);

  return { topicPerformance, strongTopics, weakTopics };
};

/*
=========================================================
FULL SCORE CALCULATION
=========================================================
*/

export const calculateAssessmentResult = (gradedAnswers) => {
  const totalQuestions = gradedAnswers.length;
  const correctAnswers = gradedAnswers.filter((a) => a.isCorrect).length;

  const percentage = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;

  const level = calculateLevel(percentage);

  const { topicPerformance, strongTopics, weakTopics } =
    calculateTopicPerformance(gradedAnswers);

  return {
    totalQuestions,
    correctAnswers,
    score: correctAnswers,
    percentage,
    level,
    topicPerformance,
    strongTopics,
    weakTopics,
  };
};
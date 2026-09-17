import { getUserTopicPerformance } from "./performanceService.js";

import {
  TIME_ALLOCATION,
  MIN_SESSION_MINUTES,
} from "../config/adaptivePlanningConfig.js";

/*
=========================================================
CONFIG
=========================================================
*/

const SESSION_CAP_MINUTES = {
  LEARN: 45,
  PRACTICE: 30,
  REVIEW: 20,
  TEST: 20,
};


/*
=========================================================
DATE / DAY-NAME HELPERS
(same convention the legacy generator used)
=========================================================
*/

export const createDate = (daysFromToday) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return date;
};

const dayName = (dayIndex) => {
  if (dayIndex === 0) return "Today";
  if (dayIndex === 1) return "Tomorrow";
  return `Day ${dayIndex + 1}`;
};

/*
=========================================================
ACTIVITY TEMPLATES

Weak/average topics get real learn+practice activities;
strong topics get lightweight maintenance review only —
this is what actually makes the schedule (not just the
UI) reflect priority.
=========================================================
*/

const activitiesFor = (category, type, topic) => {
  if (type === "REVIEW" && category === "strong") {
    return [
      `Quick revision of ${topic}`,
      "Skim key concepts to stay sharp",
    ];
  }

  if (type === "LEARN") {
    return category === "weak"
      ? [
          `Learn ${topic} fundamentals`,
          "Study worked examples",
          "Note common mistakes",
        ]
      : [`Review core concepts of ${topic}`, "Skim key examples"];
  }

  if (type === "PRACTICE") {
    return category === "weak"
      ? [
          `Solve practice problems on ${topic}`,
          "Review any incorrect attempts",
        ]
      : [`Solve a few practice problems on ${topic}`];
  }

  return [`Review ${topic}`];
};

const typeSequenceFor = (category) =>
  category === "strong" ? ["REVIEW"] : ["LEARN", "PRACTICE"];

/*
=========================================================
BUILD ADAPTIVE DAYS

Deterministic given (performanceProfile, durationDays,
dailyMinutes) — no randomness, so it's directly testable.
=========================================================
*/

const buildAdaptiveDays = ({
  performance,
  durationDays,
  dailyMinutes,
}) => {
  const weak = performance.filter((p) => p.category === "weak");
  const average = performance.filter(
    (p) => p.category === "average" || p.category === "unassessed"
  );
  const strong = performance.filter((p) => p.category === "strong");

  /*
   * Renormalize the configured weak/average/strong time
   * split over whichever buckets actually have topics —
   * e.g. if nothing is "strong" yet, that 10% gets folded
   * back into weak/average instead of being wasted.
   */
  const buckets = [
    { key: "weak", topics: weak },
    { key: "average", topics: average },
    { key: "strong", topics: strong },
  ].filter((b) => b.topics.length > 0);

  const totalWeight = buckets.reduce(
    (sum, b) => sum + TIME_ALLOCATION[b.key],
    0
  );

  const totalMinutes = dailyMinutes * durationDays;

  /*
   * Per-topic remaining-minutes budget, and a queue in
   * priority order (weak first) that we round-robin
   * through while filling days.
   */
  const budgetByTopic = new Map();
  const queue = [];

  for (const bucket of buckets) {
    const bucketMinutes = Math.round(
      totalMinutes * (TIME_ALLOCATION[bucket.key] / totalWeight)
    );

    const perTopicMinutes = Math.floor(
      bucketMinutes / bucket.topics.length
    );

    for (const topicPerf of bucket.topics) {
      budgetByTopic.set(topicPerf.topic, perTopicMinutes);
      queue.push({
        topic: topicPerf.topic,
        category: topicPerf.category,
        typeIndex: 0,
      });
    }
  }

  /*
   * Reassessment checkpoints — only worth inserting when
   * there's enough runway, and only when weak topics
   * actually exist to retest.
   */
  const checkpointsByDay = new Map();

  if (weak.length > 0 && durationDays >= 3) {
    const weakTopicNames = weak.map((w) => w.topic).join(", ");

    const retestDay = durationDays - 1;
    checkpointsByDay.set(retestDay, [
      {
        type: "TEST",
        title: `Retest: ${weakTopicNames}`,
        topic: weakTopicNames,
        duration: Math.min(SESSION_CAP_MINUTES.TEST, dailyMinutes),
        priority: "high",
        activities: [
          "Retake a focused quiz on your previously weak topics",
          "Compare results against your last attempt",
        ],
        completed: false,
        completedAt: null,
        link: "",
      },
    ]);

    if (durationDays >= 4) {
      const reviewDay = durationDays - 2;
      checkpointsByDay.set(reviewDay, [
        {
          type: "REVIEW",
          title: `Review weak areas: ${weakTopicNames}`,
          topic: weakTopicNames,
          duration: Math.min(20, dailyMinutes),
          priority: "high",
          activities: [
            "Revisit mistakes from recent practice",
            "Re-read explanations for missed questions",
          ],
          completed: false,
          completedAt: null,
          link: "",
        },
      ]);
    }

    if (durationDays >= 5) {
      const quizDay = Math.floor(durationDays * 0.6);
      if (!checkpointsByDay.has(quizDay)) {
        checkpointsByDay.set(quizDay, [
          {
            type: "TEST",
            title: `Weak Area Quiz: ${weakTopicNames}`,
            topic: weakTopicNames,
            duration: Math.min(20, dailyMinutes),
            priority: "high",
            activities: [
              "Take a short quiz covering your weak topics so far",
            ],
            completed: false,
            completedAt: null,
            link: "",
          },
        ]);
      }
    }
  }

  /*
   * Fill each day via round robin over the priority queue,
   * leaving room for that day's checkpoint sessions (if
   * any) so the daily time budget is still respected.
   */
  const days = [];

  for (let dayIndex = 0; dayIndex < durationDays; dayIndex++) {
    const checkpointSessions = checkpointsByDay.get(dayIndex) || [];
    const checkpointMinutes = checkpointSessions.reduce(
      (sum, s) => sum + s.duration,
      0
    );

    const dayCapacity = Math.max(0, dailyMinutes - checkpointMinutes);

    const sessions = [];
    let used = 0;
    let attemptsWithoutProgress = 0;

    while (
      used < dayCapacity &&
      queue.length > 0 &&
      attemptsWithoutProgress < queue.length + 1
    ) {
      const entry = queue.shift();
      const remaining = budgetByTopic.get(entry.topic);

      if (!remaining || remaining <= 0) {
        attemptsWithoutProgress += 1;
        continue;
      }

      const roomLeftToday = dayCapacity - used;

      if (roomLeftToday < MIN_SESSION_MINUTES) {
        /*
         * The DAY is full, not the topic — put it back
         * untouched so its full remaining budget carries
         * over to a future day instead of being discarded.
         */
        queue.unshift(entry);
        break;
      }

      const sequence = typeSequenceFor(entry.category);
      const type = sequence[entry.typeIndex % sequence.length];

      const sessionMinutes = Math.min(
        SESSION_CAP_MINUTES[type],
        remaining,
        roomLeftToday
      );

      if (sessionMinutes < MIN_SESSION_MINUTES) {
        /*
         * roomLeftToday was sufficient, so it's the topic's
         * OWN remaining budget that's a negligible sliver —
         * drop it for good rather than looping on it.
         */
        budgetByTopic.set(entry.topic, 0);
        attemptsWithoutProgress += 1;
        continue;
      }

      const typeLabel =
        type === "LEARN"
          ? "Learn"
          : type === "PRACTICE"
          ? "Practice"
          : type === "REVIEW"
          ? "Review"
          : "Test";

      sessions.push({
        type,
        title: `${entry.topic} — ${typeLabel}`,
        topic: entry.topic,
        duration: sessionMinutes,
        priority:
          entry.category === "weak"
            ? "high"
            : entry.category === "strong"
            ? "low"
            : "medium",
        activities: activitiesFor(entry.category, type, entry.topic),
        completed: false,
        completedAt: null,
        link: "",
      });

      used += sessionMinutes;
      budgetByTopic.set(entry.topic, remaining - sessionMinutes);
      attemptsWithoutProgress = 0;

      if (budgetByTopic.get(entry.topic) > 0) {
        queue.push({
          topic: entry.topic,
          category: entry.category,
          typeIndex: entry.typeIndex + 1,
        });
      }
    }

    sessions.push(...checkpointSessions);

    days.push({
      day: dayName(dayIndex),
      date: createDate(dayIndex),
      sessions,
    });
  }

  return days;
};

/*
=========================================================
BUILD BALANCED (NO PERFORMANCE DATA YET) DAYS

Real topic names, evenly distributed — better than the
legacy "Topic 1/2/3" placeholders even before any
assessment/test exists, but explicitly NOT weak/strong
prioritized since we have no data to justify that.
=========================================================
*/

const buildBalancedDays = ({ topics, durationDays, dailyMinutes }) => {
  const perTopicMinutes = Math.floor(
    (dailyMinutes * durationDays) / Math.max(1, topics.length)
  );

  const queue = topics.map((topic) => ({ topic, typeIndex: 0 }));
  const budgetByTopic = new Map(
    topics.map((topic) => [topic, perTopicMinutes])
  );

  const days = [];

  for (let dayIndex = 0; dayIndex < durationDays; dayIndex++) {
    const sessions = [];
    let used = 0;
    let attemptsWithoutProgress = 0;

    while (
      used < dailyMinutes &&
      queue.length > 0 &&
      attemptsWithoutProgress < queue.length + 1
    ) {
      const entry = queue.shift();
      const remaining = budgetByTopic.get(entry.topic);

      if (!remaining || remaining <= 0) {
        attemptsWithoutProgress += 1;
        continue;
      }

      const roomLeftToday = dailyMinutes - used;

      if (roomLeftToday < MIN_SESSION_MINUTES) {
        queue.unshift(entry);
        break;
      }

      const sequence = ["LEARN", "PRACTICE"];
      const type = sequence[entry.typeIndex % sequence.length];

      const sessionMinutes = Math.min(
        SESSION_CAP_MINUTES[type],
        remaining,
        roomLeftToday
      );

      if (sessionMinutes < MIN_SESSION_MINUTES) {
        budgetByTopic.set(entry.topic, 0);
        attemptsWithoutProgress += 1;
        continue;
      }

      sessions.push({
        type,
        title: `${entry.topic} — ${type === "LEARN" ? "Learn" : "Practice"}`,
        topic: entry.topic,
        duration: sessionMinutes,
        priority: "medium",
        activities: activitiesFor("average", type, entry.topic),
        completed: false,
        completedAt: null,
        link: "",
      });

      used += sessionMinutes;
      budgetByTopic.set(entry.topic, remaining - sessionMinutes);
      attemptsWithoutProgress = 0;

      if (budgetByTopic.get(entry.topic) > 0) {
        queue.push({ topic: entry.topic, typeIndex: entry.typeIndex + 1 });
      }
    }

    days.push({
      day: dayName(dayIndex),
      date: createDate(dayIndex),
      sessions,
    });
  }

  return days;
};

/*
=========================================================
PUBLIC ENTRY POINT

Retrieves the user's real performance data server-side
(never trusts anything the client claims about its own
scores), then builds either:
  - an adaptive, weak-area-prioritized plan, or
  - a balanced plan with real topic names (no assessment
    data yet), or
  - the caller's legacy day-builder, for subjects outside
    the known question-bank taxonomy (where no topic list
    or performance data can exist at all).
=========================================================
*/

export const generateAdaptiveStudyPlan = async ({
  userId,
  subject,
  durationDays,
  dailyMinutes,
  buildLegacyDays,
}) => {
  const profile = await getUserTopicPerformance(userId, subject);

  if (!profile.resolvable) {
    return {
      adaptive: false,
      weakTopics: [],
      averageTopics: [],
      strongTopics: [],
      topicPriorities: [],
      description: `Your personalized ${subject} study plan.`,
      days: buildLegacyDays(),
    };
  }

  const weakTopics = profile.performance
    .filter((p) => p.category === "weak")
    .map((p) => p.topic);

  const averageTopics = profile.performance
    .filter((p) => p.category === "average")
    .map((p) => p.topic);

  const strongTopics = profile.performance
    .filter((p) => p.category === "strong")
    .map((p) => p.topic);

  const topicPriorities = profile.performance.map((p) => ({
    topic: p.topic,
    score: p.score,
    category: p.category,
    priority: p.priority,
  }));

  if (!profile.hasPerformanceData) {
    return {
      adaptive: false,
      weakTopics: [],
      averageTopics: [],
      strongTopics: [],
      topicPriorities,
      description: `A balanced ${subject} study plan covering ${profile.topics.length} topics. Complete the Knowledge Assessment for a plan personalized to your weak areas.`,
      days: buildBalancedDays({
        topics: profile.topics,
        durationDays,
        dailyMinutes,
      }),
    };
  }

  const description =
    weakTopics.length > 0
      ? `Your adaptive ${subject} plan — prioritizing ${weakTopics.join(", ")} based on your recent performance.`
      : `Your adaptive ${subject} plan — a maintenance schedule since your recent performance is already strong across assessed topics.`;

  return {
    adaptive: true,
    weakTopics,
    averageTopics,
    strongTopics,
    topicPriorities,
    description,
    days: buildAdaptiveDays({
      performance: profile.performance,
      durationDays,
      dailyMinutes,
    }),
  };
};
import LearningActivity, {
  ACTIVITY_TYPE_LABELS,
} from "../models/learningActivityModel.js";

import {
  INTENSITY_THRESHOLDS,
  STREAK_LOOKBACK_DAYS,
  ROLLING_WINDOW_DAYS,
} from "../config/learningActivityConfig.js";

/*
=========================================================
DATE HELPERS

All day-bucketing is done in UTC (matching Mongo's
$dateToString default) so the backend's date keys and the
frontend's rendering line up exactly, regardless of either
side's local timezone.
=========================================================
*/

export const toDateKey = (date) => new Date(date).toISOString().slice(0, 10);

export const startOfUtcDay = (date) => {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
};

/*
 * End of the UTC calendar day (23:59:59.999). Used as the
 * upper bound whenever "today" needs to include everything
 * that has happened so far today — using startOfUtcDay for
 * that bound would incorrectly exclude every activity
 * logged after midnight UTC on the current day.
 */
export const endOfUtcDay = (date) => {
  const d = new Date(date);
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

/*
=========================================================
LOG ACTIVITY

The single write path for every LearningActivity document.
Never throws — logging a contribution must never break the
primary action (submitting an assessment, chatting with the
AI, etc.) that triggered it. Failures are logged server-side
only.
=========================================================
*/

export const logActivity = async ({
  userId,
  activityType,
  subject = "",
  topic = "",
  metadata = {},
  occurredAt = new Date(),
}) => {
  try {
    if (!userId || !activityType) return null;

    return await LearningActivity.create({
      user: userId,
      activityType,
      subject: subject || "",
      topic: topic || "",
      metadata: metadata || {},
      occurredAt,
    });
  } catch (error) {
    console.error("LOG LEARNING ACTIVITY ERROR:", error);
    return null;
  }
};

/*
=========================================================
INTENSITY

Maps a raw daily activity count to one of GitHub's 5 legend
levels (0 = empty, 1-4 = increasing intensity). Thresholds
live in config so they can be tuned as real activity volume
becomes clearer, without touching this logic.
=========================================================
*/

export const getIntensityLevel = (count) => {
  if (!count || count <= 0) return 0;
  if (count < INTENSITY_THRESHOLDS.medium) return 1;
  if (count < INTENSITY_THRESHOLDS.high) return 2;
  if (count < INTENSITY_THRESHOLDS.highest) return 3;
  return 4;
};

/*
=========================================================
STREAK CALCULATION

Operates on a Set of "YYYY-MM-DD" keys representing every
distinct day the user had at least one real learning
activity. Same algorithm shape as progressController's
existing streak logic, generalized to any activity source.
=========================================================
*/

export const calculateCurrentStreak = (activeDateSet, referenceDate = new Date()) => {
  const today = startOfUtcDay(referenceDate);
  let streak = 0;

  for (let i = 0; i < STREAK_LOOKBACK_DAYS; i++) {
    const day = addDays(today, -i);
    const key = toDateKey(day);

    if (activeDateSet.has(key)) {
      streak++;
    } else if (i === 0) {
      /*
       * No activity yet today doesn't break an existing
       * streak — the day isn't over.
       */
      continue;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateLongestStreak = (activeDateSet) => {
  const dates = [...activeDateSet].sort();

  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const previous = new Date(dates[i - 1]);
    const currentDate = new Date(dates[i]);

    const diffDays = Math.round(
      (currentDate - previous) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

/*
=========================================================
MOTIVATIONAL MESSAGE

Generated purely from the user's own real numbers — never
the same canned line for every user, and never fabricated
counts.
=========================================================
*/

export const generateMotivationalMessage = ({
  currentStreak,
  longestStreak,
  activitiesThisWeek,
  hasActivityToday,
  totalContributions,
}) => {
  if (totalContributions === 0) {
    return "Start a study session today to build your first streak.";
  }

  if (currentStreak >= 2 && hasActivityToday) {
    return `You're on a ${currentStreak}-day streak. Keep going — your consistency is building great habits.`;
  }

  if (currentStreak >= 2 && !hasActivityToday) {
    return `You have a ${currentStreak}-day streak going. Complete a learning activity today to keep it alive.`;
  }

  if (hasActivityToday && activitiesThisWeek > 0) {
    return `You've completed ${activitiesThisWeek} learning ${
      activitiesThisWeek === 1 ? "activity" : "activities"
    } this week. Nice work today!`;
  }

  if (!hasActivityToday && activitiesThisWeek > 0) {
    return `You've completed ${activitiesThisWeek} learning ${
      activitiesThisWeek === 1 ? "activity" : "activities"
    } this week. Start a session today to continue your streak.`;
  }

  if (longestStreak > 0) {
    return `Your longest streak so far is ${longestStreak} days. Start a study session today to work toward a new one.`;
  }

  return "Start a study session today to continue building your learning habit.";
};

/*
=========================================================
BUILD HEATMAP PAYLOAD

Runs two aggregations:
1. Daily counts + activity-type set within the requested
   display window (used for the visible grid + totals for
   that window).
2. All distinct active days within STREAK_LOOKBACK_DAYS
   (used for streak calculation, decoupled from whatever
   window the user is currently viewing — switching the
   year selector shouldn't reset a real streak).
=========================================================
*/

export const buildActivityHeatmap = async ({
  userId,
  windowStart,
  windowEnd,
}) => {
  const dayGroups = await LearningActivity.aggregate([
    {
      $match: {
        user: userId,
        occurredAt: { $gte: windowStart, $lte: windowEnd },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" },
        },
        count: { $sum: 1 },
        activityTypes: { $addToSet: "$activityType" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const days = dayGroups.map((d) => ({
    date: d._id,
    count: d.count,
    level: getIntensityLevel(d.count),
    activities: d.activityTypes.map(
      (type) => ACTIVITY_TYPE_LABELS[type] || type
    ),
  }));

  const totalContributions = days.reduce((sum, d) => sum + d.count, 0);
  const activeDaysInWindow = days.length;
  const averagePerActiveDay = activeDaysInWindow
    ? Math.round((totalContributions / activeDaysInWindow) * 10) / 10
    : 0;

  /*
   * Streak calculation uses its own, longer, decoupled
   * lookback so it reflects the user's real streak
   * regardless of which display window/year is selected.
   */
  const streakLookbackStart = addDays(
    startOfUtcDay(new Date()),
    -STREAK_LOOKBACK_DAYS
  );

  const streakDayGroups = await LearningActivity.aggregate([
    {
      $match: {
        user: userId,
        occurredAt: { $gte: streakLookbackStart },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" },
        },
      },
    },
  ]);

  const activeDateSet = new Set(streakDayGroups.map((d) => d._id));

  const currentStreak = calculateCurrentStreak(activeDateSet);
  const longestStreak = calculateLongestStreak(activeDateSet);

  const todayKey = toDateKey(new Date());
  const hasActivityToday = activeDateSet.has(todayKey);

  const weekAgo = addDays(startOfUtcDay(new Date()), -6);
  const activitiesThisWeek = days
    .filter((d) => new Date(d.date) >= weekAgo)
    .reduce((sum, d) => sum + d.count, 0);

  const message = generateMotivationalMessage({
    currentStreak,
    longestStreak,
    activitiesThisWeek,
    hasActivityToday,
    totalContributions,
  });

  return {
    totalContributions,
    activeDays: activeDaysInWindow,
    currentStreak,
    longestStreak,
    averagePerActiveDay,
    days,
    message,
  };
};

/*
=========================================================
AVAILABLE YEARS

Distinct calendar years (UTC) in which this user has at
least one real activity — used so the year selector never
offers a year with fabricated/empty data.
=========================================================
*/

export const getAvailableYears = async (userId) => {
  const results = await LearningActivity.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { $year: "$occurredAt" },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const years = results.map((r) => r._id);
  const currentYear = new Date().getUTCFullYear();

  if (!years.includes(currentYear)) {
    years.unshift(currentYear);
  }

  return years.sort((a, b) => b - a);
};

export const ROLLING_WINDOW = ROLLING_WINDOW_DAYS;

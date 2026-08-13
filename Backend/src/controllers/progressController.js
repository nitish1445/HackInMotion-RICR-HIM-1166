import StudyPlan from "../models/studyPlanModel.js";
import Goal from "../models/goalModel.js";

export const getProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const goals = await Goal.find({
      user: userId,
    }).lean();

    const studyPlans = await StudyPlan.find({
      user: userId,
    }).lean();

    let lessonsCompleted = 0;
    let totalLessons = 0;
    let studyMinutes = 0;

    const topicStats = {};

    const activityByDate = {};

    /*
    =====================================================
    STUDY PLAN DATA
    =====================================================
    */

    studyPlans.forEach((plan) => {
      if (!Array.isArray(plan.days)) return;

      plan.days.forEach((day) => {
        const date = new Date(day.date);

        const dateKey = date.toISOString().split("T")[0];

        if (!activityByDate[dateKey]) {
          activityByDate[dateKey] = {
            date: dateKey,
            sessions: 0,
            completedSessions: 0,
            minutes: 0,
          };
        }

        if (!Array.isArray(day.sessions)) return;

        day.sessions.forEach((session) => {
          totalLessons += 1;

          const duration =
            parseDuration(session.duration);

          activityByDate[dateKey].sessions += 1;

          activityByDate[dateKey].minutes += duration;

          if (session.completed) {
            lessonsCompleted += 1;

            studyMinutes += duration;

            activityByDate[dateKey].completedSessions += 1;

            /*
             * Topic mastery
             */

            const topic =
              session.topic ||
              session.title ||
              "General";

            if (!topicStats[topic]) {
              topicStats[topic] = {
                completed: 0,
                total: 0,
              };
            }

            topicStats[topic].completed += 1;
            topicStats[topic].total += 1;
          } else {
            const topic =
              session.topic ||
              session.title ||
              "General";

            if (!topicStats[topic]) {
              topicStats[topic] = {
                completed: 0,
                total: 0,
              };
            }

            topicStats[topic].total += 1;
          }
        });
      });
    });

    /*
    =====================================================
    TOPICS MASTERED
    =====================================================
    */

    const mastery = Object.entries(topicStats).map(
      ([name, stats]) => {
        const value =
          stats.total > 0
            ? Math.round(
                (stats.completed /
                  stats.total) *
                  100
              )
            : 0;

        return {
          name,
          value,
          completed: stats.completed,
          total: stats.total,
        };
      }
    );

    const topicsMastered =
      mastery.filter(
        (topic) => topic.value >= 80
      ).length;

    /*
    =====================================================
    STREAK
    =====================================================
    */

    const currentStreak =
      calculateCurrentStreak(
        activityByDate
      );

    const longestStreak =
      calculateLongestStreak(
        activityByDate
      );

    /*
    =====================================================
    WEEKLY ACTIVITY
    =====================================================
    */

    const weeklyActivity =
      getLastSevenDays(
        activityByDate
      );

    /*
    =====================================================
    GOAL SUMMARY
    =====================================================
    */

    const totalGoals = goals.length;

    const completedGoals =
      goals.filter(
        (goal) =>
          Number(goal.progress || 0) >= 100
      ).length;

    const averageProgress =
      totalGoals > 0
        ? Math.round(
            goals.reduce(
              (sum, goal) =>
                sum +
                Number(
                  goal.progress || 0
                ),
              0
            ) / totalGoals
          )
        : 0;

    /*
    =====================================================
    RESPONSE
    =====================================================
    */

    res.status(200).json({
      success: true,

      data: {
        metrics: {
          lessonsCompleted,
          totalLessons,

          topicsMastered,

          studyMinutes,

          currentStreak,
          longestStreak,

          totalGoals,
          completedGoals,

          averageProgress,
        },

        mastery,

        weeklyActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
=========================================================
DURATION PARSER
=========================================================
*/

const parseDuration = (duration) => {
  if (!duration) return 0;

  if (typeof duration === "number") {
    return duration;
  }

  const value = String(duration)
    .toLowerCase()
    .trim();

  /*
   * "45 min"
   */

  const minutesMatch =
    value.match(/(\d+)\s*min/);

  /*
   * "2h 30m"
   */

  const hoursMatch =
    value.match(/(\d+)\s*h/);

  const minuteMatch =
    value.match(/(\d+)\s*m/);

  let minutes = 0;

  if (hoursMatch) {
    minutes +=
      Number(hoursMatch[1]) * 60;
  }

  if (minuteMatch) {
    minutes += Number(
      minuteMatch[1]
    );
  }

  if (
    !hoursMatch &&
    !minuteMatch &&
    minutesMatch
  ) {
    minutes =
      Number(minutesMatch[1]);
  }

  /*
   * If duration is simply "45"
   */

  if (
    minutes === 0 &&
    !Number.isNaN(Number(value))
  ) {
    minutes = Number(value);
  }

  return minutes;
};

/*
=========================================================
CURRENT STREAK
=========================================================
*/

const calculateCurrentStreak = (
  activity
) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  let streak = 0;

  /*
   * Check today first.
   */

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);

    date.setDate(
      today.getDate() - i
    );

    const key =
      date
        .toISOString()
        .split("T")[0];

    const day = activity[key];

    /*
     * At least one completed
     * session = active day.
     */

    if (
      day &&
      day.completedSessions > 0
    ) {
      streak++;
    } else {
      /*
       * If today has no activity,
       * don't immediately break.
       */

      if (i === 0) {
        continue;
      }

      break;
    }
  }

  return streak;
};

/*
=========================================================
LONGEST STREAK
=========================================================
*/

const calculateLongestStreak = (
  activity
) => {
  const dates = Object.keys(
    activity
  )
    .filter(
      (date) =>
        activity[date]
          .completedSessions > 0
    )
    .sort();

  if (!dates.length) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const previous =
      new Date(dates[i - 1]);

    const currentDate =
      new Date(dates[i]);

    const difference =
      Math.round(
        (currentDate -
          previous) /
          (1000 * 60 * 60 * 24)
      );

    if (difference === 1) {
      current++;

      longest = Math.max(
        longest,
        current
      );
    } else {
      current = 1;
    }
  }

  return longest;
};

/*
=========================================================
LAST 7 DAYS
=========================================================
*/

const getLastSevenDays = (
  activity
) => {
  const result = [];

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);

    date.setDate(
      today.getDate() - i
    );

    const key =
      date
        .toISOString()
        .split("T")[0];

    const existing =
      activity[key];

    result.push({
      date: key,

      sessions:
        existing?.sessions || 0,

      completedSessions:
        existing?.completedSessions ||
        0,

      minutes:
        existing?.minutes || 0,
    });
  }

  return result;
};
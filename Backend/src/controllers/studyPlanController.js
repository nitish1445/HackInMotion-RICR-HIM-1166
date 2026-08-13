import StudyPlan from "../models/studyPlanModel.js";
import Goal from "../models/goalModel.js";

/*
=========================================================
HELPERS
=========================================================
*/

const calculateDays = (
  deadline,
) => {
  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  const target =
    new Date(deadline);

  target.setHours(
    0,
    0,
    0,
    0,
  );

  const difference =
    target.getTime() -
    today.getTime();

  return Math.max(
    1,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );
};

const createDate = (
  daysFromToday,
) => {
  const date = new Date();

  date.setHours(
    0,
    0,
    0,
    0,
  );

  date.setDate(
    date.getDate() +
      daysFromToday,
  );

  return date;
};

/*
=========================================================
GENERATE SESSIONS
=========================================================
*/

const generateSessions = (
  goal,
  dayIndex,
  topicsPerDay,
) => {
  const sessions = [];

  const topicNumber = Math.min(
    dayIndex *
      topicsPerDay +
      1,
    goal.totalTopics,
  );

  sessions.push({
    type: "LEARN",

    title: `${goal.title} — Topic ${topicNumber}`,

    topic: `Topic ${topicNumber}`,

    duration:
      Number(goal.hoursPerDay) >= 2
        ? 45
        : 35,

    completed: false,

    completedAt: null,

    link: "",
  });

  if (
    Number(goal.hoursPerDay) >= 1
  ) {
    sessions.push({
      type: "PRACTICE",

      title: `${goal.subject} Practice`,

      topic: `Topic ${topicNumber}`,

      duration: 30,

      completed: false,

      completedAt: null,

      link: "",
    });
  }

  if (
    dayIndex > 0 &&
    dayIndex % 3 === 0
  ) {
    sessions.push({
      type: "TEST",

      title: `${goal.subject} Progress Quiz`,

      topic: `Topics 1-${topicNumber}`,

      duration: 15,

      completed: false,

      completedAt: null,

      link: "",
    });
  }

  if (
    dayIndex > 0 &&
    dayIndex % 5 === 0
  ) {
    sessions.push({
      type: "REVIEW",

      title: `${goal.subject} Revision`,

      topic: "Previous topics",

      duration: 20,

      completed: false,

      completedAt: null,

      link: "",
    });
  }

  return sessions;
};

/*
=========================================================
CREATE PLAN
=========================================================
*/

export const createStudyPlan =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const { goalId } =
        req.params;

      const userId =
        req.user._id;

      const goal =
        await Goal.findOne({
          _id: goalId,

          user: userId,
        });

      if (!goal) {
        const error =
          new Error(
            "Learning goal not found.",
          );

        error.statusCode = 404;

        return next(error);
      }

      const existingPlan =
        await StudyPlan.findOne({
          goal: goal._id,

          user: userId,
        });

      if (existingPlan) {
        return res.status(200).json({
          success: true,

          message:
            "Study plan already exists.",

          data: existingPlan,
        });
      }

      const totalDays =
        calculateDays(
          goal.targetDate,
        );

      const daysToGenerate =
        Math.min(
          totalDays,
          90,
        );

      const topicsPerDay =
        Math.max(
          1,
          Math.ceil(
            goal.totalTopics /
              daysToGenerate,
          ),
        );

      const days = [];

      for (
        let dayIndex = 0;
        dayIndex < daysToGenerate;
        dayIndex++
      ) {
        let dayName;

        if (dayIndex === 0) {
          dayName = "Today";
        } else if (
          dayIndex === 1
        ) {
          dayName = "Tomorrow";
        } else {
          dayName = `Day ${
            dayIndex + 1
          }`;
        }

        days.push({
          day: dayName,

          date:
            createDate(
              dayIndex,
            ),

          sessions:
            generateSessions(
              goal,
              dayIndex,
              topicsPerDay,
            ),
        });
      }

      const studyPlan =
        await StudyPlan.create({
          user: userId,

          goal: goal._id,

          description:
            `Your personalized ${goal.subject} study plan for "${goal.title}".`,

          days,
        });

      return res.status(201).json({
        success: true,

        message:
          "Study plan created successfully.",

        data: studyPlan,
      });
    } catch (error) {
      console.error(
        "CREATE STUDY PLAN ERROR:",
        error,
      );

      next(error);
    }
  };

/*
=========================================================
GET STUDY PLAN
=========================================================
*/

export const getStudyPlan =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const { goalId } =
        req.params;

      const userId =
        req.user._id;

      const goal =
        await Goal.findOne({
          _id: goalId,

          user: userId,
        });

      if (!goal) {
        const error =
          new Error(
            "Learning goal not found.",
          );

        error.statusCode = 404;

        return next(error);
      }

      let studyPlan =
        await StudyPlan.findOne({
          goal: goalId,

          user: userId,
        });

      /*
       * Auto-create if missing
       */

      if (!studyPlan) {
        const totalDays =
          calculateDays(
            goal.targetDate,
          );

        const daysToGenerate =
          Math.min(
            totalDays,
            90,
          );

        const topicsPerDay =
          Math.max(
            1,
            Math.ceil(
              goal.totalTopics /
                daysToGenerate,
            ),
          );

        const days = [];

        for (
          let dayIndex = 0;
          dayIndex <
          daysToGenerate;
          dayIndex++
        ) {
          let dayName;

          if (
            dayIndex === 0
          ) {
            dayName = "Today";
          } else if (
            dayIndex === 1
          ) {
            dayName =
              "Tomorrow";
          } else {
            dayName = `Day ${
              dayIndex + 1
            }`;
          }

          days.push({
            day: dayName,

            date:
              createDate(
                dayIndex,
              ),

            sessions:
              generateSessions(
                goal,
                dayIndex,
                topicsPerDay,
              ),
          });
        }

        studyPlan =
          await StudyPlan.create({
            user: userId,

            goal: goal._id,

            description:
              `Your personalized ${goal.subject} study plan for "${goal.title}".`,

            days,
          });
      }

      /*
       * Days left
       */

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0,
      );

      const deadline =
        new Date(
          goal.targetDate,
        );

      deadline.setHours(
        0,
        0,
        0,
        0,
      );

      const daysLeft =
        Math.max(
          0,
          Math.ceil(
            (deadline - today) /
              (1000 *
                60 *
                60 *
                24),
          ),
        );

      /*
       * Response
       */

      return res.status(200).json({
        success: true,

        data: {
          _id:
            studyPlan._id,

          description:
            studyPlan.description,

          goal: {
            _id: goal._id,

            title:
              goal.title,

            subject:
              goal.subject,

            description:
              goal.description,

            level:
              goal.level,

            hoursPerDay:
              goal.hoursPerDay,

            progress:
              goal.progress,

            completedTopics:
              goal.completedTopics,

            totalTopics:
              goal.totalTopics,

            targetDate:
              goal.targetDate,

            daysLeft,

            status:
              goal.status,
          },

          days:
            studyPlan.days,
        },
      });
    } catch (error) {
      console.error(
        "GET STUDY PLAN ERROR:",
        error,
      );

      next(error);
    }
  };

export const getMyStudyPlan =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const userId = req.user._id;

      const goal = await Goal.findOne({
        user: userId,
      }).sort({
        createdAt: -1,
      });

      if (!goal) {
        const error = new Error(
          "Learning goal not found.",
        );

        error.statusCode = 404;

        return next(error);
      }

      let studyPlan = await StudyPlan.findOne({
        goal: goal._id,
        user: userId,
      });

      if (!studyPlan) {
        const totalDays = calculateDays(
          goal.targetDate,
        );

        const daysToGenerate = Math.min(
          totalDays,
          90,
        );

        const topicsPerDay = Math.max(
          1,
          Math.ceil(
            goal.totalTopics /
              daysToGenerate,
          ),
        );

        const days = [];

        for (
          let dayIndex = 0;
          dayIndex < daysToGenerate;
          dayIndex++
        ) {
          let dayName;

          if (dayIndex === 0) {
            dayName = "Today";
          } else if (dayIndex === 1) {
            dayName = "Tomorrow";
          } else {
            dayName = `Day ${dayIndex + 1}`;
          }

          days.push({
            day: dayName,
            date: createDate(dayIndex),
            sessions: generateSessions(
              goal,
              dayIndex,
              topicsPerDay,
            ),
          });
        }

        studyPlan = await StudyPlan.create({
          user: userId,
          goal: goal._id,
          description:
            `Your personalized ${goal.subject} study plan for "${goal.title}".`,
          days,
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadline = new Date(goal.targetDate);
      deadline.setHours(0, 0, 0, 0);

      const daysLeft = Math.max(
        0,
        Math.ceil(
          (deadline - today) /
            (1000 * 60 * 60 * 24),
        ),
      );

      return res.status(200).json({
        success: true,
        data: {
          goal: {
            _id: goal._id,
            title: goal.title,
            subject: goal.subject,
            level: goal.level,
            hoursPerDay: goal.hoursPerDay,
            progress: goal.progress,
            completedTopics: goal.completedTopics,
            totalTopics: goal.totalTopics,
            daysLeft,
            status: goal.status,
            deadline: goal.targetDate,
          },
          studyPlan: {
            _id: studyPlan._id,
            description: studyPlan.description,
            days: studyPlan.days,
          },
        },
      });
    } catch (error) {
      console.error(
        "GET MY STUDY PLAN ERROR:",
        error,
      );

      next(error);
    }
  };

/*
=========================================================
UPDATE SESSION
=========================================================
*/

export const updateSession =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const {
        goalId,
        sessionId,
      } = req.params;

      const {
        completed,
      } = req.body;

      const userId =
        req.user._id;

      if (
        typeof completed !==
        "boolean"
      ) {
        const error =
          new Error(
            "Completed must be true or false.",
          );

        error.statusCode = 400;

        return next(error);
      }

      const goal =
        await Goal.findOne({
          _id: goalId,

          user: userId,
        });

      if (!goal) {
        const error =
          new Error(
            "Learning goal not found.",
          );

        error.statusCode = 404;

        return next(error);
      }

      const studyPlan =
        await StudyPlan.findOne({
          goal: goalId,

          user: userId,
        });

      if (!studyPlan) {
        const error =
          new Error(
            "Study plan not found.",
          );

        error.statusCode = 404;

        return next(error);
      }

      let targetSession =
        null;

      for (const day of studyPlan.days) {
        const session =
          day.sessions.id(
            sessionId,
          );

        if (session) {
          targetSession =
            session;

          break;
        }
      }

      if (!targetSession) {
        const error =
          new Error(
            "Study session not found.",
          );

        error.statusCode = 404;

        return next(error);
      }

      /*
       * Update session
       */

      targetSession.completed =
        completed;

      targetSession.completedAt =
        completed
          ? new Date()
          : null;

      await studyPlan.save();

      /*
       * Calculate progress
       */

      const allSessions =
        studyPlan.days.flatMap(
          (day) =>
            day.sessions,
        );

      const completedSessions =
        allSessions.filter(
          (session) =>
            session.completed,
        ).length;

      const totalSessions =
        allSessions.length;

      const completedTopics =
        Math.min(
          goal.totalTopics,

          Math.round(
            (completedSessions /
              Math.max(
                1,
                totalSessions,
              )) *
              goal.totalTopics,
          ),
        );

      goal.completedTopics =
        completedTopics;

      await goal.save();

      return res.status(200).json({
        success: true,

        message: completed
          ? "Session completed successfully."
          : "Session marked incomplete.",

        data: {
          sessionId,

          completed,

          goal: {
            progress:
              goal.progress,

            completedTopics:
              goal.completedTopics,

            totalTopics:
              goal.totalTopics,

            status:
              goal.status,
          },
        },
      });
    } catch (error) {
      console.error(
        "UPDATE SESSION ERROR:",
        error,
      );

      next(error);
    }
  };

export const updateMySession =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const { sessionId } = req.params;
      const { completed } = req.body;
      const userId = req.user._id;

      if (typeof completed !== "boolean") {
        const error = new Error(
          "Completed must be true or false.",
        );

        error.statusCode = 400;

        return next(error);
      }

      const goal = await Goal.findOne({
        user: userId,
      }).sort({
        createdAt: -1,
      });

      if (!goal) {
        const error = new Error(
          "Learning goal not found.",
        );

        error.statusCode = 404;

        return next(error);
      }

      const studyPlan = await StudyPlan.findOne({
        goal: goal._id,
        user: userId,
      });

      if (!studyPlan) {
        const error = new Error(
          "Study plan not found.",
        );

        error.statusCode = 404;

        return next(error);
      }

      let targetSession = null;

      for (const day of studyPlan.days) {
        const session = day.sessions.id(sessionId);

        if (session) {
          targetSession = session;
          break;
        }
      }

      if (!targetSession) {
        const error = new Error(
          "Study session not found.",
        );

        error.statusCode = 404;

        return next(error);
      }

      targetSession.completed = completed;
      targetSession.completedAt = completed
        ? new Date()
        : null;

      await studyPlan.save();

      const allSessions = studyPlan.days.flatMap(
        (day) => day.sessions,
      );

      const completedSessions = allSessions.filter(
        (session) => session.completed,
      ).length;

      const totalSessions = allSessions.length;

      goal.completedTopics = Math.min(
        goal.totalTopics,
        Math.round(
          (completedSessions /
            Math.max(1, totalSessions)) *
            goal.totalTopics,
        ),
      );

      await goal.save();

      return res.status(200).json({
        success: true,
        message: completed
          ? "Session completed successfully."
          : "Session marked incomplete.",
        data: {
          sessionId,
          completed,
          goal: {
            progress: goal.progress,
            completedTopics: goal.completedTopics,
            totalTopics: goal.totalTopics,
            status: goal.status,
          },
        },
      });
    } catch (error) {
      console.error(
        "UPDATE MY SESSION ERROR:",
        error,
      );

      next(error);
    }
  };

/*
=========================================================
REGENERATE
=========================================================
*/

export const regenerateStudyPlan =
  async (
    req,
    res,
    next,
  ) => {
    try {
      const { goalId } =
        req.params;

      const userId =
        req.user._id;

      const goal =
        await Goal.findOne({
          _id: goalId,

          user: userId,
        });

      if (!goal) {
        const error =
          new Error(
            "Learning goal not found.",
          );

        error.statusCode = 404;

        return next(error);
      }

      await StudyPlan.deleteOne({
        goal: goalId,

        user: userId,
      });

      const totalDays =
        calculateDays(
          goal.targetDate,
        );

      const daysToGenerate =
        Math.min(
          totalDays,
          90,
        );

      const topicsPerDay =
        Math.max(
          1,
          Math.ceil(
            goal.totalTopics /
              daysToGenerate,
          ),
        );

      const days = [];

      for (
        let dayIndex = 0;
        dayIndex <
        daysToGenerate;
        dayIndex++
      ) {
        let dayName;

        if (
          dayIndex === 0
        ) {
          dayName = "Today";
        } else if (
          dayIndex === 1
        ) {
          dayName =
            "Tomorrow";
        } else {
          dayName = `Day ${
            dayIndex + 1
          }`;
        }

        days.push({
          day: dayName,

          date:
            createDate(
              dayIndex,
            ),

          sessions:
            generateSessions(
              goal,
              dayIndex,
              topicsPerDay,
            ),
        });
      }

      const newPlan =
        await StudyPlan.create({
          user: userId,

          goal: goal._id,

          description:
            `Your regenerated ${goal.subject} study plan.`,

          days,
        });

      return res.status(201).json({
        success: true,

        message:
          "Study plan regenerated successfully.",

        data: newPlan,
      });
    } catch (error) {
      console.error(
        "REGENERATE STUDY PLAN ERROR:",
        error,
      );

      next(error);
    }
  };
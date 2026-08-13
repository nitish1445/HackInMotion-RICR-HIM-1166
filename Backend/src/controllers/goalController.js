import Goal from "../models/goalModel.js";
import StudyPlan from "../models/studyPlanModel.js";

/*
=========================================================
HELPERS
=========================================================
*/

/*
 * Calculate number of days from today to target date
 */
const calculateDays = (deadline) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);

  const difference =
    target.getTime() - today.getTime();

  return Math.max(
    1,
    Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    ) + 1
  );
};

/*
 * Create date without time issues
 */
const createDate = (daysFromToday) => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  date.setDate(
    date.getDate() + daysFromToday
  );

  return date;
};

/*
 * Generate study sessions for one day
 */
const generateSessions = (
  goal,
  dayIndex,
  topicsPerDay
) => {
  const sessions = [];

  /*
   * Calculate topic number
   */
  const baseTopicNumber =
    dayIndex * topicsPerDay + 1;

  const topicNumber = Math.min(
    baseTopicNumber,
    goal.totalTopics
  );

  /*
   * LEARN SESSION
   */
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

  /*
   * PRACTICE SESSION
   */
  if (Number(goal.hoursPerDay) >= 1) {
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

  /*
   * TEST SESSION
   * Every 3rd day
   */
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

  /*
   * REVIEW SESSION
   * Every 5th day
   */
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
GENERATE STUDY PLAN
=========================================================
*/

const generateStudyPlan = async (goal) => {
  /*
   * Calculate available days
   */
  const totalDays = calculateDays(
    goal.targetDate
  );

  /*
   * Maximum 90 days
   */
  const daysToGenerate = Math.min(
    totalDays,
    90
  );

  /*
   * Topics per day
   */
  const topicsPerDay = Math.max(
    1,
    Math.ceil(
      goal.totalTopics /
        daysToGenerate
    )
  );

  const days = [];

  /*
   * Generate every day
   */
  for (
    let dayIndex = 0;
    dayIndex < daysToGenerate;
    dayIndex++
  ) {
    const date =
      createDate(dayIndex);

    let dayName;

    if (dayIndex === 0) {
      dayName = "Today";
    } else if (dayIndex === 1) {
      dayName = "Tomorrow";
    } else {
      dayName = `Day ${dayIndex + 1}`;
    }

    const sessions =
      generateSessions(
        goal,
        dayIndex,
        topicsPerDay
      );

    days.push({
      day: dayName,

      date,

      sessions,
    });
  }

  /*
   * Create study plan
   */
  return await StudyPlan.create({
    user: goal.user,

    goal: goal._id,

    description:
      `Your personalized ${goal.subject} study plan for "${goal.title}".`,

    days,
  });
};

/*
=========================================================
CREATE GOAL
=========================================================
*/

export const createGoal = async (
  req,
  res
) => {
  try {
    /*
     * Make sure user exists
     */
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const {
      title,
      subject,
      level,
      description,
      hoursPerDay,
      totalTopics,
      targetDate,
    } = req.body;

    /*
     * Required fields
     */
    if (
      !title ||
      !subject ||
      !totalTopics ||
      !targetDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, subject, total topics and target date are required.",
      });
    }

    /*
     * Clean values
     */
    const cleanTitle =
      String(title).trim();

    const cleanSubject =
      String(subject).trim();

    const cleanDescription =
      description
        ? String(description).trim()
        : "";

    /*
     * Validate title
     */
    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message:
          "Goal title cannot be empty.",
      });
    }

    /*
     * Validate subject
     */
    if (!cleanSubject) {
      return res.status(400).json({
        success: false,
        message:
          "Subject cannot be empty.",
      });
    }

    /*
     * Validate topics
     */
    const topics =
      Number(totalTopics);

    if (
      !Number.isFinite(topics) ||
      topics < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total topics must be at least 1.",
      });
    }

    /*
     * Validate hours
     */
    const dailyHours =
      Number(hoursPerDay) || 1;

    if (
      !Number.isFinite(dailyHours) ||
      dailyHours < 0.5 ||
      dailyHours > 24
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Available study time must be between 0.5 and 24 hours.",
      });
    }

    /*
     * Validate level
     */
    const allowedLevels = [
      "Beginner",
      "Intermediate",
      "Advanced",
    ];

    const selectedLevel =
      allowedLevels.includes(level)
        ? level
        : "Beginner";

    /*
     * Validate target date
     */
    const deadline =
      new Date(targetDate);

    if (
      Number.isNaN(
        deadline.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid target date.",
      });
    }

    /*
     * Remove time
     */
    deadline.setHours(
      23,
      59,
      59,
      999
    );

    /*
     * Check past date
     */
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    if (deadline < today) {
      return res.status(400).json({
        success: false,
        message:
          "Target date cannot be in the past.",
      });
    }

    /*
     * Create goal
     */
    const goal =
      await Goal.create({
        user: req.user._id,

        title: cleanTitle,

        subject: cleanSubject,

        description:
          cleanDescription,

        level: selectedLevel,

        hoursPerDay:
          dailyHours,

        totalTopics:
          topics,

        completedTopics: 0,

        progress: 0,

        targetDate: deadline,

        status: "active",
      });

    /*
     * Generate study plan
     *
     * If this fails, goal should still
     * remain created.
     */
    let studyPlan = null;

    try {
      studyPlan =
        await generateStudyPlan(
          goal
        );
    } catch (planError) {
      console.error(
        "Study plan generation error:",
        planError
      );
    }

    /*
     * Calculate days left
     */
    const todayStart =
      new Date();

    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    const deadlineStart =
      new Date(
        goal.targetDate
      );

    deadlineStart.setHours(
      0,
      0,
      0,
      0
    );

    const daysLeft =
      Math.max(
        0,
        Math.ceil(
          (deadlineStart -
            todayStart) /
            (1000 *
              60 *
              60 *
              24)
        )
      );

    /*
     * Response
     */
    return res.status(201).json({
      success: true,

      message:
        "Learning goal created successfully.",

      data: {
        goal: {
          ...goal.toObject(),

          daysLeft,
        },

        studyPlan,
      },
    });
  } catch (error) {
    console.error(
      "CREATE GOAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create learning goal.",
    });
  }
};

/*
=========================================================
GET ALL GOALS
=========================================================
*/

export const getGoals = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const goals =
      await Goal.find({
        user: req.user._id,
      }).sort({
        createdAt: -1,
      });

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const formattedGoals =
      goals.map((goal) => {
        const deadline =
          new Date(
            goal.targetDate
          );

        deadline.setHours(
          0,
          0,
          0,
          0
        );

        const daysLeft =
          Math.max(
            0,
            Math.ceil(
              (deadline -
                today) /
                (1000 *
                  60 *
                  60 *
                  24)
            )
          );

        return {
          ...goal.toObject(),

          daysLeft,

          completedTopics:
            goal.completedTopics || 0,

          progress:
            goal.progress || 0,
        };
      });

    return res.status(200).json({
      success: true,

      count:
        formattedGoals.length,

      data: formattedGoals,
    });
  } catch (error) {
    console.error(
      "GET GOALS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch goals.",
    });
  }
};

/*
=========================================================
GET SINGLE GOAL
=========================================================
*/

export const getGoalById = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const goal =
      await Goal.findOne({
        _id: req.params.goalId,

        user: req.user._id,
      });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message:
          "Learning goal not found.",
      });
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const deadline =
      new Date(
        goal.targetDate
      );

    deadline.setHours(
      0,
      0,
      0,
      0
    );

    const daysLeft =
      Math.max(
        0,
        Math.ceil(
          (deadline -
            today) /
            (1000 *
              60 *
              60 *
              24)
        )
      );

    return res.status(200).json({
      success: true,

      data: {
        ...goal.toObject(),

        daysLeft,
      },
    });
  } catch (error) {
    console.error(
      "GET GOAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch goal.",
    });
  }
};

/*
=========================================================
UPDATE GOAL
=========================================================
*/

export const updateGoal = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const goal =
      await Goal.findOne({
        _id: req.params.goalId,

        user: req.user._id,
      });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message:
          "Learning goal not found.",
      });
    }

    const {
      title,
      subject,
      description,
      level,
      hoursPerDay,
      totalTopics,
      targetDate,
    } = req.body;

    /*
     * TITLE
     */
    if (title !== undefined) {
      const cleanTitle =
        String(title).trim();

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Goal title cannot be empty.",
        });
      }

      goal.title =
        cleanTitle;
    }

    /*
     * SUBJECT
     */
    if (subject !== undefined) {
      const cleanSubject =
        String(subject).trim();

      if (!cleanSubject) {
        return res.status(400).json({
          success: false,
          message:
            "Subject cannot be empty.",
        });
      }

      goal.subject =
        cleanSubject;
    }

    /*
     * DESCRIPTION
     */
    if (
      description !== undefined
    ) {
      goal.description =
        String(
          description || ""
        ).trim();
    }

    /*
     * LEVEL
     */
    if (level !== undefined) {
      const allowedLevels = [
        "Beginner",
        "Intermediate",
        "Advanced",
      ];

      if (
        !allowedLevels.includes(
          level
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid difficulty level.",
        });
      }

      goal.level =
        level;
    }

    /*
     * HOURS PER DAY
     */
    if (
      hoursPerDay !== undefined
    ) {
      const hours =
        Number(hoursPerDay);

      if (
        !Number.isFinite(hours) ||
        hours < 0.5 ||
        hours > 24
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Hours per day must be between 0.5 and 24.",
        });
      }

      goal.hoursPerDay =
        hours;
    }

    /*
     * TOTAL TOPICS
     */
    if (
      totalTopics !== undefined
    ) {
      const topics =
        Number(totalTopics);

      if (
        !Number.isFinite(topics) ||
        topics < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Total topics must be at least 1.",
        });
      }

      goal.totalTopics =
        topics;

      if (
        goal.completedTopics >
        topics
      ) {
        goal.completedTopics =
          topics;
      }
    }

    /*
     * TARGET DATE
     */
    if (
      targetDate !== undefined
    ) {
      const deadline =
        new Date(targetDate);

      if (
        Number.isNaN(
          deadline.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid target date.",
        });
      }

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      if (
        deadline < today
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Target date cannot be in the past.",
        });
      }

      goal.targetDate =
        deadline;
    }

    /*
     * Save goal
     */
    await goal.save();

    /*
     * Delete old study plan
     */
    await StudyPlan.deleteOne({
      goal: goal._id,

      user: req.user._id,
    });

    /*
     * Generate new study plan
     */
    let studyPlan = null;

    try {
      studyPlan =
        await generateStudyPlan(
          goal
        );
    } catch (planError) {
      console.error(
        "Study plan regeneration error:",
        planError
      );
    }

    /*
     * Calculate days left
     */
    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const deadline =
      new Date(
        goal.targetDate
      );

    deadline.setHours(
      0,
      0,
      0,
      0
    );

    const daysLeft =
      Math.max(
        0,
        Math.ceil(
          (deadline -
            today) /
            (1000 *
              60 *
              60 *
              24)
        )
      );

    return res.status(200).json({
      success: true,

      message:
        "Learning goal updated successfully.",

      data: {
        goal: {
          ...goal.toObject(),

          daysLeft,
        },

        studyPlan,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE GOAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update goal.",
    });
  }
};

/*
=========================================================
DELETE GOAL
=========================================================
*/

export const deleteGoal = async (
  req,
  res
) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const goal =
      await Goal.findOneAndDelete({
        _id: req.params.goalId,

        user: req.user._id,
      });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message:
          "Learning goal not found.",
      });
    }

    /*
     * Delete related study plan
     */
    await StudyPlan.deleteOne({
      goal: goal._id,

      user: req.user._id,
    });

    return res.status(200).json({
      success: true,

      message:
        "Learning goal deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE GOAL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete goal.",
    });
  }
};
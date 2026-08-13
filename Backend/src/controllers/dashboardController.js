import Dashboard from "../models/dashboardModel.js";
import User from "../models/userModel.js";

/*
|--------------------------------------------------------------------------
| Helper: Get or create dashboard
|--------------------------------------------------------------------------
*/

const getOrCreateDashboard = async (userId) => {
  let dashboard = await Dashboard.findOne({
    user: userId,
  });

  if (!dashboard) {
    dashboard = await Dashboard.create({
      user: userId,
      studyHours: 0,

      activeGoal: {
        title: "",
        subject: "",
        progress: 0,
        daysLeft: 0,
        completedTopics: 0,
        totalTopics: 0,
      },

      today: [],

      achievements: [],
    });
  }

  return dashboard;
};

/*
|--------------------------------------------------------------------------
| Helper: Calculate dashboard values
|--------------------------------------------------------------------------
*/

const calculateProgress = (dashboard) => {
  const tasks = dashboard.today || [];

  if (tasks.length === 0) {
    return dashboard.activeGoal?.progress || 0;
  }

  const totalProgress = tasks.reduce(
    (sum, task) => sum + Number(task.progress || 0),
    0
  );

  return Math.round(totalProgress / tasks.length);
};

const calculateTodayProgress = (dashboard) => {
  const tasks = dashboard.today || [];

  if (tasks.length === 0) {
    return 0;
  }

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return Math.round((completedTasks / tasks.length) * 100);
};

/*
|--------------------------------------------------------------------------
| Helper: Dynamic recommendation
|--------------------------------------------------------------------------
*/

const generateRecommendation = (dashboard) => {
  const tasks = dashboard.today || [];

  const incompleteTasks = tasks.filter(
    (task) => !task.completed
  );

  const practiceTasks = tasks.filter(
    (task) =>
      task.type === "PRACTICE" &&
      !task.completed
  );

  if (!dashboard.activeGoal?.title) {
    return {
      title: "Create your first learning goal",
      description:
        "Set a clear learning goal to start building your personalized study path.",
    };
  }

  if (tasks.length === 0) {
    return {
      title: "Plan your learning session",
      description:
        "Add a few learning tasks to your study plan so you can track your progress.",
    };
  }

  if (practiceTasks.length > 0) {
    return {
      title: "Focus on practice today",
      description:
        "You still have practice tasks remaining. Completing them will strengthen your understanding.",
    };
  }

  if (incompleteTasks.length > 0) {
    const nextTask = incompleteTasks[0];

    return {
      title: `Continue with ${nextTask.title}`,
      description:
        "You have unfinished learning tasks today. Complete the next one to maintain your momentum.",
    };
  }

  return {
    title: "Great work today!",
    description:
      "You completed today's learning plan. Keep the momentum going and continue working toward your goal.",
  };
};

/*
|--------------------------------------------------------------------------
| GET DASHBOARD OVERVIEW
|--------------------------------------------------------------------------
*/

export const getDashboardOverview = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const dashboard =
      await getOrCreateDashboard(userId);

    const tasks = dashboard.today || [];

    const completedTasks = tasks.filter(
      (task) => task.completed
    ).length;

    const totalTasks = tasks.length;

    const progress =
      dashboard.activeGoal?.progress > 0
        ? dashboard.activeGoal.progress
        : calculateProgress(dashboard);

    const todayProgress =
      calculateTodayProgress(dashboard);

    const recommendation =
      generateRecommendation(dashboard);

    res.status(200).json({
      success: true,

      data: {
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          profileImage: req.user.profileImage,
        },

        progress,

        streak: req.user.streak || 0,

        points: req.user.points || 0,

        studyHours: dashboard.studyHours || 0,

        todayProgress,

        completedTasks,

        totalTasks,

        activeGoal: dashboard.activeGoal,

        today: tasks,

        recommendation,

        achievements:
          dashboard.achievements || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CREATE / UPDATE ACTIVE GOAL
|--------------------------------------------------------------------------
*/

export const updateActiveGoal = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const {
      title,
      subject,
      daysLeft,
      totalTopics,
    } = req.body;

    if (!title || !subject) {
      const error = new Error(
        "Goal title and subject are required."
      );

      error.statusCode = 400;

      return next(error);
    }

    const dashboard =
      await getOrCreateDashboard(userId);

    dashboard.activeGoal = {
      title: title.trim(),

      subject: subject.trim(),

      progress: 0,

      daysLeft: Math.max(
        0,
        Number(daysLeft) || 0
      ),

      completedTopics: 0,

      totalTopics: Math.max(
        0,
        Number(totalTopics) || 0
      ),
    };

    await dashboard.save();

    res.status(200).json({
      success: true,

      message: "Learning goal updated successfully.",

      data: dashboard.activeGoal,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADD TODAY TASK
|--------------------------------------------------------------------------
*/

export const addTask = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const {
      type,
      title,
      duration,
    } = req.body;

    if (!title) {
      const error = new Error(
        "Task title is required."
      );

      error.statusCode = 400;

      return next(error);
    }

    const dashboard =
      await getOrCreateDashboard(userId);

    dashboard.today.push({
      type: type || "LEARN",

      title: title.trim(),

      duration:
        duration || "30 min",

      progress: 0,

      completed: false,

      date: new Date(),
    });

    await dashboard.save();

    const task =
      dashboard.today[
        dashboard.today.length - 1
      ];

    res.status(201).json({
      success: true,

      message: "Task added successfully.",

      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TASK
|--------------------------------------------------------------------------
*/

export const updateTask = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const { taskId } = req.params;

    const {
      progress,
      completed,
    } = req.body;

    const dashboard =
      await getOrCreateDashboard(userId);

    const task =
      dashboard.today.id(taskId);

    if (!task) {
      const error = new Error(
        "Task not found."
      );

      error.statusCode = 404;

      return next(error);
    }

    const wasCompleted =
      task.completed;

    if (progress !== undefined) {
      task.progress = Math.min(
        100,
        Math.max(
          0,
          Number(progress)
        )
      );
    }

    if (completed !== undefined) {
      task.completed = Boolean(
        completed
      );
    }

    if (task.progress === 100) {
      task.completed = true;
    }

    if (task.completed) {
      task.progress = 100;
    }

    /*
     * Give points only when task changes
     * from incomplete → completed.
     */
    if (
      !wasCompleted &&
      task.completed
    ) {
      await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            points: 10,
          },
        }
      );
    }

    /*
     * Recalculate goal progress
     */
    const totalTasks =
      dashboard.today.length;

    if (totalTasks > 0) {
      const totalProgress =
        dashboard.today.reduce(
          (sum, item) =>
            sum +
            Number(
              item.progress || 0
            ),
          0
        );

      dashboard.activeGoal.progress =
        Math.round(
          totalProgress /
            totalTasks
        );
    }

    /*
     * Completed topics
     */
    dashboard.activeGoal.completedTopics =
      dashboard.today.filter(
        (item) =>
          item.completed
      ).length;

    await dashboard.save();

    const updatedUser =
      await User.findById(userId);

    res.status(200).json({
      success: true,

      message:
        "Task updated successfully.",

      data: {
        task,

        progress:
          dashboard.activeGoal
            .progress,

        points:
          updatedUser.points,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE STUDY HOURS
|--------------------------------------------------------------------------
*/

export const updateStudyHours = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const { hours } = req.body;

    const numericHours =
      Number(hours);

    if (
      Number.isNaN(
        numericHours
      ) ||
      numericHours < 0
    ) {
      const error = new Error(
        "Valid study hours are required."
      );

      error.statusCode = 400;

      return next(error);
    }

    const dashboard =
      await getOrCreateDashboard(userId);

    dashboard.studyHours =
      numericHours;

    await dashboard.save();

    res.status(200).json({
      success: true,

      message:
        "Study hours updated successfully.",

      data: {
        studyHours:
          dashboard.studyHours,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| ADD ACHIEVEMENT
|--------------------------------------------------------------------------
*/

export const addAchievement = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const {
      icon,
      title,
      description,
    } = req.body;

    if (!title) {
      const error = new Error(
        "Achievement title is required."
      );

      error.statusCode = 400;

      return next(error);
    }

    const dashboard =
      await getOrCreateDashboard(userId);

    dashboard.achievements.unshift({
      icon: icon || "🏆",

      title: title.trim(),

      description:
        description || "",
    });

    /*
     * Keep only latest 6 achievements
     */
    dashboard.achievements =
      dashboard.achievements.slice(
        0,
        6
      );

    await dashboard.save();

    res.status(201).json({
      success: true,

      message:
        "Achievement added successfully.",

      data:
        dashboard.achievements[0],
    });
  } catch (error) {
    next(error);
  }
};
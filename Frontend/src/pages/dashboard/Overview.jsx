import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaFire,
  FaRobot,
  FaTrophy,
  FaTable,
  FaChartLine,
  FaPlay,
  FaBullseye,
  FaChevronRight,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext.jsx";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4500";

/* ============================================================
   DASHBOARD API
============================================================ */

const getDashboard = async () => {
  const response = await fetch(
    `${API_URL}/dashboard/overview`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load dashboard."
    );
  }

  return data.data;
};

/* ============================================================
   UPDATE TASK API
============================================================ */

const updateTaskApi = async (
  taskId,
  payload
) => {
  const response = await fetch(
    `${API_URL}/dashboard/tasks/${taskId}`,
    {
      method: "PATCH",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(
        payload
      ),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update task."
    );
  }

  return data.data;
};

/* ============================================================
   COMPONENT
============================================================ */

const DashboardOverview = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingTask, setUpdatingTask] =
    useState(null);

  /* ==========================================================
     FETCH DASHBOARD
  ========================================================== */

  const fetchDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getDashboard();

        setDashboard(data);
      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        );

        setError(
          err.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* ==========================================================
     COMPLETE TASK
  ========================================================== */

  const handleTaskComplete =
    async (task) => {
      if (task.completed) {
        return;
      }

      try {
        setUpdatingTask(
          task._id
        );

        const result =
          await updateTaskApi(
            task._id,
            {
              completed: true,
              progress: 100,
            }
          );

        setDashboard(
          (previous) => {
            if (!previous) {
              return previous;
            }

            const updatedTasks =
              previous.today.map(
                (item) =>
                  item._id === task._id
                    ? {
                        ...item,
                        completed:
                          true,
                        progress:
                          100,
                      }
                    : item
              );

            const completedTasks =
              updatedTasks.filter(
                (item) =>
                  item.completed
              ).length;

            const todayProgress =
              updatedTasks.length
                ? Math.round(
                    (completedTasks /
                      updatedTasks.length) *
                      100
                  )
                : 0;

            return {
              ...previous,

              today:
                updatedTasks,

              completedTasks,

              todayProgress,

              progress:
                result.progress ??
                previous.progress,

              points:
                result.points ??
                previous.points,

              activeGoal: {
                ...previous.activeGoal,

                progress:
                  result.progress ??
                  previous
                    .activeGoal
                    ?.progress,

                completedTopics:
                  completedTasks,
              },
            };
          }
        );
      } catch (err) {
        console.error(
          "Task update error:",
          err
        );

        setError(
          err.message ||
            "Unable to update task."
        );
      } finally {
        setUpdatingTask(
          null
        );
      }
    };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <DashboardSkeleton />
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
            <FaExclamationTriangle />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-ink-light dark:text-ink-dark">
            Unable to load dashboard
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-light dark:text-muted-dark">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-primary-600"
          >
            Try again
            <FaArrowRight size={9} />
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     SAFETY
  ========================================================== */

  if (!dashboard) {
    return null;
  }

  const firstName =
    dashboard.user?.fullName
      ?.split(" ")[0] ||
    user?.fullName?.split(
      " "
    )[0] ||
    "Learner";

  const today =
    dashboard.today || [];

  const achievements =
    dashboard.achievements ||
    [];

  const activeGoal =
    dashboard.activeGoal || {
      title: "",
      subject: "",
      progress: 0,
      daysLeft: 0,
      completedTopics: 0,
      totalTopics: 0,
    };

  const recommendation =
    dashboard.recommendation || {
      title:
        "Keep learning consistently",
      description:
        "Continue your learning plan.",
    };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="mb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
              Learning workspace
            </p>

            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
              Welcome back,{" "}
              <span className="text-primary-500">
                {firstName}
              </span>
              .
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-light dark:text-muted-dark">
              Your personalized learning
              path is ready. Here's what
              you should focus on today.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/dashboard/study-plan"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-100 bg-white px-4 py-2.5 text-xs font-medium text-primary-600 shadow-soft hover:bg-primary-50 dark:border-white/5 dark:bg-panel-dark dark:text-primary-300"
            >
              <FaBookOpen size={11} />
              Study plan
            </Link>

            <Link
              to="/dashboard/goals/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white shadow-soft hover:bg-primary-600"
            >
              <FaTable size={11} />
              New learning goal
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={
            <FaChartLine
              size={12}
            />
          }
          label="Overall progress"
          value={`${dashboard.progress || 0}%`}
          helper="Learning progress"
        />

        <Stat
          icon={
            <FaFire size={12} />
          }
          label="Current streak"
          value={`${dashboard.streak || 0} days`}
          helper="Keep it going"
        />

        <Stat
          icon={
            <FaClock size={12} />
          }
          label="Study time"
          value={`${dashboard.studyHours || 0}h`}
          helper="Total tracked"
        />

        <Stat
          icon={
            <FaTrophy
              size={12}
            />
          }
          label="Points earned"
          value={
            dashboard.points || 0
          }
          helper="Learning points"
        />
      </section>

      {/* =====================================================
          TODAY SUMMARY
      ===================================================== */}

      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
              <div className="text-center">
                <p className="font-mono text-sm font-semibold text-primary-500">
                  {dashboard.todayProgress ||
                    0}
                  %
                </p>

                <p className="text-[7px] uppercase text-primary-400">
                  today
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
                Today's progress
              </p>

              <h2 className="mt-1 text-base font-semibold text-ink-light dark:text-ink-dark">
                {dashboard.completedTasks ||
                  0}{" "}
                of{" "}
                {dashboard.totalTasks ||
                  0}{" "}
                tasks completed
              </h2>

              <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
                Complete today's plan to
                keep your learning momentum.
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/study-plan"
            className="inline-flex items-center gap-2 text-xs font-medium text-primary-600 hover:underline dark:text-primary-300"
          >
            Continue today's plan
            <FaArrowRight size={9} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ===================================================
            TODAY'S PLAN
        =================================================== */}

        <section className="rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">
          <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4 dark:border-white/5 sm:px-6">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
                Today's plan
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                Pick up where you left off
              </h2>
            </div>

            <Link
              to="/dashboard/study-plan"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline dark:text-primary-300"
            >
              Full plan
              <FaArrowRight size={9} />
            </Link>
          </div>

          {today.length === 0 ? (
            <EmptyTasks />
          ) : (
            <div className="divide-y divide-primary-100 dark:divide-white/5">
              {today.map(
                (item, index) => (
                  <TaskItem
                    key={item._id}
                    item={item}
                    index={index}
                    updating={
                      updatingTask ===
                      item._id
                    }
                    onComplete={
                      handleTaskComplete
                    }
                  />
                )
              )}
            </div>
          )}
        </section>

        {/* ===================================================
            ACTIVE GOAL
        =================================================== */}

        <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
                Active goal
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                Current path
              </h2>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaBullseye
                size={13}
              />
            </div>
          </div>

          {!activeGoal.title ? (
            <div className="py-8 text-center">
              <FaBullseye
                size={20}
                className="mx-auto text-primary-300"
              />

              <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                No active learning goal
                yet.
              </p>

              <Link
                to="/dashboard/goals/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white"
              >
                Create goal
                <FaArrowRight
                  size={9}
                />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                  {activeGoal.subject}
                </span>

                <h3 className="mt-2 text-sm font-semibold leading-5 text-ink-light dark:text-ink-dark">
                  {activeGoal.title}
                </h3>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-light dark:text-muted-dark">
                      Progress
                    </span>

                    <span className="font-mono text-primary-500">
                      {activeGoal.progress ||
                        0}
                      %
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            activeGoal.progress ||
                              0
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-primary-50/70 p-3 dark:bg-white/3">
                    <p className="text-[9px] text-muted-light dark:text-muted-dark">
                      Topics
                    </p>

                    <p className="mt-1 font-mono text-sm font-semibold text-ink-light dark:text-ink-dark">
                      {activeGoal.completedTopics ||
                        0}
                      /
                      {activeGoal.totalTopics ||
                        0}
                    </p>
                  </div>

                  <div className="rounded-lg bg-primary-50/70 p-3 dark:bg-white/3">
                    <p className="text-[9px] text-muted-light dark:text-muted-dark">
                      Remaining
                    </p>

                    <p className="mt-1 font-mono text-sm font-semibold text-ink-light dark:text-ink-dark">
                      {activeGoal.daysLeft ||
                        0}{" "}
                      days
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[10px] text-muted-light dark:text-muted-dark">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt
                      size={9}
                    />
                    {activeGoal.daysLeft ||
                      0}{" "}
                    days left
                  </span>

                  <span className="flex items-center gap-1 text-green-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    On track
                  </span>
                </div>
              </div>

              <Link
                to="/dashboard/study-plan"
                className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-primary-100 py-2.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
              >
                Open study plan
                <FaArrowRight
                  size={9}
                />
              </Link>
            </>
          )}
        </section>
      </div>

      {/* =====================================================
          AI INSIGHT
      ===================================================== */}

      <section className="mt-6 rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaRobot
                size={15}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-primary-500">
                  AI learning insight
                </span>

                <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[8px] font-mono text-primary-500 dark:bg-primary-900/20">
                  AI
                </span>
              </div>

              <h2 className="mt-1 text-sm font-semibold text-ink-light dark:text-ink-dark">
                {recommendation.title}
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-light dark:text-muted-dark">
                {recommendation.description}
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/ai-assistant"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600"
          >
            Ask AI
            <FaArrowRight
              size={9}
            />
          </Link>
        </div>
      </section>

      {/* =====================================================
          ACHIEVEMENTS + AI TUTOR
      ===================================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
                Achievements
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                Recent milestones
              </h2>
            </div>

            <Link
              to="/dashboard/achievements"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-300"
            >
              View all
              <FaChevronRight
                size={8}
              />
            </Link>
          </div>

          {achievements.length ===
          0 ? (
            <div className="py-8 text-center">
              <FaTrophy
                size={20}
                className="mx-auto text-primary-300"
              />

              <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                No achievements yet.
              </p>

              <p className="mt-1 text-[10px] text-muted-light dark:text-muted-dark">
                Complete learning tasks
                to start building
                milestones.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {achievements
                .slice(0, 3)
                .map(
                  (
                    achievement
                  ) => (
                    <div
                      key={
                        achievement._id
                      }
                      className="flex items-center gap-3 rounded-lg p-3 hover:bg-primary-50 dark:hover:bg-white/5"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-base dark:bg-primary-900/20">
                        {
                          achievement.icon
                        }
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-ink-light dark:text-ink-dark">
                          {
                            achievement.title
                          }
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-muted-light dark:text-muted-dark">
                          {
                            achievement.description
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
            </div>
          )}
        </section>

        {/* AI TUTOR */}

        <section className="relative overflow-hidden rounded-xl bg-linear-to-br from-dark to-primary-600 p-5 text-white shadow-soft sm:p-6">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
              <FaRobot
                size={16}
                className="text-white/80"
              />
            </div>

            <p className="mt-5 text-[9px] font-mono uppercase tracking-[0.18em] text-white/50">
              Your AI tutor
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold">
              Need some help?
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/60">
              Ask questions, get simpler
              explanations, or review
              something you're struggling
              with.
            </p>

            <Link
              to="/dashboard/ai-assistant"
              className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-white hover:gap-3"
            >
              Start conversation
              <FaArrowRight
                size={9}
              />
            </Link>
          </div>
        </section>
      </div>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <QuickAction
          to="/dashboard/study-plan"
          icon={
            <FaPlay size={11} />
          }
          title="Continue learning"
          description="Resume your current study plan"
        />

        <QuickAction
          to="/dashboard/goals/new"
          icon={
            <FaBullseye
              size={11}
            />
          }
          title="Create a goal"
          description="Set a new learning target"
        />

        <QuickAction
          to="/dashboard/ai-assistant"
          icon={
            <FaRobot size={11} />
          }
          title="Ask AI"
          description="Get help with any topic"
        />
      </section>
    </div>
  );
};

/* ============================================================
   TASK ITEM
============================================================ */

const TaskItem = ({
  item,
  index,
  updating,
  onComplete,
}) => {
  return (
    <div className="group px-5 py-4 transition-colors hover:bg-primary-50/50 dark:hover:bg-white/2 sm:px-6">
      <div className="flex items-center gap-4">
        <div
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-mono sm:flex ${
            item.completed
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-primary-50 text-primary-500 dark:bg-primary-900/20"
          }`}
        >
          {item.completed ? (
            <FaCheck size={10} />
          ) : (
            `0${index + 1}`
          )}
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:hidden ${
            item.completed
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-primary-50 text-primary-500 dark:bg-primary-900/20"
          }`}
        >
          {item.completed ? (
            <FaCheck size={11} />
          ) : (
            <FaBookOpen
              size={11}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
              {item.type}
            </span>

            <span className="text-[9px] text-muted-light dark:text-muted-dark">
              /
            </span>

            <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark">
              {item.duration}
            </span>
          </div>

          <h3
            className={`mt-1 truncate text-sm font-semibold ${
              item.completed
                ? "text-muted-light line-through dark:text-muted-dark"
                : "text-ink-light dark:text-ink-dark"
            }`}
          >
            {item.title}
          </h3>

          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.completed
                    ? "bg-green-500"
                    : "bg-primary-500"
                }`}
                style={{
                  width: `${item.progress || 0}%`,
                }}
              />
            </div>

            <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
              {item.progress || 0}%
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={
            item.completed ||
            updating
          }
          onClick={() =>
            onComplete(item)
          }
          className={`hidden h-8 shrink-0 items-center gap-2 rounded-lg px-3 text-[10px] font-medium transition-colors sm:flex ${
            item.completed
              ? "cursor-default bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-primary-500 text-white hover:bg-primary-600"
          }`}
        >
          {updating ? (
            <FaSpinner
              size={9}
              className="animate-spin"
            />
          ) : item.completed ? (
            <FaCheck size={9} />
          ) : (
            "Complete"
          )}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-light dark:text-muted-dark sm:ml-13">
        <span>
          {item.completed
            ? "Completed"
            : item.progress > 0
              ? "Continue learning"
              : "Ready to start"}
        </span>

        <button
          type="button"
          disabled={
            item.completed ||
            updating
          }
          onClick={() =>
            onComplete(item)
          }
          className={`sm:hidden ${
            item.completed
              ? "text-green-500"
              : "font-medium text-primary-500"
          }`}
        >
          {updating ? (
            <FaSpinner
              size={9}
              className="animate-spin"
            />
          ) : item.completed ? (
            "Completed"
          ) : (
            "Complete"
          )}
        </button>
      </div>
    </div>
  );
};

/* ============================================================
   EMPTY TASKS
============================================================ */

const EmptyTasks = () => {
  return (
    <div className="px-5 py-12 text-center sm:px-6">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
        <FaBookOpen size={16} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-ink-light dark:text-ink-dark">
        No tasks for today
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-light dark:text-muted-dark">
        Your study plan doesn't have
        any tasks yet. Add learning
        activities to start tracking
        your progress.
      </p>

      <Link
        to="/dashboard/study-plan"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
      >
        Open study plan
        <FaArrowRight size={9} />
      </Link>
    </div>
  );
};

/* ============================================================
   STAT
============================================================ */

const Stat = ({
  icon,
  label,
  value,
  helper,
}) => {
  return (
    <div className="rounded-xl border border-primary-100 bg-white p-4 shadow-soft transition-transform hover:-translate-y-0.5 dark:border-white/5 dark:bg-panel-dark">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-muted-light dark:text-muted-dark">
        {label}
      </p>

      <p className="mt-0.5 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-muted-light dark:text-muted-dark">
        {helper}
      </p>
    </div>
  );
};

/* ============================================================
   QUICK ACTION
============================================================ */

const QuickAction = ({
  to,
  icon,
  title,
  description,
}) => {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/40 dark:border-white/5 dark:bg-panel-dark dark:hover:border-white/10 dark:hover:bg-white/3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink-light dark:text-ink-dark">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-muted-light dark:text-muted-dark">
          {description}
        </p>
      </div>

      <FaArrowRight
        size={9}
        className="text-muted-light transition-transform group-hover:translate-x-1 dark:text-muted-dark"
      />
    </Link>
  );
};

/* ============================================================
   LOADING SKELETON
============================================================ */

const DashboardSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse">
      <div className="mb-6">
        <div className="h-3 w-28 rounded bg-primary-100 dark:bg-white/5" />

        <div className="mt-3 h-8 w-72 rounded bg-primary-100 dark:bg-white/5" />

        <div className="mt-3 h-4 w-96 max-w-full rounded bg-primary-100 dark:bg-white/5" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-32 rounded-xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark"
            />
          )
        )}
      </div>

      <div className="mt-6 h-24 rounded-xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="h-107.5 rounded-xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark" />

        <div className="h-107.5 rounded-xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark" />
      </div>

      <div className="mt-6 h-32 rounded-xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark" />
    </div>
  );
};

export default DashboardOverview;
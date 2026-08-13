import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaPause,
  FaPlay,
  FaBullseye,
  FaLayerGroup,
} from "react-icons/fa";

import api from "../../config/Api.jsx";

const getDaysLeft = (targetDate) => {
  if (!targetDate) return 0;

  const deadline = new Date(targetDate);

  if (Number.isNaN(deadline.getTime())) return 0;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  deadline.setHours(0, 0, 0, 0);

  const diffInMs = deadline.getTime() - today.getTime();

  return Math.max(0, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");

  const [deletingId, setDeletingId] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);

  /* =====================================================
     FETCH GOALS
  ===================================================== */

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/goals");

      setGoals(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch goals:", error);

      setError(
        error?.response?.data?.message ||
          "Unable to load your goals.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredGoals = useMemo(() => {
    if (filter === "all") return goals;

    return goals.filter((goal) => goal.status === filter);
  }, [goals, filter]);

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    const active = goals.filter(
      (goal) => goal.status === "active",
    ).length;

    const completed = goals.filter(
      (goal) => goal.status === "completed",
    ).length;

    const totalTopics = goals.reduce(
      (sum, goal) => sum + (goal.totalTopics || 0),
      0,
    );

    const completedTopics = goals.reduce(
      (sum, goal) => sum + (goal.completedTopics || 0),
      0,
    );

    const overallProgress = totalTopics
      ? Math.round(
          (completedTopics / totalTopics) * 100,
        )
      : 0;

    return {
      total: goals.length,
      active,
      completed,
      overallProgress,
    };
  }, [goals]);

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await api.delete(`/goals/${id}`);

      setGoals((previousGoals) =>
        previousGoals.filter(
          (goal) => goal._id !== id,
        ),
      );
    } catch (error) {
      console.error("Delete goal error:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to delete goal.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =====================================================
     PAUSE / RESUME
  ===================================================== */

  const handleStatusChange = async (goal) => {
    try {
      setUpdatingId(goal._id);

      const newStatus =
        goal.status === "paused"
          ? "active"
          : "paused";

      const response = await api.put(
        `/goals/${goal._id}`,
        {
          status: newStatus,
        },
      );

      const updatedGoal = response.data.data;

      setGoals((previousGoals) =>
        previousGoals.map((item) =>
          item._id === updatedGoal._id
            ? updatedGoal
            : item,
        ),
      );
    } catch (error) {
      console.error("Status update error:", error);

      alert(
        error?.response?.data?.message ||
          "Unable to update goal.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <div className="animate-pulse">
          <div className="h-3 w-28 rounded bg-primary-100 dark:bg-white/10" />

          <div className="mt-3 h-8 w-72 rounded bg-primary-100 dark:bg-white/10" />

          <div className="mt-3 h-4 w-full max-w-xl rounded bg-primary-100 dark:bg-white/10" />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 rounded-xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* HEADER */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
            Learning goals
          </p>

          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
            What are you working toward?
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-light dark:text-muted-dark">
            Create goals, track your progress, and stay
            consistent with your learning journey.
          </p>
        </div>

        <Link
          to="/dashboard/goals/new"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white shadow-soft transition hover:bg-primary-600"
        >
          <FaPlus size={10} />
          New goal
        </Link>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}

          <button
            onClick={fetchGoals}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATS */}

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<FaBullseye size={12} />}
          label="Total goals"
          value={stats.total}
        />

        <StatCard
          icon={<FaPlay size={11} />}
          label="Active"
          value={stats.active}
        />

        <StatCard
          icon={<FaCheckCircle size={12} />}
          label="Completed"
          value={stats.completed}
        />

        <StatCard
          icon={<FaLayerGroup size={12} />}
          label="Overall progress"
          value={`${stats.overallProgress}%`}
        />
      </div>

      {/* FILTER */}

      <div className="mt-7 flex flex-wrap items-center gap-2">
        {[
          ["all", "All"],
          ["active", "Active"],
          ["paused", "Paused"],
          ["completed", "Completed"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg px-3 py-2 text-[10px] font-medium transition ${
              filter === value
                ? "bg-primary-500 text-white"
                : "border border-primary-100 bg-white text-muted-light hover:bg-primary-50 dark:border-white/5 dark:bg-panel-dark dark:text-muted-dark dark:hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* EMPTY */}

      {filteredGoals.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-primary-200 bg-white p-10 text-center dark:border-white/10 dark:bg-panel-dark">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaBullseye size={18} />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-ink-light dark:text-ink-dark">
            {goals.length === 0
              ? "No learning goals yet"
              : "No goals in this category"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-light dark:text-muted-dark">
            {goals.length === 0
              ? "Create your first learning goal and start building your personalized study path."
              : "Try another filter to see your goals."}
          </p>

          {goals.length === 0 && (
            <Link
              to="/dashboard/goals/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-primary-600"
            >
              <FaPlus size={10} />
              Create your first goal
            </Link>
          )}
        </div>
      )}

      {/* GOALS */}

      {filteredGoals.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              deleting={deletingId === goal._id}
              updating={updatingId === goal._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   GOAL CARD
========================================================= */

const GoalCard = ({
  goal,
  onDelete,
  onStatusChange,
  deleting,
  updating,
}) => {
  const isCompleted = goal.status === "completed";
  const daysLeft = getDaysLeft(goal.targetDate);

  return (
    <div className="group rounded-xl border border-primary-100 bg-white p-5 shadow-soft transition-all hover:border-primary-200 hover:shadow-glow dark:border-white/5 dark:bg-panel-dark dark:hover:border-primary-800 sm:p-6">
      {/* TOP */}

      <div className="flex items-start justify-between gap-4">
        <Link
          to={`/dashboard/goals/${goal._id}`}
          className="flex min-w-0 flex-1 items-start gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaBullseye size={15} />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
              {goal.subject}
            </p>

            <h2 className="mt-1 truncate font-display text-base font-semibold text-ink-light dark:text-ink-dark">
              {goal.title}
            </h2>
          </div>
        </Link>

        {isCompleted && (
          <FaCheckCircle
            size={15}
            className="shrink-0 text-primary-500"
          />
        )}
      </div>

      {/* DESCRIPTION */}

      {goal.description && (
        <p className="mt-4 line-clamp-2 text-xs leading-5 text-muted-light dark:text-muted-dark">
          {goal.description}
        </p>
      )}

      {/* PROGRESS */}

      <div className="mt-6 flex items-center justify-between text-[10px]">
        <span className="text-muted-light dark:text-muted-dark">
          {goal.level}
        </span>

        <span className="font-mono font-medium text-primary-500">
          {goal.progress}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-500"
          style={{
            width: `${goal.progress}%`,
          }}
        />
      </div>

      {/* INFO */}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-light dark:text-muted-dark">
        <span>
          {goal.completedTopics} of{" "}
          {goal.totalTopics} topics
        </span>

        {daysLeft > 0 && !isCompleted && (
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt size={9} />
            {daysLeft} days left
          </span>
        )}

        {goal.status === "paused" && (
          <span className="rounded-md bg-yellow-50 px-2 py-1 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">
            Paused
          </span>
        )}

        {isCompleted && (
          <span className="text-primary-500">
            Completed
          </span>
        )}
      </div>

      {/* ACTIONS */}

      <div className="mt-5 flex items-center justify-between gap-2">
        <Link
          to={`/dashboard/goals/${goal._id}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-300"
        >
          Open goal
          <FaArrowRight size={9} />
        </Link>

        <div className="flex items-center gap-2">
          {!isCompleted && (
            <button
              onClick={() =>
                onStatusChange(goal)
              }
              disabled={updating}
              title={
                goal.status === "paused"
                  ? "Resume goal"
                  : "Pause goal"
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-100 text-muted-light transition hover:bg-primary-50 hover:text-primary-500 disabled:opacity-50 dark:border-white/5 dark:text-muted-dark dark:hover:bg-white/5"
            >
              {goal.status === "paused" ? (
                <FaPlay size={9} />
              ) : (
                <FaPause size={9} />
              )}
            </button>
          )}

          <button
            onClick={() => onDelete(goal._id)}
            disabled={deleting}
            title="Delete goal"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:border-red-900/20 dark:hover:bg-red-900/10"
          >
            <FaTrash size={9} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl border border-primary-100 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-panel-dark">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
        {icon}
      </div>

      <p className="mt-3 text-[10px] text-muted-light dark:text-muted-dark">
        {label}
      </p>

      <p className="mt-0.5 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
        {value}
      </p>
    </div>
  );
};

export default GoalsPage;
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  FaBookOpen,
  FaCheck,
  FaClock,
  FaFire,
  FaTrophy,
  FaChartLine,
  FaCalendarCheck,
  FaBullseye,
  FaSpinner,
  FaSyncAlt,
  FaArrowUp,
  FaMedal,
} from "react-icons/fa";

import { toast } from "react-hot-toast";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4500";

const ProgressPage = () => {
  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
  =========================================================
  FETCH PROGRESS
  =========================================================
  */

  const fetchProgress = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response =
        await axios.get(
          `${API_BASE}/progress`,
          {
            withCredentials: true,
          }
        );

      const responseData =
        response.data?.data ||
        response.data;

      setData(responseData);
    } catch (error) {
      console.error(
        "Progress fetch error:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Unable to load your progress.";

      setError(message);

      if (!showLoader) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  /*
  =========================================================
  SAFE DATA
  =========================================================
  */

  const metrics = data?.metrics || {};

  const mastery =
    Array.isArray(data?.mastery)
      ? data.mastery
      : [];

  const weeklyActivity =
    Array.isArray(
      data?.weeklyActivity
    )
      ? data.weeklyActivity
      : [];

  /*
  =========================================================
  FORMAT STUDY TIME
  =========================================================
  */

  const formatStudyTime = (
    minutes = 0
  ) => {
    minutes = Number(minutes) || 0;

    const hours =
      Math.floor(minutes / 60);

    const remaining =
      minutes % 60;

    if (hours === 0) {
      return `${remaining}m`;
    }

    if (remaining === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remaining}m`;
  };

  /*
  =========================================================
  WEEKLY TOTALS
  =========================================================
  */

  const weeklyStats = useMemo(() => {
    return weeklyActivity.reduce(
      (result, day) => {
        result.minutes +=
          Number(day.minutes || 0);

        result.sessions +=
          Number(
            day.completedSessions || 0
          );

        return result;
      },
      {
        minutes: 0,
        sessions: 0,
      }
    );
  }, [weeklyActivity]);

  /*
  =========================================================
  BEST TOPIC
  =========================================================
  */

  const bestTopic = useMemo(() => {
    if (!mastery.length) {
      return null;
    }

    return [...mastery].sort(
      (a, b) =>
        Number(b.value || 0) -
        Number(a.value || 0)
    )[0];
  }, [mastery]);

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-6xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaSpinner
              size={18}
              className="animate-spin"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-ink-light dark:text-ink-dark">
            Loading your progress...
          </p>

          <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
            Calculating your learning activity.
          </p>
        </div>
      </div>
    );
  }

  /*
  =========================================================
  ERROR
  =========================================================
  */

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <FaChartLine size={18} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-ink-light dark:text-ink-dark">
            Unable to load progress
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-light dark:text-muted-dark">
            {error}
          </p>

          <button
            onClick={() =>
              fetchProgress()
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-primary-600"
          >
            <FaSyncAlt size={10} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /*
  =========================================================
  MAIN
  =========================================================
  */

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
            Your progress
          </p>

          <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark sm:text-3xl">
            See how far you've come
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-muted-light dark:text-muted-dark">
            Track your completed lessons, study
            time, topic mastery, goals and
            learning consistency.
          </p>
        </div>

        <button
          onClick={() =>
            fetchProgress(false)
          }
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary-100 px-3 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-50 dark:border-white/5 dark:text-primary-300"
        >
          <FaSyncAlt
            size={10}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* METRICS */}

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <Metric
          icon={<FaBookOpen />}
          value={
            metrics.lessonsCompleted || 0
          }
          label="Lessons completed"
        />

        <Metric
          icon={<FaCheck />}
          value={
            metrics.topicsMastered || 0
          }
          label="Topics mastered"
        />

        <Metric
          icon={<FaClock />}
          value={formatStudyTime(
            metrics.studyMinutes
          )}
          label="Study time"
        />

        <Metric
          icon={<FaFire />}
          value={`${metrics.currentStreak || 0} days`}
          label="Current streak"
        />

      </div>

      {/* EXTRA STATS */}

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <SmallStat
          label="Total goals"
          value={
            metrics.totalGoals || 0
          }
        />

        <SmallStat
          label="Completed goals"
          value={
            metrics.completedGoals || 0
          }
        />

        <SmallStat
          label="Longest streak"
          value={`${metrics.longestStreak || 0} days`}
        />

        <SmallStat
          label="Average progress"
          value={`${metrics.averageProgress || 0}%`}
        />

      </div>

      {/* WEEKLY ACTIVITY */}

      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
              Last 7 days
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
              Learning activity
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <p className="font-mono text-sm font-semibold text-primary-500">
              {formatStudyTime(
                weeklyStats.minutes
              )}
            </p>

            <p className="text-[9px] text-muted-light dark:text-muted-dark">
              {weeklyStats.sessions} completed sessions
            </p>
          </div>

        </div>

        <div className="mt-6 grid grid-cols-7 gap-2">
          {weeklyActivity.map(
            (day) => {
              const completed =
                Number(
                  day.completedSessions ||
                    0
                );

              const maxSessions =
                Math.max(
                  1,
                  ...weeklyActivity.map(
                    (item) =>
                      Number(
                        item.completedSessions ||
                          0
                      )
                  )
                );

              const height =
                Math.max(
                  8,
                  Math.round(
                    (completed /
                      maxSessions) *
                      100
                  )
                );

              const date =
                new Date(day.date);

              const label =
                date.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                  }
                );

              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-28 w-full items-end justify-center rounded-lg bg-primary-50 p-2 dark:bg-white/5">
                    <div
                      className="w-full rounded-md bg-primary-500 transition-all"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${completed} completed sessions`}
                    />
                  </div>

                  <span className="text-[9px] text-muted-light dark:text-muted-dark">
                    {label}
                  </span>

                  <span className="font-mono text-[9px] text-primary-500">
                    {completed}
                  </span>
                </div>
              );
            }
          )}
        </div>

      </section>

      {/* TOPIC MASTERY */}

      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
              Learning growth
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
              Topic mastery
            </h2>
          </div>

          <FaChartLine
            className="text-primary-500"
            size={16}
          />

        </div>

        {mastery.length === 0 ? (
          <EmptyState
            message="Complete study sessions to start seeing topic mastery."
          />
        ) : (
          <div className="mt-6 space-y-5">

            {mastery
              .sort(
                (a, b) =>
                  b.value - a.value
              )
              .map((topic) => (
                <div
                  key={topic.name}
                >

                  <div className="flex items-center justify-between gap-3 text-xs">

                    <span className="truncate text-ink-light dark:text-ink-dark">
                      {topic.name}
                    </span>

                    <span className="shrink-0 font-mono text-primary-500">
                      {topic.value}%
                    </span>

                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">

                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-700"
                      style={{
                        width: `${topic.value}%`,
                      }}
                    />

                  </div>

                  <p className="mt-1 text-[9px] text-muted-light dark:text-muted-dark">
                    {topic.completed || 0}{" "}
                    completed /{" "}
                    {topic.total || 0} sessions
                  </p>

                </div>
              ))}

          </div>
        )}

      </section>

      {/* INSIGHT */}

      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

        <div className="flex items-start gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            {metrics.currentStreak >= 7 ? (
              <FaMedal size={15} />
            ) : (
              <FaTrophy size={15} />
            )}
          </div>

          <div className="min-w-0">

            <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">

              {metrics.currentStreak >= 7
                ? "Excellent consistency!"
                : metrics.lessonsCompleted > 0
                  ? "You're making progress!"
                  : "Your learning journey starts here."}

            </p>

            <p className="mt-1 text-xs leading-5 text-muted-light dark:text-muted-dark">

              {metrics.currentStreak >= 7
                ? `You've maintained a ${metrics.currentStreak}-day learning streak. Keep it going!`
                : metrics.lessonsCompleted > 0
                  ? `You've completed ${metrics.lessonsCompleted} lessons and studied ${formatStudyTime(metrics.studyMinutes)} so far.`
                  : "Complete your first study session and your progress will appear here."}

            </p>

          </div>

        </div>

      </section>

      {/* BEST TOPIC */}

      {bestTopic && (
        <section className="mt-6 overflow-hidden rounded-xl bg-gradient-to-br from-dark to-primary-600 p-5 text-white shadow-soft sm:p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <FaBullseye size={16} />
            </div>

            <div className="min-w-0">

              <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/50">
                Strongest topic
              </p>

              <h2 className="mt-1 truncate font-display text-lg font-semibold">
                {bestTopic.name}
              </h2>

              <p className="mt-1 text-xs text-white/60">
                You're currently at{" "}
                <span className="font-semibold text-white">
                  {bestTopic.value}%
                </span>{" "}
                mastery.
              </p>

            </div>

            <FaArrowUp
              className="ml-auto hidden text-white/50 sm:block"
              size={14}
            />

          </div>

        </section>
      )}

    </div>
  );
};

/*
=========================================================
METRIC
=========================================================
*/

const Metric = ({
  icon,
  value,
  label,
}) => (
  <div className="rounded-xl border border-primary-100 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-panel-dark">

    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
      {React.cloneElement(icon, {
        size: 12,
      })}
    </div>

    <p className="mt-3 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
      {value}
    </p>

    <p className="text-[10px] text-muted-light dark:text-muted-dark">
      {label}
    </p>

  </div>
);

/*
=========================================================
SMALL STAT
=========================================================
*/

const SmallStat = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-primary-100 bg-white px-4 py-3 shadow-soft dark:border-white/5 dark:bg-panel-dark">

    <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
      {label}
    </p>

    <p className="mt-1 font-display text-base font-semibold text-ink-light dark:text-ink-dark">
      {value}
    </p>

  </div>
);

/*
=========================================================
EMPTY STATE
=========================================================
*/

const EmptyState = ({
  message,
}) => (
  <div className="mt-6 rounded-lg bg-primary-50/50 p-5 text-center dark:bg-white/[0.02]">

    <FaBookOpen
      className="mx-auto text-primary-500"
      size={18}
    />

    <p className="mt-2 text-xs text-muted-light dark:text-muted-dark">
      {message}
    </p>

  </div>
);

export default ProgressPage;
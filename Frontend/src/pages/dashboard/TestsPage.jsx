import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaPlay,
  FaQuestionCircle,
  FaRedo,
  FaSearch,
  FaSpinner,
  FaTrophy,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4500";

const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const [goal, setGoal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /*
   * =========================================================
   * FETCH STUDY PLAN
   * =========================================================
   */

  const fetchTests = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await axios.get(
        `${API_BASE}/study-plans/my-plan`,
        {
          withCredentials: true,
        },
      );

      const data =
        response.data?.data ||
        response.data ||
        {};

      const currentGoal = data?.goal || null;

      const studyPlan =
        data?.studyPlan ||
        data?.plan ||
        null;

      setGoal(currentGoal);

      /*
       * =====================================================
       * EXTRACT TEST SESSIONS
       * =====================================================
       */

      const generatedTests = [];

      const days = Array.isArray(studyPlan?.days)
        ? studyPlan.days
        : [];

      days.forEach((day, dayIndex) => {
        const sessions = Array.isArray(day?.sessions)
          ? day.sessions
          : [];

        sessions.forEach((session, sessionIndex) => {
          if (
            String(session?.type || "").toUpperCase() !==
            "TEST"
          ) {
            return;
          }

          const sessionId =
            session?._id ||
            session?.id ||
            `${dayIndex}-${sessionIndex}`;

          const completed =
            Boolean(session?.completed);

          generatedTests.push({
            id: sessionId,

            title:
              session?.title ||
              `${currentGoal?.subject || "Study"} Progress Quiz`,

            topic:
              session?.topic ||
              currentGoal?.subject ||
              "General",

            duration:
              parseDuration(session?.duration),

            questions:
              session?.questions ||
              session?.totalQuestions ||
              10,

            score:
              session?.score ??
              session?.result?.score ??
              null,

            status: completed
              ? "completed"
              : "not_started",

            completed,

            date: day?.date || null,

            day:
              day?.day ||
              `Day ${dayIndex + 1}`,

            description:
              session?.description ||
              "Test your understanding of the topics covered in your study plan.",

            goalId:
              currentGoal?._id || null,
          });
        });
      });

      setTests(generatedTests);
    } catch (err) {
      console.error(
        "Tests fetch error:",
        err,
      );

      if (err.response?.status === 404) {
        setGoal(null);
        setTests([]);
        setError("");
        return;
      }

      const message =
        err.response?.data?.message ||
        "Unable to load your tests.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    fetchTests();
  }, []);

  /*
   * =========================================================
   * FILTER TESTS
   * =========================================================
   */

  const filteredTests = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSearch =
        !query ||
        test.title
          ?.toLowerCase()
          .includes(query) ||
        test.topic
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "completed" &&
          test.status === "completed") ||
        (filter === "pending" &&
          test.status !== "completed");

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [tests, search, filter]);

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const statistics = useMemo(() => {
    const total = tests.length;

    const completed = tests.filter(
      (test) =>
        test.status === "completed",
    ).length;

    const pending =
      total - completed;

    const scores = tests
      .map((test) =>
        Number(test.score),
      )
      .filter(
        (score) =>
          Number.isFinite(score),
      );

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (sum, score) =>
                sum + score,
              0,
            ) / scores.length,
          )
        : null;

    return {
      total,
      completed,
      pending,
      averageScore,
    };
  }, [tests]);

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  function parseDuration(duration) {
    if (
      duration === null ||
      duration === undefined
    ) {
      return 15;
    }

    if (typeof duration === "number") {
      return duration;
    }

    const match =
      String(duration).match(
        /(\d+)/,
      );

    return match
      ? Number(match[1])
      : 15;
  }

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      },
    );
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
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
            Loading your tests...
          </p>

          <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
            Preparing assessments from your study plan.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <FaExclamationTriangle
              size={18}
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-ink-light dark:text-ink-dark">
            Unable to load tests
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-light dark:text-muted-dark">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchTests()
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
          >
            <FaRedo size={10} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">

          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
            Practice & assessment
          </p>

          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
            Test what you know
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-light dark:text-muted-dark">
            Your assessments are automatically generated
            from the topics in your personalized study plan.
          </p>

          {goal?.subject && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary-50 px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-primary-500 dark:bg-primary-900/20">
              {goal.subject}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            fetchTests(false)
          }
          disabled={refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary-100 px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
        >
          <FaRedo
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

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <TestStat
          icon={
            <FaFileAlt size={12} />
          }
          label="Total tests"
          value={statistics.total}
        />

        <TestStat
          icon={
            <FaCheckCircle size={12} />
          }
          label="Completed"
          value={statistics.completed}
        />

        <TestStat
          icon={
            <FaPlay size={11} />
          }
          label="Remaining"
          value={statistics.pending}
        />

        <TestStat
          icon={
            <FaTrophy size={12} />
          }
          label="Average score"
          value={
            statistics.averageScore !== null
              ? `${statistics.averageScore}%`
              : "—"
          }
        />

      </section>

      {/* =====================================================
          PROGRESS
      ===================================================== */}

      {statistics.total > 0 && (
        <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
                Assessment progress
              </p>

              <p className="mt-1 text-sm font-medium text-ink-light dark:text-ink-dark">
                {statistics.completed} of{" "}
                {statistics.total} tests completed
              </p>
            </div>

            <p className="font-mono text-sm font-semibold text-primary-500">
              {Math.round(
                (statistics.completed /
                  statistics.total) *
                  100,
              )}
              %
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-700"
              style={{
                width: `${Math.round(
                  (statistics.completed /
                    statistics.total) *
                    100,
                )}%`,
              }}
            />
          </div>

        </section>
      )}

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <section className="mt-6 flex flex-col gap-3 sm:flex-row">

        <div className="relative flex-1">
          <FaSearch
            size={11}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search tests or topics..."
            className="w-full rounded-lg border border-primary-100 bg-white py-2.5 pl-9 pr-3 text-xs text-ink-light outline-none transition-colors placeholder:text-muted-light focus:border-primary-300 dark:border-white/5 dark:bg-panel-dark dark:text-ink-dark dark:placeholder:text-muted-dark"
          />
        </div>

        <div className="flex rounded-lg border border-primary-100 bg-white p-1 dark:border-white/5 dark:bg-panel-dark">

          {[
            ["all", "All"],
            ["pending", "Pending"],
            ["completed", "Completed"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFilter(value)
              }
              className={`rounded-md px-3 py-1.5 text-[10px] font-medium transition-colors ${
                filter === value
                  ? "bg-primary-500 text-white"
                  : "text-muted-light hover:bg-primary-50 dark:text-muted-dark dark:hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}

        </div>

      </section>

      {/* =====================================================
          TEST LIST
      ===================================================== */}

      <div className="mt-6 space-y-3">

        {filteredTests.length === 0 ? (
          <section className="rounded-xl border border-primary-100 bg-white p-10 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              {tests.length === 0 ? (
                <FaQuestionCircle size={20} />
              ) : (
                <FaSearch size={18} />
              )}
            </div>

            <h2 className="mt-5 text-base font-semibold text-ink-light dark:text-ink-dark">
              {tests.length === 0
                ? "No tests available yet"
                : "No tests found"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-light dark:text-muted-dark">
              {tests.length === 0
                ? "Tests will automatically appear here when your study plan contains assessment sessions."
                : "Try changing your search or filter to find another assessment."}
            </p>

            {tests.length === 0 && (
              <Link
                to="/dashboard/study-plan"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
              >
                View study plan
                <FaArrowRight size={9} />
              </Link>
            )}

          </section>
        ) : (
          filteredTests.map(
            (test, index) => (
              <Link
                key={test.id}
                to={`/dashboard/tests/${test.id}`}
                state={{
                  test,
                  goal,
                }}
                className="group flex flex-col gap-4 rounded-xl border border-primary-100 bg-white p-5 shadow-soft transition-all hover:border-primary-200 hover:shadow-glow dark:border-white/5 dark:bg-panel-dark sm:flex-row sm:items-center sm:p-6"
              >

                {/* TEST ICON */}

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                    test.completed
                      ? "bg-primary-500 text-white"
                      : "bg-primary-50 text-primary-500 dark:bg-primary-900/20"
                  }`}
                >
                  {test.completed ? (
                    <FaCheckCircle size={15} />
                  ) : (
                    <FaFileAlt size={15} />
                  )}
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                      {test.topic}
                    </p>

                    {test.completed && (
                      <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[8px] font-mono uppercase text-primary-500 dark:bg-primary-900/20">
                        Completed
                      </span>
                    )}

                    {!test.completed &&
                      index === 0 && (
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[8px] font-mono uppercase text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                          Next
                        </span>
                      )}

                  </div>

                  <h2 className="mt-1 truncate text-sm font-semibold text-ink-light dark:text-ink-dark">
                    {test.title}
                  </h2>

                  <p className="mt-1 line-clamp-1 text-[10px] text-muted-light dark:text-muted-dark">
                    {test.description}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-muted-light dark:text-muted-dark">

                    <span className="flex items-center gap-1">
                      <FaQuestionCircle size={8} />
                      {test.questions} questions
                    </span>

                    <span className="flex items-center gap-1">
                      <FaClock size={8} />
                      {test.duration} min
                    </span>

                    {test.day && (
                      <span>
                        {test.day}
                      </span>
                    )}

                    {test.date && (
                      <span>
                        {formatDate(
                          test.date,
                        )}
                      </span>
                    )}

                  </div>

                </div>

                {/* RIGHT SIDE */}

                <div className="flex items-center justify-between gap-4 sm:justify-end">

                  {test.score !== null &&
                  test.score !== undefined ? (
                    <div className="text-right">

                      <p className="font-mono text-sm font-semibold text-primary-500">
                        {test.score}%
                      </p>

                      <p className="text-[9px] text-muted-light dark:text-muted-dark">
                        Last score
                      </p>

                    </div>
                  ) : test.completed ? (
                    <span className="rounded-lg bg-primary-50 px-3 py-2 text-[10px] font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                      Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white dark:bg-primary-900/20 dark:text-primary-300">
                      <FaPlay size={8} />
                      Start
                    </span>
                  )}

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-100 text-muted-light transition-all group-hover:border-primary-300 group-hover:text-primary-500 dark:border-white/5 dark:text-muted-dark">
                    <FaArrowRight
                      size={10}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>

                </div>

              </Link>
            ),
          )
        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      {tests.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-xl bg-gradient-to-br from-dark to-primary-600 p-5 text-white shadow-soft sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <FaTrophy size={15} />
              </div>

              <div>

                <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/50">
                  Keep improving
                </p>

                <h2 className="mt-1 font-display text-lg font-semibold">
                  Practice makes progress.
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-white/60">
                  Complete your assessments to understand
                  what you have mastered and where you need
                  more practice.
                </p>

              </div>

            </div>

            <Link
              to="/dashboard/study-plan"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-dark transition-colors hover:bg-white/90"
            >
              View study plan
              <FaArrowRight size={9} />
            </Link>

          </div>

        </section>
      )}

    </div>
  );
};

/*
=========================================================
TEST STAT
=========================================================
*/

const TestStat = ({
  icon,
  label,
  value,
}) => {
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

export default TestsPage;
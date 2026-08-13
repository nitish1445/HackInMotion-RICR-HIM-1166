import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaExclamationTriangle,
  FaFire,
  FaRobot,
  FaSpinner,
  FaSyncAlt,
  FaTrophy,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4500";

const StudyPlanPage = () => {
  const [goal, setGoal] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [openDay, setOpenDay] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingSession, setCompletingSession] = useState(null);
  const [error, setError] = useState("");

  /*
   * =========================================================
   * FETCH STUDY PLAN
   * =========================================================
   */
  const fetchStudyPlan = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await axios.get(`${API_BASE}/study-plans/my-plan`, {
        withCredentials: true,
      });

      const data = response.data?.data || response.data;

      setGoal(data?.goal || null);
      setStudyPlan(data?.studyPlan || null);

      if (data?.studyPlan?.days?.length > 0) {
        setOpenDay(0);
      }
    } catch (err) {
      console.error("Study plan fetch error:", err);

      const status = err.response?.status;

      if (status === 404) {
        setGoal(null);
        setStudyPlan(null);
        setError("");
        return;
      }

      setError(
        err.response?.data?.message || "Unable to load your study plan.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchStudyPlan();
  }, []);

  /*
   * =========================================================
   * NORMALIZE DAYS
   * =========================================================
   */

  const days = useMemo(() => {
    if (!studyPlan) return [];

    if (Array.isArray(studyPlan.days)) {
      return studyPlan.days;
    }

    return [];
  }, [studyPlan]);

  /*
   * =========================================================
   * CALCULATE TOTAL SESSION DATA
   * =========================================================
   */

  const statistics = useMemo(() => {
    let totalSessions = 0;
    let completedSessions = 0;
    let totalMinutes = 0;
    let completedMinutes = 0;

    days.forEach((day) => {
      const sessions = Array.isArray(day.sessions) ? day.sessions : [];

      sessions.forEach((session) => {
        totalSessions += 1;

        if (session.completed) {
          completedSessions += 1;
        }

        const duration = Number(session.duration || 0);

        totalMinutes += duration;

        if (session.completed) {
          completedMinutes += duration;
        }
      });
    });

    const calculatedProgress =
      totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

    return {
      totalSessions,
      completedSessions,
      totalMinutes,
      completedMinutes,
      calculatedProgress,
    };
  }, [days]);

  /*
   * =========================================================
   * PROGRESS
   * =========================================================
   */

  const progress = Number(
    studyPlan?.progress ?? goal?.progress ?? statistics.calculatedProgress ?? 0,
  );

  const safeProgress = Math.min(100, Math.max(0, progress));

  /*
   * =========================================================
   * DAYS LEFT
   * =========================================================
   */

  const daysLeft = useMemo(() => {
    if (goal?.deadline) {
      const today = new Date();
      const deadline = new Date(goal.deadline);

      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);

      const difference = deadline.getTime() - today.getTime();

      return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
    }

    if (goal?.daysLeft !== undefined) {
      return Math.max(0, Number(goal.daysLeft));
    }

    return null;
  }, [goal]);

  /*
   * =========================================================
   * COMPLETE SESSION
   * =========================================================
   */

  const handleCompleteSession = async (sessionId, completed) => {
    if (!sessionId || !goal?._id) {
      toast.error("Invalid study session.");
      return;
    }

    try {
      setCompletingSession(sessionId);

      const response = await axios.patch(
        `${API_BASE}/study-plans/my-plan/session/${sessionId}/complete`,
        {
          completed: !completed,
        },
        {
          withCredentials: true,
        },
      );

      const updatedData = response.data?.data;

      if (updatedData?.goal) {
        setGoal((previousGoal) => ({
          ...previousGoal,
          ...updatedData.goal,
        }));
      }

      // Get latest study plan
      await fetchStudyPlan(false);

      toast.success(
        completed ? "Session marked incomplete" : "Session completed! 🎉",
      );
    } catch (err) {
      console.error("Complete session error:", err);

      toast.error(err.response?.data?.message || "Unable to update session.");
    } finally {
      setCompletingSession(null);
    }
  };

  /*
   * =========================================================
   * FORMAT DATE
   * =========================================================
   */

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  /*
   * =========================================================
   * DAY PROGRESS
   * =========================================================
   */

  const getDayProgress = (day) => {
    const sessions = Array.isArray(day.sessions) ? day.sessions : [];

    if (!sessions.length) return 0;

    const completed = sessions.filter((session) => session.completed).length;

    return Math.round((completed / sessions.length) * 100);
  };

  /*
   * =========================================================
   * DURATION FORMAT
   * =========================================================
   */

  const formatDuration = (duration) => {
    const minutes = Number(duration || 0);

    if (!minutes) return "0 min";

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (!remainingMinutes) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  /*
   * =========================================================
   * SESSION TYPE STYLE
   * =========================================================
   */

  const getSessionType = (type) => {
    return String(type || "LEARN").toUpperCase();
  };

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[500px] w-full max-w-6xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaSpinner size={18} className="animate-spin" />
          </div>

          <p className="mt-4 text-sm font-medium text-ink-light dark:text-ink-dark">
            Loading your study plan...
          </p>

          <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
            Preparing your personalized learning path.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR STATE
   * =========================================================
   */

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <FaExclamationTriangle size={18} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-ink-light dark:text-ink-dark">
            Unable to load study plan
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-light dark:text-muted-dark">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchStudyPlan()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
          >
            <FaSyncAlt size={10} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * NO PLAN STATE
   * =========================================================
   */

  if (!goal || !studyPlan) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-primary-100 bg-white p-8 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaBookOpen size={20} />
          </div>

          <h1 className="mt-5 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            No study plan yet
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-light dark:text-muted-dark">
            Create a learning goal first and EduTech will build a personalized
            study plan around your target, level, available time, and deadline.
          </p>

          <Link
            to="/dashboard/goals/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
          >
            Create learning goal
            <FaArrowRight size={9} />
          </Link>
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
            Personalized study plan
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
              {goal.title || "My Learning Plan"}
            </h1>

            {goal.level && (
              <span className="rounded-md bg-primary-50 px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-primary-500 dark:bg-primary-900/20">
                {goal.level}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-light dark:text-muted-dark">
            {goal.subject ? `${goal.subject} · ` : ""}
            Your plan adapts around your progress, available time, and learning
            needs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchStudyPlan(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-100 px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
          >
            <FaSyncAlt size={10} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            to="/dashboard/ai-assistant"
            className="inline-flex items-center gap-2 rounded-lg border border-primary-100 px-3 py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
          >
            <FaRobot size={11} />
            Ask AI
          </Link>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PlanStat
          icon={<FaTrophy size={12} />}
          label="Progress"
          value={`${safeProgress}%`}
        />

        <PlanStat
          icon={<FaCheckCircle size={12} />}
          label="Sessions"
          value={`${statistics.completedSessions}/${statistics.totalSessions}`}
        />

        <PlanStat
          icon={<FaClock size={12} />}
          label="Study time"
          value={formatDuration(statistics.totalMinutes)}
        />

        <PlanStat
          icon={<FaCalendarAlt size={12} />}
          label="Days left"
          value={daysLeft !== null ? `${daysLeft}` : "—"}
        />
      </section>

      {/* =====================================================
          OVERALL PROGRESS
      ===================================================== */}

      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
              Overall progress
            </p>

            <div className="mt-1 flex items-end gap-2">
              <p className="font-display text-3xl font-semibold text-ink-light dark:text-ink-dark">
                {safeProgress}%
              </p>

              {safeProgress >= 80 && (
                <span className="mb-1 flex items-center gap-1 text-[10px] font-medium text-primary-500">
                  <FaFire size={9} />
                  Almost there
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-1/2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-light dark:text-muted-dark">
                {statistics.completedSessions} of {statistics.totalSessions}{" "}
                sessions completed
              </span>

              {daysLeft !== null && (
                <span className="font-mono text-primary-500">
                  {daysLeft} days left
                </span>
              )}
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-700"
                style={{
                  width: `${safeProgress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PLAN META
      ===================================================== */}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <InfoCard
          label="Daily availability"
          value={
            goal.hoursPerDay ? `${goal.hoursPerDay} hr/day` : "Personalized"
          }
        />

        <InfoCard
          label="Topics"
          value={
            goal.totalTopics
              ? `${goal.completedTopics || 0} / ${goal.totalTopics}`
              : `${statistics.completedSessions} completed`
          }
        />

        <InfoCard
          label="Learning status"
          value={
            safeProgress >= 100
              ? "Completed"
              : safeProgress >= 70
                ? "Strong progress"
                : "In progress"
          }
        />
      </div>

      {/* =====================================================
          DAYS
      ===================================================== */}

      <div className="mt-6 space-y-3">
        {days.length === 0 ? (
          <section className="rounded-xl border border-primary-100 bg-white p-8 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <FaBookOpen size={22} className="mx-auto text-primary-500" />

            <h2 className="mt-4 text-base font-semibold text-ink-light dark:text-ink-dark">
              No sessions available
            </h2>

            <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
              Your plan doesn't have any study sessions yet.
            </p>
          </section>
        ) : (
          days.map((day, index) => {
            const isOpen = openDay === index;
            const dayProgress = getDayProgress(day);

            const sessions = Array.isArray(day.sessions) ? day.sessions : [];

            const completedCount = sessions.filter(
              (session) => session.completed,
            ).length;

            return (
              <section
                key={day._id || day.id || `${day.date}-${index}`}
                className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft transition-all dark:border-white/5 dark:bg-panel-dark"
              >
                {/* DAY HEADER */}

                <button
                  type="button"
                  onClick={() => setOpenDay(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-primary-50/40 dark:hover:bg-white/[0.02] sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                      {dayProgress === 100 ? (
                        <FaCheckCircle size={13} />
                      ) : (
                        <FaCalendarAlt size={12} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                          {day.day || `Day ${index + 1}`}
                        </p>

                        {dayProgress === 100 && (
                          <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[8px] font-mono uppercase text-primary-500 dark:bg-primary-900/20">
                            Completed
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-[10px] text-muted-light dark:text-muted-dark">
                        {formatDate(day.date) ||
                          day.label ||
                          `Day ${index + 1}`}{" "}
                        · {sessions.length}{" "}
                        {sessions.length === 1 ? "session" : "sessions"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] font-mono text-primary-500">
                        {dayProgress}%
                      </p>

                      <p className="mt-0.5 text-[8px] text-muted-light dark:text-muted-dark">
                        {completedCount}/{sessions.length}
                      </p>
                    </div>

                    <FaChevronDown
                      size={10}
                      className={`text-muted-light transition-transform duration-300 dark:text-muted-dark ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* DAY PROGRESS BAR */}

                <div className="h-0.5 bg-primary-50 dark:bg-white/5">
                  <div
                    className="h-full bg-primary-500 transition-all duration-500"
                    style={{
                      width: `${dayProgress}%`,
                    }}
                  />
                </div>

                {/* SESSIONS */}

                {isOpen && (
                  <div className="border-t border-primary-100 dark:border-white/5">
                    {sessions.length === 0 ? (
                      <div className="px-5 py-6 text-center sm:px-6">
                        <p className="text-xs text-muted-light dark:text-muted-dark">
                          No sessions planned for this day.
                        </p>
                      </div>
                    ) : (
                      sessions.map((session, sessionIndex) => {
                        const sessionId =
                          session._id ||
                          session.id ||
                          `${index}-${sessionIndex}`;

                        const completed = Boolean(session.completed);

                        return (
                          <div
                            key={sessionId}
                            className={`group flex items-center gap-3 border-b border-primary-100 px-5 py-4 last:border-b-0 dark:border-white/5 sm:gap-4 sm:px-6 ${
                              completed
                                ? "bg-primary-50/30 dark:bg-primary-900/[0.03]"
                                : "hover:bg-primary-50/40 dark:hover:bg-white/[0.02]"
                            }`}
                          >
                            {/* SESSION ICON */}

                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                completed
                                  ? "bg-primary-500 text-white"
                                  : "bg-primary-50 text-primary-500 dark:bg-primary-900/20"
                              }`}
                            >
                              {completed ? (
                                <FaCheck size={10} />
                              ) : (
                                <FaBookOpen size={11} />
                              )}
                            </div>

                            {/* SESSION CONTENT */}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                                  {getSessionType(session.type)}
                                </span>

                                {sessionIndex === 0 && !completed && (
                                  <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[8px] font-mono uppercase text-primary-500 dark:bg-primary-900/20">
                                    Next
                                  </span>
                                )}
                              </div>

                              <h3
                                className={`mt-1 truncate text-sm font-medium ${
                                  completed
                                    ? "text-muted-light line-through dark:text-muted-dark"
                                    : "text-ink-light dark:text-ink-dark"
                                }`}
                              >
                                {session.title || "Study session"}
                              </h3>

                              <div className="mt-1 flex flex-wrap items-center gap-3">
                                <p className="flex items-center gap-1.5 text-[10px] text-muted-light dark:text-muted-dark">
                                  <FaClock size={8} />
                                  {formatDuration(session.duration)}
                                </p>

                                {session.description && (
                                  <p className="hidden truncate text-[10px] text-muted-light dark:text-muted-dark md:block">
                                    {session.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* COMPLETE BUTTON */}

                            <button
                              type="button"
                              onClick={() =>
                                handleCompleteSession(
                                  session._id || session.id,
                                  completed,
                                )
                              }
                              disabled={completingSession === sessionId}
                              title={
                                completed ? "Mark incomplete" : "Mark complete"
                              }
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all ${
                                completed
                                  ? "border-primary-200 bg-primary-50 text-primary-500 hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-900/20"
                                  : "border-primary-100 text-muted-light hover:border-primary-300 hover:bg-primary-50 hover:text-primary-500 dark:border-white/5 dark:text-muted-dark dark:hover:bg-white/5"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {completingSession === sessionId ? (
                                <FaSpinner size={10} className="animate-spin" />
                              ) : completed ? (
                                <FaCheck size={9} />
                              ) : (
                                <span className="h-2.5 w-2.5 rounded-full border border-current" />
                              )}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* =====================================================
          FOOTER AI CARD
      ===================================================== */}

      <section className="mt-6 overflow-hidden rounded-xl bg-gradient-to-br from-dark to-primary-600 p-5 text-white shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <FaRobot size={15} />
            </div>

            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/50">
                AI learning assistant
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold">
                Need help with today's topic?
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-white/60">
                Ask questions, simplify difficult concepts, or get additional
                practice based on your current study plan.
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/ai-assistant"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-medium text-dark transition-colors hover:bg-white/90"
          >
            Start conversation
            <FaArrowRight size={9} />
          </Link>
        </div>
      </section>
    </div>
  );
};

/*
 * =========================================================
 * PLAN STAT
 * =========================================================
 */

const PlanStat = ({ icon, label, value }) => {
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

/*
 * =========================================================
 * INFO CARD
 * =========================================================
 */

const InfoCard = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-primary-100 bg-white px-4 py-3 shadow-soft dark:border-white/5 dark:bg-panel-dark">
      <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
        {label}
      </p>

      <p className="mt-1 text-xs font-medium text-ink-light dark:text-ink-dark">
        {value}
      </p>
    </div>
  );
};

export default StudyPlanPage;

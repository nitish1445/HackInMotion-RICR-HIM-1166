import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaFire,
  FaTrophy,
  FaCalendarCheck,
  FaChartBar,
  FaUsers,
  FaMedal,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowRight,
  FaChevronDown,
} from "react-icons/fa";

import api from "../../config/Api.jsx";

/*
=========================================================
LEARNING ACTIVITY & COMPETITIVE PROGRESS

Self-contained dashboard section (fetches its own data,
manages its own loading/error state — same pattern as
AssessmentStatusWidget) that shows:

- a GitHub-style contribution heatmap built from the real
  LearningActivity documents behind /dashboard/activity
- streak / active-days / total-activity summary
- a dynamic, non-judgmental motivational message
- active learners + the user's subject-specific rank from
  /dashboard/competition

Every number rendered here comes straight from the backend
response — nothing is computed, guessed, or hardcoded on
this side.
=========================================================
*/

const LEVEL_CLASSES = [
  "bg-primary-50 dark:bg-white/5",
  "bg-primary-200 dark:bg-primary-900/50",
  "bg-primary-400 dark:bg-primary-700",
  "bg-primary-600 dark:bg-primary-500",
  "bg-primary-800 dark:bg-primary-300",
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAY_ROW_LABELS = { 1: "Mon", 3: "Wed", 5: "Fri" };

/* ============================================================
   DATE HELPERS (UTC-based to match backend date keys)
============================================================ */

const parseUtcDateKey = (key) => new Date(`${key}T00:00:00.000Z`);

const formatLongDate = (key) =>
  parseUtcDateKey(key).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

/*
 * Builds a GitHub-style week-column grid from the (sparse)
 * list of active days the backend returned, filling every
 * other day in the window with an empty (count 0) cell.
 */
const buildWeeks = (windowStart, windowEnd, days) => {
  if (!windowStart || !windowEnd) return [];

  const dayMap = new Map(days.map((d) => [d.date, d]));

  const start = parseUtcDateKey(windowStart);
  const end = parseUtcDateKey(windowEnd);

  const gridStart = new Date(start);
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());

  const weeks = [];
  let cursor = new Date(gridStart);

  while (cursor <= end) {
    const week = [];

    for (let i = 0; i < 7; i++) {
      const dateKey = cursor.toISOString().slice(0, 10);
      const inRange = cursor >= start && cursor <= end;
      const info = dayMap.get(dateKey);

      week.push({
        date: dateKey,
        inRange,
        count: info?.count || 0,
        level: info?.level || 0,
        activities: info?.activities || [],
      });

      cursor = new Date(cursor);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
};

/*
 * One label per calendar month, placed above the first week
 * column in which that month's 1st falls (or, for the very
 * first column, whichever month it starts in).
 */
const buildMonthLabels = (weeks) => {
  const labels = new Array(weeks.length).fill(null);
  let lastMonth = null;

  weeks.forEach((week, index) => {
    const firstInRange = week.find((d) => d.inRange);
    if (!firstInRange) return;

    const month = parseUtcDateKey(firstInRange.date).getUTCMonth();

    if (month !== lastMonth) {
      labels[index] = MONTH_SHORT[month];
      lastMonth = month;
    }
  });

  return labels;
};

/* ============================================================
   API CALLS
============================================================ */

const getActivity = async (period) => {
  const response = await api.get("/dashboard/activity", {
    params: period ? { period } : undefined,
  });
  return response.data?.data;
};

const getCompetition = async (subject) => {
  const response = await api.get("/dashboard/competition", {
    params: subject ? { subject } : undefined,
  });
  return response.data?.data;
};

/* ============================================================
   COMPONENT
============================================================ */

const LearningActivitySection = () => {
  const [period, setPeriod] = useState("last-12-months");
  const [subject, setSubject] = useState("");

  const [activity, setActivity] = useState(null);
  const [competition, setCompetition] = useState(null);

  const [loadingActivity, setLoadingActivity] = useState(true);
  const [loadingCompetition, setLoadingCompetition] = useState(true);

  const [activityError, setActivityError] = useState("");
  const [competitionError, setCompetitionError] = useState("");

  const [tooltip, setTooltip] = useState(null);
  const gridRef = useRef(null);

  /* ==========================================================
     FETCH ACTIVITY
  ========================================================== */

  const fetchActivity = useCallback(async (selectedPeriod) => {
    try {
      setLoadingActivity(true);
      setActivityError("");

      const data = await getActivity(
        selectedPeriod === "last-12-months" ? undefined : selectedPeriod
      );

      setActivity(data);
    } catch (err) {
      console.error("Learning activity error:", err);
      setActivityError(
        err.response?.data?.message || "Unable to load learning activity."
      );
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  /* ==========================================================
     FETCH COMPETITION
  ========================================================== */

  const fetchCompetition = useCallback(async (selectedSubject) => {
    try {
      setLoadingCompetition(true);
      setCompetitionError("");

      const data = await getCompetition(selectedSubject || undefined);

      setCompetition(data);

      if (!selectedSubject && data?.subject) {
        setSubject(data.subject);
      }
    } catch (err) {
      console.error("Competition error:", err);
      setCompetitionError(
        err.response?.data?.message || "Unable to load competition data."
      );
    } finally {
      setLoadingCompetition(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity(period);
  }, [fetchActivity, period]);

  useEffect(() => {
    fetchCompetition(subject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubjectChange = (nextSubject) => {
    setSubject(nextSubject);
    fetchCompetition(nextSubject);
  };

  /* ==========================================================
     HEATMAP DATA
  ========================================================== */

  const weeks = useMemo(() => {
    if (!activity) return [];
    return buildWeeks(activity.windowStart, activity.windowEnd, activity.days || []);
  }, [activity]);

  const monthLabels = useMemo(() => buildMonthLabels(weeks), [weeks]);

  const showTooltip = (event, cell) => {
    if (!cell.inRange || !gridRef.current) return;

    const containerRect = gridRef.current.getBoundingClientRect();
    const cellRect = event.currentTarget.getBoundingClientRect();

    setTooltip({
      x: cellRect.left - containerRect.left + cellRect.width / 2,
      y: cellRect.top - containerRect.top,
      date: cell.date,
      count: cell.count,
      activities: cell.activities,
    });
  };

  const hideTooltip = () => setTooltip(null);

  /* ==========================================================
     RENDER: LOADING / ERROR (activity)
  ========================================================== */

  return (
    <section className="mt-6 rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">
      {/* ==========================================================
          HEADER
      ========================================================== */}

      <div className="flex flex-col gap-3 border-b border-primary-100 px-5 py-4 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
            Learning Activity
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
            Your contributions in the last year
          </h2>
        </div>

        {activity?.availableYears?.length > 0 && (
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none rounded-lg border border-primary-100 bg-white py-2 pl-3 pr-8 text-xs font-medium text-ink-light shadow-soft focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-ink-dark"
            >
              <option value="last-12-months">Last 12 Months</option>
              {activity.availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <FaChevronDown
              size={9}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
            />
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {loadingActivity && (
          <div className="flex items-center gap-2 py-10 text-xs text-muted-light dark:text-muted-dark">
            <FaSpinner size={11} className="animate-spin" />
            Loading your learning activity...
          </div>
        )}

        {!loadingActivity && activityError && (
          <div className="flex items-center gap-2 py-6 text-xs text-red-600 dark:text-red-400">
            <FaExclamationTriangle size={11} />
            {activityError}
          </div>
        )}

        {!loadingActivity && !activityError && activity && (
          <>
            {activity.isNewUser ? (
              <EmptyActivityState />
            ) : (
              <>
                {/* ====================================================
                    HEATMAP
                ==================================================== */}

                <div className="overflow-x-auto pb-2">
                  <div
                    ref={gridRef}
                    className="relative inline-block min-w-full"
                    onMouseLeave={hideTooltip}
                  >
                    {/* month labels */}
                    <div
                      className="grid pl-8 text-[9px] text-muted-light dark:text-muted-dark"
                      style={{
                        gridTemplateColumns: `repeat(${weeks.length}, minmax(11px, 1fr))`,
                      }}
                    >
                      {monthLabels.map((label, index) => (
                        <span key={index} className="whitespace-nowrap">
                          {label || ""}
                        </span>
                      ))}
                    </div>

                    <div className="mt-1 flex gap-[3px]">
                      {/* weekday labels */}
                      <div className="flex w-6 shrink-0 flex-col gap-[3px] pr-1 text-[8px] text-muted-light dark:text-muted-dark">
                        {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                          <span
                            key={row}
                            className="flex h-[11px] items-center"
                          >
                            {WEEKDAY_ROW_LABELS[row] || ""}
                          </span>
                        ))}
                      </div>

                      {/* weeks */}
                      {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                          {week.map((cell) => (
                            <button
                              type="button"
                              key={cell.date}
                              disabled={!cell.inRange}
                              onMouseEnter={(e) => showTooltip(e, cell)}
                              onFocus={(e) => showTooltip(e, cell)}
                              onClick={(e) =>
                                tooltip?.date === cell.date
                                  ? hideTooltip()
                                  : showTooltip(e, cell)
                              }
                              className={`h-[11px] w-[11px] shrink-0 rounded-[2px] transition-colors ${
                                cell.inRange
                                  ? `${LEVEL_CLASSES[cell.level]} hover:ring-1 hover:ring-primary-400`
                                  : "bg-transparent"
                              }`}
                              aria-label={
                                cell.inRange
                                  ? `${formatLongDate(cell.date)}: ${cell.count} learning ${
                                      cell.count === 1 ? "activity" : "activities"
                                    }`
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* tooltip */}
                    {tooltip && (
                      <div
                        className="pointer-events-none absolute z-10 w-max max-w-[220px] -translate-x-1/2 -translate-y-full rounded-lg border border-primary-100 bg-white p-3 text-[10px] shadow-soft dark:border-white/10 dark:bg-panel-dark"
                        style={{
                          left: tooltip.x,
                          top: tooltip.y - 8,
                        }}
                      >
                        <p className="font-semibold text-ink-light dark:text-ink-dark">
                          {formatLongDate(tooltip.date)}
                        </p>

                        {tooltip.count === 0 ? (
                          <p className="mt-1 text-muted-light dark:text-muted-dark">
                            No learning activity
                          </p>
                        ) : (
                          <>
                            <p className="mt-1 text-muted-light dark:text-muted-dark">
                              {tooltip.count} learning{" "}
                              {tooltip.count === 1 ? "activity" : "activities"}
                            </p>
                            <ul className="mt-1.5 space-y-0.5">
                              {tooltip.activities.map((label, i) => (
                                <li
                                  key={i}
                                  className="text-ink-light dark:text-ink-dark"
                                >
                                  • {label}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* legend */}
                <div className="mt-3 flex items-center justify-end gap-1.5 text-[9px] text-muted-light dark:text-muted-dark">
                  Less
                  {LEVEL_CLASSES.map((cls, i) => (
                    <span
                      key={i}
                      className={`h-[10px] w-[10px] rounded-[2px] ${cls}`}
                    />
                  ))}
                  More
                </div>

                {/* motivational message */}
                <p className="mt-4 text-xs leading-5 text-muted-light dark:text-muted-dark">
                  {activity.message}
                </p>

                {/* summary stats */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat
                    icon={<FaChartBar size={11} />}
                    label={
                      activity.period === "last-12-months"
                        ? "Total Contributions"
                        : `Contributions in ${activity.period}`
                    }
                    value={activity.totalContributions}
                    helper="learning activities"
                  />
                  <MiniStat
                    icon={<FaFire size={11} />}
                    label="Current Streak"
                    value={`${activity.currentStreak} ${
                      activity.currentStreak === 1 ? "day" : "days"
                    }`}
                  />
                  <MiniStat
                    icon={<FaTrophy size={11} />}
                    label="Longest Streak"
                    value={`${activity.longestStreak} ${
                      activity.longestStreak === 1 ? "day" : "days"
                    }`}
                  />
                  <MiniStat
                    icon={<FaCalendarCheck size={11} />}
                    label="Active Days"
                    value={activity.activeDays}
                    helper={`Avg ${activity.averagePerActiveDay}/day`}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ==========================================================
          COMPETITION
      ========================================================== */}

      <div className="border-t border-primary-100 p-5 dark:border-white/5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
              Competitive Progress
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
              How am I doing?
            </h2>
          </div>

          {competition?.subjects?.length > 0 && (
            <div className="relative">
              <select
                value={subject || competition?.subject || ""}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="appearance-none rounded-lg border border-primary-100 bg-white py-2 pl-3 pr-8 text-xs font-medium text-ink-light shadow-soft focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-ink-dark"
              >
                {competition.subjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <FaChevronDown
                size={9}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
              />
            </div>
          )}
        </div>

        {loadingCompetition && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
            <FaSpinner size={11} className="animate-spin" />
            Loading competitive standing...
          </div>
        )}

        {!loadingCompetition && competitionError && (
          <div className="mt-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <FaExclamationTriangle size={11} />
            {competitionError}
          </div>
        )}

        {!loadingCompetition && !competitionError && competition && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              <MiniStat
                icon={<FaUsers size={11} />}
                label="Active Learners"
                value={competition.activeLearners}
                helper={
                  competition.subject
                    ? `Active in ${competition.subject}, last ${competition.activeLearnerWindowDays} days`
                    : `Active in the last ${competition.activeLearnerWindowDays} days`
                }
              />
              <MiniStat
                icon={<FaMedal size={11} />}
                label="Your Rank"
                value={
                  competition.eligible
                    ? `#${competition.rank}`
                    : "—"
                }
                helper={
                  competition.eligible
                    ? `out of ${competition.totalEligible} active learners`
                    : competition.subject
                      ? `in ${competition.subject}`
                      : ""
                }
              />
            </div>

            {competition.eligible ? (
              <div className="mt-4 rounded-lg bg-primary-50/70 p-4 dark:bg-white/3">
                <p className="text-xs font-semibold text-ink-light dark:text-ink-dark">
                  Your Position — #{competition.rank} / {competition.totalEligible}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted-light dark:text-muted-dark">
                  You are currently ahead of {competition.ahead}{" "}
                  {competition.ahead === 1 ? "learner" : "learners"} in{" "}
                  {competition.subject}.
                </p>
                <div className="mt-3 flex gap-4 text-[10px] text-muted-light dark:text-muted-dark">
                  <span>
                    <span className="font-mono font-semibold text-ink-light dark:text-ink-dark">
                      {competition.ahead}
                    </span>{" "}
                    ahead of you
                  </span>
                  <span>
                    <span className="font-mono font-semibold text-ink-light dark:text-ink-dark">
                      {competition.behind}
                    </span>{" "}
                    behind you
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-primary-50/70 p-4 text-center dark:bg-white/3">
                <p className="text-xs text-muted-light dark:text-muted-dark">
                  {competition.message ||
                    "Complete an assessment to establish your learning position."}
                </p>
                <Link
                  to="/dashboard/assessment"
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3.5 py-2 text-xs font-medium text-white hover:bg-primary-600"
                >
                  Take Knowledge Assessment
                  <FaArrowRight size={9} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

/* ============================================================
   EMPTY STATE (brand new user, zero activity ever)
============================================================ */

const EmptyActivityState = () => (
  <div className="py-10 text-center">
    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
      <FaChartBar size={16} />
    </div>
    <h3 className="mt-4 text-sm font-semibold text-ink-light dark:text-ink-dark">
      No learning activity yet
    </h3>
    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-light dark:text-muted-dark">
      Complete an assessment, a mock test, or a study session to start
      building your activity history.
    </p>
    <Link
      to="/dashboard/assessment"
      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
    >
      Start Your First Assessment
      <FaArrowRight size={9} />
    </Link>
  </div>
);

/* ============================================================
   MINI STAT
============================================================ */

const MiniStat = ({ icon, label, value, helper }) => (
  <div className="rounded-xl border border-primary-100 bg-white p-3.5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
      {icon}
    </div>
    <p className="mt-2.5 text-[9px] text-muted-light dark:text-muted-dark">
      {label}
    </p>
    <p className="mt-0.5 font-mono text-base font-semibold text-ink-light dark:text-ink-dark">
      {value}
    </p>
    {helper && (
      <p className="mt-0.5 truncate text-[9px] text-muted-light dark:text-muted-dark">
        {helper}
      </p>
    )}
  </div>
);

export default LearningActivitySection;

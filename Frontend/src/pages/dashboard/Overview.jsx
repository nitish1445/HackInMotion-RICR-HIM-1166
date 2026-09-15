import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaBookOpen,
  FaBrain,
  FaCheckCircle,
  FaChartLine,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaFire,
  FaRobot,
  FaSpinner,
  FaTrophy,
} from "react-icons/fa";

import api from "../../config/Api.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

/* =====================================================
   GREETING
===================================================== */

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/* =====================================================
   PAGE
===================================================== */

const DashboardOverview = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/overview");
      setData(response.data?.data || null);
    } catch (err) {
      console.error("Load dashboard overview error:", err);
      setError(
        err?.response?.data?.message || "Unable to load your dashboard right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const firstName = user?.fullName?.split(" ")[0] || "there";
  const overview = data?.learningOverview;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[400px] w-full max-w-6xl items-center justify-center">
        <FaSpinner size={22} className="animate-spin text-primary-500" />
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
          <FaExclamationTriangle size={20} className="mx-auto text-red-500" />
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            type="button"
            onClick={fetchOverview}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="mt-1.5 text-sm text-muted-light dark:text-muted-dark">
          Here's how you're progressing with your learning.
        </p>
      </div>

      {/* =====================================================
          NO DATA YET
      ===================================================== */}

      {!overview?.hasAnyData && (
        <section className="mt-7 rounded-xl border border-primary-100 bg-white p-10 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaBrain size={22} />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-ink-light dark:text-ink-dark">
            Let's understand your current skills
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-light dark:text-muted-dark">
            Take a short Knowledge Assessment and we'll build your personalized
            performance dashboard from there.
          </p>
          <Link
            to="/dashboard/assessment"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
          >
            Take Assessment
            <FaArrowRight size={10} />
          </Link>
        </section>
      )}

      {overview?.hasAnyData && (
        <>
          {/* =====================================================
              OVERALL PERFORMANCE
          ===================================================== */}

          <section className="mt-7 rounded-xl border border-primary-100 bg-white p-6 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-8">
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
              Your Learning Performance &middot; {overview.focusSubject}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
              <MetricBlock label="Learning Status" value={overview.level || "—"} />
              <MetricBlock
                label="Overall Score"
                value={overview.overallScore !== null ? `${overview.overallScore}%` : "—"}
              />
              <MetricBlock
                label="Improvement"
                value={
                  overview.improvement.hasComparison
                    ? `${overview.improvement.value >= 0 ? "+" : ""}${overview.improvement.value}%`
                    : "—"
                }
                valueClassName={
                  overview.improvement.hasComparison
                    ? overview.improvement.value >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                    : ""
                }
                hint={!overview.improvement.hasComparison ? "Needs 2+ assessments" : null}
              />
              <MetricBlock
                label="Study Streak"
                value={`${data.streak || 0} Day${data.streak === 1 ? "" : "s"}`}
              />
            </div>

            {overview.overallScore !== null && (
              <div className="mt-6">
                <div className="h-2.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-700"
                    style={{ width: `${overview.overallScore}%` }}
                  />
                </div>
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-muted-light dark:text-muted-dark">
              Based on: Knowledge Assessment, Mock Test Performance, Topic Accuracy
              {overview.studyPlan.hasData && ", Study Plan Completion"}.
            </p>
          </section>

          {/* =====================================================
              LEVEL EXPLANATION
          ===================================================== */}

          {overview.levelExplanation && (
            <section className="mt-5 rounded-xl border border-primary-100 bg-primary-50/50 p-5 dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
                Current Level: {overview.level}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-ink-light dark:text-ink-dark">
                {overview.levelExplanation}
              </p>
            </section>
          )}

          {/* =====================================================
              SMART SUMMARY
          ===================================================== */}

          <section className="mt-5 flex items-start gap-3 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaBolt size={13} />
            </div>
            <p className="text-sm leading-6 text-ink-light dark:text-ink-dark">
              {overview.smartSummary}
            </p>
          </section>

          {/* =====================================================
              PERFORMANCE BREAKDOWN
          ===================================================== */}

          <section className="mt-7">
            <h2 className="mb-3 text-sm font-semibold text-ink-light dark:text-ink-dark">
              Your Performance Breakdown
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <BreakdownCard label="Knowledge Assessment" data={overview.breakdown.assessment} />
              <BreakdownCard label="Mock Test Average" data={overview.breakdown.mockTest} />
              <BreakdownCard label="Topic Accuracy" data={overview.breakdown.topicAccuracy} />
              <BreakdownCard
                label="Study Plan Completion"
                data={overview.breakdown.studyPlanCompletion}
              />
            </div>
          </section>

          {/* =====================================================
              TOPIC PERFORMANCE
          ===================================================== */}

          {overview.topics.length > 0 && (
            <section className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">
              <h2 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                Topic Performance &middot; {overview.focusSubject}
              </h2>

              <div className="mt-4 space-y-4">
                {overview.topics.map((t) => (
                  <div key={t.topic}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-light dark:text-ink-dark">{t.topic}</span>
                      <span className="flex items-center gap-2">
                        <CategoryBadge category={t.category} label={t.label} />
                        <span className="font-mono text-muted-light dark:text-muted-dark">
                          {t.score !== null ? `${t.score}%` : "—"}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${categoryBarColor(t.category)}`}
                        style={{ width: `${t.score ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =====================================================
              AREAS TO IMPROVE
          ===================================================== */}

          {overview.improvementTopics.length > 0 && (
            <section className="mt-7">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
                <FaExclamationTriangle size={12} className="text-amber-500" />
                Areas to Improve
              </h2>
              <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
                These topics currently need the most attention.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {overview.improvementTopics.map((t) => (
                  <div
                    key={t.topic}
                    className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                        {t.topic}
                      </p>
                      <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400">
                        {t.score}%
                      </span>
                    </div>
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Needs Improvement
                    </span>
                    <Link
                      to="/dashboard/tests"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:underline"
                    >
                      Practice Now
                      <FaArrowRight size={8} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =====================================================
              STRONG AREAS
          ===================================================== */}

          {overview.strongTopics.length > 0 && (
            <section className="mt-7 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5 dark:border-emerald-900/20 dark:bg-emerald-900/5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
                <FaCheckCircle size={12} className="text-emerald-500" />
                Your Strong Areas
              </h2>
              <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
                You're performing well in these topics. Keep them fresh with occasional practice.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {overview.strongTopics.map((t) => (
                  <span
                    key={t.topic}
                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    {t.topic} &middot; {t.score}%
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* =====================================================
              PROGRESS OVER TIME
          ===================================================== */}

          <section className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
              <FaChartLine size={12} className="text-primary-500" />
              Your Progress
            </h2>

            {overview.progressHistory.length >= 2 ? (
              <div className="mt-5 flex items-end gap-3 sm:gap-4">
                {overview.progressHistory.map((p) => (
                  <div key={p.label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                      {p.percentage}%
                    </span>
                    <div className="flex h-28 w-full items-end rounded-lg bg-primary-50 dark:bg-white/5">
                      <div
                        className="w-full rounded-lg bg-primary-500 transition-all duration-700"
                        style={{ height: `${p.percentage}%` }}
                      />
                    </div>
                    <span className="text-center text-[9px] text-muted-light dark:text-muted-dark">
                      {p.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                Complete more assessments to see your progress trend.
              </p>
            )}
          </section>

          {/* =====================================================
              STUDY PLAN PROGRESS + RECOMMENDATION
          ===================================================== */}

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
                <FaBookOpen size={12} className="text-primary-500" />
                Study Plan Progress
              </h2>

              {overview.studyPlan.hasData ? (
                <>
                  <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                    {overview.studyPlan.goalTitle}
                    {overview.studyPlan.adaptive && (
                      <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-[9px] font-medium uppercase text-primary-500 dark:bg-primary-900/20">
                        Adaptive
                      </span>
                    )}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-ink-light dark:text-ink-dark">
                      {overview.studyPlan.completedDays} / {overview.studyPlan.totalDays} days
                    </span>
                    <span className="font-mono font-semibold text-primary-500">
                      {overview.studyPlan.progress}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-500"
                      style={{ width: `${overview.studyPlan.progress}%` }}
                    />
                  </div>

                  {overview.studyPlan.todayFocus && (
                    <div className="mt-4 rounded-lg bg-primary-50/70 p-3 dark:bg-white/5">
                      <p className="text-[9px] font-mono uppercase tracking-wide text-primary-500">
                        Today's Focus
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink-light dark:text-ink-dark">
                        {overview.studyPlan.todayFocus.topic}
                      </p>
                      {overview.studyPlan.todayFocus.priority === "high" && (
                        <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          High Priority
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    to="/dashboard/study-plan"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
                  >
                    Continue Learning
                    <FaArrowRight size={9} />
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                    Create your personalized study plan.
                  </p>
                  <Link
                    to="/dashboard/goals"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
                  >
                    Set a Goal
                    <FaArrowRight size={9} />
                  </Link>
                </>
              )}
            </section>

            <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
                ✨ Recommended Next Step
              </h2>

              {overview.recommendation ? (
                <>
                  <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                    Your current focus area is:
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-light dark:text-ink-dark">
                    {overview.recommendation.topic}
                  </p>

                  <ol className="mt-3 space-y-1.5">
                    {overview.recommendation.steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-ink-light dark:text-ink-dark"
                      >
                        <span className="font-mono text-primary-500">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  <Link
                    to={
                      overview.recommendation.source === "study-plan"
                        ? "/dashboard/study-plan"
                        : "/dashboard/tests"
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
                  >
                    Start Today's Session
                    <FaArrowRight size={9} />
                  </Link>
                </>
              ) : (
                <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                  You're doing great across your assessed topics — take a mock test to
                  keep sharpening your skills.
                </p>
              )}
            </section>
          </div>

          {/* =====================================================
              MOCK TEST + ASSESSMENT SUMMARY
          ===================================================== */}

          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
                <FaClipboardCheck size={12} className="text-primary-500" />
                Mock Test Performance
              </h2>

              {overview.mockTests.hasData ? (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <MetricBlock label="Tests Completed" value={overview.mockTests.completed} small />
                  <MetricBlock label="Average Score" value={`${overview.mockTests.averageScore}%`} small />
                  <MetricBlock label="Best Score" value={`${overview.mockTests.bestScore}%`} small />
                  <MetricBlock label="Latest Score" value={`${overview.mockTests.latestScore}%`} small />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                    Take your first mock test to see your performance here.
                  </p>
                  <Link
                    to="/dashboard/tests"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:underline"
                  >
                    Start a Mock Test
                    <FaArrowRight size={9} />
                  </Link>
                </>
              )}
            </section>

            <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
                <FaTrophy size={12} className="text-primary-500" />
                Knowledge Assessment
              </h2>

              {overview.assessment.hasData ? (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <MetricBlock label="Current Level" value={overview.assessment.level} small />
                  <MetricBlock label="Score" value={`${overview.assessment.score}%`} small />
                  <MetricBlock label="Topics Assessed" value={overview.assessment.topicsAssessed} small />
                  <MetricBlock
                    label="Needs Improvement"
                    value={`${overview.assessment.needsImprovementCount} topics`}
                    small
                  />
                </div>
              ) : (
                <>
                  <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                    Take the Knowledge Assessment to understand your current level.
                  </p>
                  <Link
                    to="/dashboard/assessment"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:underline"
                  >
                    Start Assessment
                    <FaArrowRight size={9} />
                  </Link>
                </>
              )}

              {overview.assessment.hasData && (
                <Link
                  to="/dashboard/assessment"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-primary-500 hover:underline"
                >
                  Retake Assessment
                  <FaArrowRight size={9} />
                </Link>
              )}
            </section>
          </div>

          {/* =====================================================
              HOW YOUR PLAN ADAPTS
          ===================================================== */}

          <section className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
              <FaRobot size={12} className="text-primary-500" />
              How your plan adapts
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted-light dark:text-muted-dark">
              Your study plan is continuously adjusted using:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Knowledge Assessment", "Mock Test Results", "Topic-wise Accuracy", "Study Progress"].map(
                (item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-300"
                  >
                    <FaCheckCircle size={9} />
                    {item}
                  </span>
                )
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-light dark:text-muted-dark">
              Weak and improvement areas receive more practice time, while strong areas
              receive lighter maintenance revision.
            </p>
          </section>

          {/* =====================================================
              STREAK CARD
          ===================================================== */}

          <section className="mt-7 flex items-center gap-4 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-900/20">
              <FaFire size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                {data.streak || 0}-day study streak
              </p>
              <p className="text-xs text-muted-light dark:text-muted-dark">
                Longest streak: {data.longestStreak || 0} days
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

/* =====================================================
   HELPERS
===================================================== */

const categoryBarColor = (category) => {
  if (category === "strong") return "bg-emerald-500";
  if (category === "weak") return "bg-amber-500";
  if (category === "average") return "bg-primary-500";
  return "bg-primary-200 dark:bg-white/10";
};

/* =====================================================
   METRIC BLOCK
===================================================== */

const MetricBlock = ({ label, value, valueClassName = "", hint, small = false }) => (
  <div>
    <p className="text-[10px] text-muted-light dark:text-muted-dark">{label}</p>
    <p
      className={`mt-1 font-display font-semibold text-ink-light dark:text-ink-dark ${
        small ? "text-base" : "text-2xl"
      } ${valueClassName}`}
    >
      {value}
    </p>
    {hint && <p className="mt-0.5 text-[9px] text-muted-light dark:text-muted-dark">{hint}</p>}
  </div>
);

/* =====================================================
   BREAKDOWN CARD
===================================================== */

const BreakdownCard = ({ label, data }) => (
  <div className="rounded-xl border border-primary-100 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-panel-dark">
    <p className="text-[10px] text-muted-light dark:text-muted-dark">{label}</p>
    {data.available ? (
      <>
        <p className="mt-1.5 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          {data.score}%
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${data.score}%` }}
          />
        </div>
      </>
    ) : (
      <p className="mt-1.5 text-xs text-muted-light dark:text-muted-dark">Not enough data yet</p>
    )}
  </div>
);

/* =====================================================
   CATEGORY BADGE
===================================================== */

const CategoryBadge = ({ category, label }) => {
  const styles = {
    strong: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    average: "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300",
    weak: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    unassessed: "bg-primary-50/50 text-muted-light dark:bg-white/5 dark:text-muted-dark",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${styles[category] || styles.unassessed}`}>
      {label}
    </span>
  );
};

export default DashboardOverview;
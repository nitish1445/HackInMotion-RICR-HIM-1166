import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaBolt,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaFire,
  FaRobot,
  FaTrophy,
  FaTable,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

const DashboardOverview = () => {
  const { user } = useAuth();

  /*
   * Temporary dummy data.
   * Later replace this with:
   * api.get("/user/dashboard")
   */
  const dashboard = {
    progress: 64,
    streak: 7,
    points: 420,
    studyHours: 12,

    activeGoal: {
      title: "Master JavaScript",
      subject: "Web Development",
      progress: 64,
      daysLeft: 18,
    },

    today: [
      {
        id: 1,
        type: "LEARN",
        title: "JavaScript Closures",
        duration: "35 min",
        progress: 100,
        completed: true,
      },
      {
        id: 2,
        type: "PRACTICE",
        title: "Promises & Async/Await",
        duration: "40 min",
        progress: 45,
        completed: false,
      },
      {
        id: 3,
        type: "TEST",
        title: "Async JavaScript Quiz",
        duration: "15 min",
        progress: 0,
        completed: false,
      },
    ],

    recommendation: {
      title: "Focus on asynchronous JavaScript",
      description:
        "Your recent activity suggests that async concepts need a little more attention. A short revision session could improve your understanding before the next test.",
    },

    achievements: [
      {
        id: 1,
        icon: "🔥",
        title: "7 Day Streak",
        description: "Studied for 7 consecutive days",
      },
      {
        id: 2,
        icon: "🎯",
        title: "First Goal",
        description: "Created your first learning goal",
      },
      {
        id: 3,
        icon: "⚡",
        title: "100 Points",
        description: "Reached your first milestone",
      },
    ],
  };

  const firstName = user?.fullName?.split(" ")[0] || "Learner";

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <section className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
              Learning workspace
            </p>

            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
              Welcome back,{" "}
              <span className="text-primary-500">{firstName}</span>.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-light dark:text-muted-dark">
              Your personalized learning path is ready. Here's what you should
              focus on today.
            </p>
          </div>

          <Link
            to="/dashboard/goals/new"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white shadow-soft transition-colors hover:bg-primary-600"
          >
            <FaTable size={11} />
            New learning goal
          </Link>
        </div>
      </section>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<FaBolt size={12} />}
          label="Progress"
          value={`${dashboard.progress}%`}
        />

        <Stat
          icon={<FaFire size={12} />}
          label="Streak"
          value={`${dashboard.streak} days`}
        />

        <Stat
          icon={<FaClock size={12} />}
          label="Study time"
          value={`${dashboard.studyHours}h`}
        />

        <Stat
          icon={<FaTrophy size={12} />}
          label="Points"
          value={dashboard.points}
        />
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* TODAY'S PLAN */}
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

          <div className="divide-y divide-primary-100 dark:divide-white/5">
            {dashboard.today.map((item, index) => (
              <Link
                key={item.id}
                to="/dashboard/study-plan"
                className="group block px-5 py-4 transition-colors hover:bg-primary-50/50 dark:hover:bg-white/[0.02] sm:px-6"
              >
                <div className="flex items-center gap-4">
                  {/* Number */}
                  <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[10px] font-mono text-primary-500 dark:bg-primary-900/20 sm:flex">
                    0{index + 1}
                  </div>

                  {/* Mobile icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20 sm:hidden">
                    {item.completed ? (
                      <FaCheck size={11} />
                    ) : (
                      <FaBookOpen size={11} />
                    )}
                  </div>

                  {/* Content */}
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

                    <h3 className="mt-1 truncate text-sm font-semibold text-ink-light transition-colors group-hover:text-primary-500 dark:text-ink-dark">
                      {item.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all duration-500"
                          style={{
                            width: `${item.progress}%`,
                          }}
                        />
                      </div>

                      <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                        {item.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/5 sm:flex">
                    {item.completed ? (
                      <FaCheck size={9} />
                    ) : (
                      <FaArrowRight size={9} />
                    )}
                  </div>
                </div>

                <div className="mt-2 ml-0 text-[10px] text-muted-light dark:text-muted-dark sm:ml-[52px]">
                  {item.completed
                    ? "Completed"
                    : item.progress > 0
                      ? "Continue learning"
                      : "Ready to start"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ACTIVE GOAL */}
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

            <FaTable size={14} className="text-primary-500" />
          </div>

          <div className="mt-5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
              {dashboard.activeGoal.subject}
            </span>

            <h3 className="mt-2 text-sm font-semibold leading-5 text-ink-light dark:text-ink-dark">
              {dashboard.activeGoal.title}
            </h3>

            {/* Progress */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-light dark:text-muted-dark">
                  Progress
                </span>

                <span className="font-mono text-primary-500">
                  {dashboard.activeGoal.progress}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{
                    width: `${dashboard.activeGoal.progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-light dark:text-muted-dark">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt size={9} />
                {dashboard.activeGoal.daysLeft} days left
              </span>

              <span>On track</span>
            </div>
          </div>

          <Link
            to="/dashboard/study-plan"
            className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-primary-100 py-2.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
          >
            Open study plan
            <FaArrowRight size={9} />
          </Link>
        </section>
      </div>

      {/* =====================================================
          AI INSIGHT
      ===================================================== */}
      <section className="mt-6 rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaRobot size={15} />
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
                {dashboard.recommendation.title}
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-light dark:text-muted-dark">
                {dashboard.recommendation.description}
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/ai-assistant"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600"
          >
            Ask AI
            <FaArrowRight size={9} />
          </Link>
        </div>
      </section>

      {/* =====================================================
          BOTTOM
      ===================================================== */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ACHIEVEMENTS */}
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
              className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-300"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {dashboard.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-primary-50 dark:hover:bg-white/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-base dark:bg-primary-900/20">
                  {achievement.icon}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink-light dark:text-ink-dark">
                    {achievement.title}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-muted-light dark:text-muted-dark">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI TUTOR */}
        <section className="rounded-xl bg-gradient-to-br from-dark to-primary-600 p-5 text-white shadow-soft sm:p-6">
          <FaRobot size={18} className="text-white/70" />

          <p className="mt-5 text-[9px] font-mono uppercase tracking-[0.18em] text-white/50">
            Your AI tutor
          </p>

          <h2 className="mt-1 font-display text-lg font-semibold">
            Need some help?
          </h2>

          <p className="mt-2 text-xs leading-5 text-white/60">
            Ask questions, get simpler explanations, or review something you're
            struggling with.
          </p>

          <Link
            to="/dashboard/ai-assistant"
            className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-white"
          >
            Start conversation
            <FaArrowRight size={9} />
          </Link>
        </section>
      </div>
    </div>
  );
};

const Stat = ({ icon, label, value }) => {
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

export default DashboardOverview;

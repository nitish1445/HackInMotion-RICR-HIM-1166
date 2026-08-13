import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaPlus,
} from "react-icons/fa";

const goals = [
  {
    id: "javascript",
    title: "Master JavaScript",
    subject: "Web Development",
    level: "Intermediate",
    progress: 64,
    completedTopics: 18,
    totalTopics: 28,
    daysLeft: 18,
    status: "active",
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms",
    subject: "Computer Science",
    level: "Beginner",
    progress: 32,
    completedTopics: 8,
    totalTopics: 25,
    daysLeft: 32,
    status: "active",
  },
  {
    id: "react",
    title: "Become Better at React",
    subject: "Frontend Development",
    level: "Intermediate",
    progress: 100,
    completedTopics: 20,
    totalTopics: 20,
    daysLeft: 0,
    status: "completed",
  },
];

const GoalsPage = () => {
  return (
    <div className="mx-auto w-full max-w-7xl">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
            Learning goals
          </p>

          <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
            What are you working toward?
          </h1>

          <p className="mt-2 max-w-xl text-sm text-muted-light dark:text-muted-dark">
            Your goals help EduTech understand what you want to achieve
            and build a study path around you.
          </p>
        </div>

        <Link
          to="/dashboard/goals/new"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-primary-600"
        >
          <FaPlus size={10} />
          New goal
        </Link>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        {goals.map((goal) => (
          <Link
            key={goal.id}
            to={`/dashboard/goals/${goal.id}`}
            className="group rounded-xl border border-primary-100 bg-white p-5 shadow-soft transition-all hover:border-primary-200 hover:shadow-glow dark:border-white/5 dark:bg-panel-dark dark:hover:border-primary-800 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                  {/* <FaTarget size={15} /> */}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                    {goal.subject}
                  </p>

                  <h2 className="mt-1 truncate font-display text-base font-semibold text-ink-light dark:text-ink-dark">
                    {goal.title}
                  </h2>
                </div>
              </div>

              {goal.status === "completed" && (
                <FaCheckCircle
                  size={14}
                  className="shrink-0 text-primary-500"
                />
              )}
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px]">
              <span className="text-muted-light dark:text-muted-dark">
                {goal.level}
              </span>

              <span className="font-mono text-primary-500">
                {goal.progress}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-light dark:text-muted-dark">
              <span>
                {goal.completedTopics} of {goal.totalTopics} topics
              </span>

              {goal.daysLeft > 0 && (
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt size={9} />
                  {goal.daysLeft} days left
                </span>
              )}

              {goal.status === "completed" && (
                <span className="text-primary-500">
                  Completed
                </span>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 text-xs font-medium text-primary-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-primary-300">
              Open goal
              <FaArrowRight size={9} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GoalsPage;
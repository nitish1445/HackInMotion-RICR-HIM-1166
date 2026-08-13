import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheck,
  FaClock,
} from "react-icons/fa";

const GoalDetailPage = () => {
  const { goalId } = useParams();

  const goal = {
    title: "Master JavaScript",
    subject: "Web Development",
    level: "Intermediate",
    progress: 64,
    daysLeft: 18,
    completed: 18,
    total: 28,
  };

  return (
    <div className="mx-auto w-full max-w-5xl">

      <Link
        to="/dashboard/goals"
        className="inline-flex items-center gap-2 text-xs text-muted-light hover:text-primary-500 dark:text-muted-dark"
      >
        <FaArrowLeft size={9} />
        All goals
      </Link>

      <section className="mt-5 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-7">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              {/* <FaTarget size={18} /> */}
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
                {goal.subject}
              </p>

              <h1 className="mt-1 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
                {goal.title}
              </h1>

              <p className="mt-2 text-xs text-muted-light dark:text-muted-dark">
                {goal.level} level · Goal #{goalId}
              </p>
            </div>

          </div>

          <Link
            to="/dashboard/study-plan"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-primary-600"
          >
            Open study plan
            <FaArrowRight size={9} />
          </Link>

        </div>

        <div className="mt-8">

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-light dark:text-muted-dark">
              Overall progress
            </span>

            <span className="font-mono text-xs text-primary-500">
              {goal.progress}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${goal.progress}%` }}
            />
          </div>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <Metric
            icon={<FaCheck size={11} />}
            label="Completed"
            value={goal.completed}
          />

          <Metric
            // icon={<FaTarget size={11} />}
            label="Total topics"
            value={goal.total}
          />

          <Metric
            icon={<FaCalendarAlt size={11} />}
            label="Days left"
            value={goal.daysLeft}
          />

          <Metric
            icon={<FaClock size={11} />}
            label="Status"
            value="On track"
          />

        </div>

      </section>

    </div>
  );
};

const Metric = ({ icon, label, value }) => (
  <div className="rounded-lg bg-primary-50 p-4 dark:bg-white/5">
    <div className="text-primary-500">{icon}</div>

    <p className="mt-3 text-xs font-semibold text-ink-light dark:text-ink-dark">
      {value}
    </p>

    <p className="mt-0.5 text-[10px] text-muted-light dark:text-muted-dark">
      {label}
    </p>
  </div>
);

export default GoalDetailPage;
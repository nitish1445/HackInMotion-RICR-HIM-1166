import React from "react";
import {
  FaBookOpen,
  FaCheck,
  FaClock,
  FaFire,
  FaTrophy,
} from "react-icons/fa";

const ProgressPage = () => {
  return (
    <div className="mx-auto w-full max-w-6xl">

      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Your progress
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          See how far you've come
        </h1>

        <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
          Track learning time, completed topics, assessments, and consistency.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <Metric icon={<FaBookOpen />} value="42" label="Lessons completed" />
        <Metric icon={<FaCheck />} value="18" label="Topics mastered" />
        <Metric icon={<FaClock />} value="12h 30m" label="Study time" />
        <Metric icon={<FaFire />} value="7 days" label="Current streak" />

      </div>

      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
            Learning growth
          </p>

          <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
            Topic mastery
          </h2>
        </div>

        <div className="mt-6 space-y-5">

          {[
            ["JavaScript Fundamentals", 92],
            ["Functions & Closures", 84],
            ["Promises", 68],
            ["Async/Await", 54],
            ["Event Loop", 42],
          ].map(([name, value]) => (
            <div key={name}>

              <div className="flex justify-between text-xs">
                <span className="text-ink-light dark:text-ink-dark">
                  {name}
                </span>

                <span className="font-mono text-primary-500">
                  {value}%
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${value}%` }}
                />
              </div>

            </div>
          ))}

        </div>
      </section>

      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaTrophy size={15} />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">
              You're making steady progress
            </p>

            <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
              You've studied 5 of the last 7 days.
            </p>
          </div>

        </div>

      </section>
    </div>
  );
};

const Metric = ({ icon, value, label }) => (
  <div className="rounded-xl border border-primary-100 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-panel-dark">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
      {React.cloneElement(icon, { size: 12 })}
    </div>

    <p className="mt-3 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
      {value}
    </p>

    <p className="text-[10px] text-muted-light dark:text-muted-dark">
      {label}
    </p>
  </div>
);

export default ProgressPage;
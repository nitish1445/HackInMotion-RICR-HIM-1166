import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaPlay,
} from "react-icons/fa";

const tests = [
  {
    id: "async-js",
    title: "Async JavaScript Knowledge Check",
    topic: "JavaScript",
    questions: 15,
    duration: 20,
    score: null,
    status: "not_started",
  },
  {
    id: "closures",
    title: "Functions & Closures",
    topic: "JavaScript",
    questions: 10,
    duration: 15,
    score: 82,
    status: "completed",
  },
  {
    id: "promises",
    title: "Promises Fundamentals",
    topic: "Asynchronous JavaScript",
    questions: 12,
    duration: 15,
    score: 74,
    status: "completed",
  },
];

const TestsPage = () => {
  return (
    <div className="mx-auto w-full max-w-6xl">

      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Practice & assessment
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Test what you know
        </h1>

        <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
          Your tests are generated around the topics in your personalized study plan.
        </p>
      </div>

      <div className="mt-7 space-y-3">

        {tests.map((test) => (
          <Link
            key={test.id}
            to={`/dashboard/tests/${test.id}`}
            className="group flex flex-col gap-4 rounded-xl border border-primary-100 bg-white p-5 shadow-soft transition-all hover:border-primary-200 hover:shadow-glow dark:border-white/5 dark:bg-panel-dark sm:flex-row sm:items-center sm:p-6"
          >

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              {test.status === "completed" ? (
                <FaCheckCircle size={15} />
              ) : (
                <FaFileAlt size={15} />
              )}
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                {test.topic}
              </p>

              <h2 className="mt-1 truncate text-sm font-semibold text-ink-light dark:text-ink-dark">
                {test.title}
              </h2>

              <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-light dark:text-muted-dark">

                <span>
                  {test.questions} questions
                </span>

                <span className="flex items-center gap-1">
                  <FaClock size={8} />
                  {test.duration} min
                </span>

              </div>

            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">

              {test.score !== null ? (
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-primary-500">
                    {test.score}%
                  </p>

                  <p className="text-[9px] text-muted-light dark:text-muted-dark">
                    Last score
                  </p>
                </div>
              ) : (
                <span className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                  <FaPlay size={8} />
                  Start
                </span>
              )}

              <FaArrowRight
                size={10}
                className="text-muted-light transition-transform group-hover:translate-x-1 dark:text-muted-dark"
              />

            </div>

          </Link>
        ))}

      </div>
    </div>
  );
};

export default TestsPage;
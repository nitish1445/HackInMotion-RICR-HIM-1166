import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaCheck,
  FaChevronDown,
  FaClock,
  FaRobot,
} from "react-icons/fa";

const days = [
  {
    day: "Today",
    date: "Aug 12",
    progress: 66,
    sessions: [
      {
        id: 1,
        type: "LEARN",
        title: "Promises & Async/Await",
        duration: "40 min",
        completed: false,
      },
      {
        id: 2,
        type: "PRACTICE",
        title: "Async JavaScript Exercises",
        duration: "30 min",
        completed: true,
      },
      {
        id: 3,
        type: "TEST",
        title: "Async Concepts Quiz",
        duration: "15 min",
        completed: false,
      },
    ],
  },
  {
    day: "Tomorrow",
    date: "Aug 13",
    progress: 0,
    sessions: [
      {
        id: 4,
        type: "LEARN",
        title: "Event Loop",
        duration: "35 min",
        completed: false,
      },
      {
        id: 5,
        type: "PRACTICE",
        title: "Event Loop Challenges",
        duration: "30 min",
        completed: false,
      },
    ],
  },
  {
    day: "Day 3",
    date: "Aug 14",
    progress: 0,
    sessions: [
      {
        id: 6,
        type: "REVIEW",
        title: "Async JavaScript Revision",
        duration: "25 min",
        completed: false,
      },
    ],
  },
];

const StudyPlanPage = () => {
  const [openDay, setOpenDay] = useState(0);

  return (
    <div className="mx-auto w-full max-w-6xl">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
            Personalized study plan
          </p>

          <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
            Master JavaScript
          </h1>

          <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
            Your plan adapts around your progress, available time, and weak areas.
          </p>
        </div>

        <Link
          to="/dashboard/ai-assistant"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-primary-100 px-3 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
        >
          <FaRobot size={11} />
          Ask AI about my plan
        </Link>

      </div>

      {/* Progress */}
      <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
              Overall progress
            </p>

            <p className="mt-1 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
              64%
            </p>
          </div>

          <div className="sm:w-1/2">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-light dark:text-muted-dark">
                18 of 28 topics
              </span>

              <span className="text-primary-500">
                18 days left
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
              <div className="h-full w-[64%] rounded-full bg-primary-500" />
            </div>
          </div>

        </div>

      </section>

      {/* Days */}
      <div className="mt-6 space-y-3">

        {days.map((day, index) => {
          const isOpen = openDay === index;

          return (
            <section
              key={day.day}
              className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark"
            >

              <button
                type="button"
                onClick={() =>
                  setOpenDay(isOpen ? -1 : index)
                }
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                    <FaCalendarAlt size={12} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                      {day.day}
                    </p>

                    <p className="text-[10px] text-muted-light dark:text-muted-dark">
                      {day.date} · {day.sessions.length} sessions
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <span className="hidden text-[10px] font-mono text-primary-500 sm:block">
                    {day.progress}%
                  </span>

                  <FaChevronDown
                    size={10}
                    className={`text-muted-light transition-transform dark:text-muted-dark ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />

                </div>

              </button>

              {isOpen && (
                <div className="border-t border-primary-100 dark:border-white/5">

                  {day.sessions.map((session) => (
                    <Link
                      key={session.id}
                      to="/dashboard/study-plan"
                      className="group flex items-center gap-4 border-b border-primary-100 px-5 py-4 last:border-b-0 hover:bg-primary-50/50 dark:border-white/5 dark:hover:bg-white/[0.02] sm:px-6"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                        {session.completed ? (
                          <FaCheck size={10} />
                        ) : (
                          <FaBookOpen size={11} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                          {session.type}
                        </p>

                        <h3 className="mt-1 truncate text-sm font-medium text-ink-light dark:text-ink-dark">
                          {session.title}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-light dark:text-muted-dark">
                          <FaClock size={8} />
                          {session.duration}
                        </p>

                      </div>

                      <span className="text-xs text-primary-500 opacity-0 transition-opacity group-hover:opacity-100">
                        Open →
                      </span>

                    </Link>
                  ))}

                </div>
              )}

            </section>
          );
        })}

      </div>
    </div>
  );
};

export default StudyPlanPage;
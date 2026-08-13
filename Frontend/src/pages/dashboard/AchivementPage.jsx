import React from "react";
import { FaCheckCircle, FaLock, FaTrophy } from "react-icons/fa";

const badges = [
  {
    title: "First Step",
    description: "Complete your first lesson",
    icon: "🚀",
    unlocked: true,
  },
  {
    title: "7 Day Streak",
    description: "Study for seven consecutive days",
    icon: "🔥",
    unlocked: true,
  },
  {
    title: "Century",
    description: "Earn 100 learning points",
    icon: "⚡",
    unlocked: true,
  },
  {
    title: "Goal Getter",
    description: "Complete your first learning goal",
    icon: "🎯",
    unlocked: false,
  },
  {
    title: "Test Master",
    description: "Score above 90% in five tests",
    icon: "🏆",
    unlocked: false,
  },
  {
    title: "Consistent Learner",
    description: "Maintain a 30 day learning streak",
    icon: "📚",
    unlocked: false,
  },
];

const AchievementsPage = () => {
  return (
    <div className="mx-auto w-full max-w-6xl">

      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Achievements
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Your milestones
        </h1>

        <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
          Every step counts. Keep learning to unlock new milestones.
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

        {badges.map((badge) => (
          <div
            key={badge.title}
            className={`rounded-xl border p-5 shadow-soft ${
              badge.unlocked
                ? "border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark"
                : "border-primary-100/60 bg-primary-50/40 opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
            }`}
          >

            <div className="flex items-start justify-between">

              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-xl dark:bg-primary-900/20">
                {badge.icon}
              </span>

              {badge.unlocked ? (
                <FaCheckCircle
                  size={14}
                  className="text-primary-500"
                />
              ) : (
                <FaLock
                  size={12}
                  className="text-muted-light dark:text-muted-dark"
                />
              )}

            </div>

            <h2 className="mt-5 text-sm font-semibold text-ink-light dark:text-ink-dark">
              {badge.title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-light dark:text-muted-dark">
              {badge.description}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
};

export default AchievementsPage;
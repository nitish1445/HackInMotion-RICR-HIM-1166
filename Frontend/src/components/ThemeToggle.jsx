import React from "react";

const ThemeToggle = ({ theme, setTheme }) => {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle color theme"
      aria-pressed={isDark}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-primary-200 dark:border-white/5 bg-primary-50 dark:bg-white/5 text-sm shadow-soft transition-all duration-300 hover:border-primary-400 dark:hover:border-white/10 hover:scale-102"
    >
      <span className="transition-transform duration-300">
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
};

export default ThemeToggle;

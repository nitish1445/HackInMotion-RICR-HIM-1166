import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "./dashboard/Sidebar.jsx";
import { FaBars, FaGraduationCap, FaComments } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";

const DashboardPage = ({ theme, setTheme }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const { user, isLogin } = useAuth();
  const profileImage = user?.profileImage?.url || user?.profile || "";
  const displayName = user?.fullName || user?.name || "User";

  return (
    <div className="flex min-h-screen bg-primary-50/40 dark:bg-dark">
      {/* Sidebar */}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Dashboard Navbar */}

        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-primary-100 bg-white/95 px-4 backdrop-blur dark:border-white/5 dark:bg-panel-dark/95 sm:px-6">
          {/* LEFT */}

          <div className="flex items-center gap-3">
            {/* Mobile Menu */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 transition-colors hover:bg-primary-100 dark:bg-white/5 dark:text-primary-300 dark:hover:bg-white/10 lg:hidden"
              aria-label="Open dashboard menu"
            >
              <FaBars size={16} />
            </button>

            {/* EduTech */}
            <div>
              <p className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">
                Dashboard
              </p>

              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-light dark:text-muted-dark">
                Learning workspace
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* Ask AI */}

            <Link
              to="/dashboard/ai-assistant"
              className="hidden items-center gap-2 rounded-lg border border-primary-100 px-3 py-2 text-xs font-medium text-ink-light transition-colors hover:bg-primary-50 sm:inline-flex dark:border-white/5 dark:text-ink-dark dark:hover:bg-white/5"
            >
              <FaComments size={12} className="text-primary-500" />
              Ask AI
            </Link>

            {/* Theme Toggle */}

            <ThemeToggle theme={theme} setTheme={setTheme} />

            {/* Profile */}
            
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-primary-50 dark:hover:bg-white/5"
            >
              {/* User Info */}
              <div className="hidden min-w-0 text-right sm:block">
                <p className="truncate text-sm font-semibold text-ink-light dark:text-ink-dark">
                  Welcome back
                </p>

                <p className="-mt-0.5 truncate text-xs text-muted-light dark:text-muted-dark">
                  {displayName}
                </p>
              </div>

              {/* Profile Image */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary-100 bg-primary-50 transition-colors hover:border-primary-200 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/20">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                    {displayName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
            </Link>

          </div>
        </header>

        {/* Page Content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

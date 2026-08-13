import React, { useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiTarget,
  FiCalendar,
  FiMessageCircle,
  FiFileText,
  FiBarChart2,
  FiAward,
  FiUser,
  FiSettings,
  FiX,
  FiLogOut,
  FiBookOpen,
  FiPlus,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  {
    label: "Overview",
    icon: FiGrid,
    path: "/dashboard",
  },
  {
    label: "Learning Goals",
    icon: FiTarget,
    path: "/dashboard/goals",
  },
  {
    label: "Study Plan",
    icon: FiCalendar,
    path: "/dashboard/study-plan",
  },
  {
    label: "AI Assistant",
    icon: FiMessageCircle,
    path: "/dashboard/ai-assistant",
  },
  {
    label: "Practice Tests",
    icon: FiFileText,
    path: "/dashboard/tests",
  },
  {
    label: "Progress",
    icon: FiBarChart2,
    path: "/dashboard/progress",
  },
  {
    label: "Achievements",
    icon: FiAward,
    path: "/dashboard/achievements",
  },
];

const accountItems = [
  {
    label: "Profile",
    icon: FiUser,
    path: "/dashboard/profile",
  },
];

function NavItems({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {navItems.map(({ label, icon: Icon, path }) => (
        <NavLink
          key={label}
          to={path}
          end={path === "/dashboard"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300"
                : "text-muted-light hover:bg-primary-50 hover:text-primary-600 dark:text-muted-dark dark:hover:bg-white/5 dark:hover:text-primary-300"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                size={17}
                className={isActive ? "text-primary-500" : "transition-colors"}
              />

              <span>{label}</span>

              {label === "AI Assistant" && (
                <span className="ml-auto rounded-md bg-primary-500/10 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider text-primary-500">
                  AI
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function AccountItems({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {accountItems.map(({ label, icon: Icon, path }) => (
        <NavLink
          key={label}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300"
                : "text-muted-light hover:bg-primary-50 hover:text-primary-600 dark:text-muted-dark dark:hover:bg-white/5 dark:hover:text-primary-300"
            }`
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      /*
        Later connect:

        await api.get("/auth/logout");

      Backend clears HTTP-only JWT cookie.
      */

      logout();

      toast.success("Logged out successfully");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      toast.error("Unable to logout");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark lg:flex">
        {/* BRAND */}
        <div className="px-5 py-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-dark text-white font-mono font-semibold">
              &lt;/&gt;
            </span>

            <div className="flex flex-col leading-tight">
              <span className="font-display font-semibold text-base sm:text-lg text-ink-light dark:text-ink-dark tracking-tight">
                EduTech
              </span>

              <span className="-mt-1 text-[9px] sm:text-[10px] font-medium uppercase sm:tracking-wider text-muted-light dark:text-muted-dark">
                A Learning Platform
              </span>
            </div>
          </Link>
        </div>

        {/* DIVIDER */}
        <div className="mx-5 h-px bg-primary-100 dark:bg-white/5" />

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <p className="px-3 pt-2 text-[9px] font-mono uppercase tracking-[0.18em] text-muted-light dark:text-muted-dark">
            Workspace
          </p>

          <div className="mt-3">
            <NavItems />
          </div>

          <div className="my-3 h-px bg-primary-100 dark:bg-white/5" />

          <p className="px-3 pt-2 text-[9px] font-mono uppercase tracking-[0.18em] text-muted-light dark:text-muted-dark">
            Account
          </p>

          <div className="mt-3">
            <AccountItems />
          </div>

          {/* LOGOUT */}
          <div className="mt-3 dark:border-white/5">
            <button
              onClick={handleLogout}
              type="button"
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
            >
              <div className="text-red-500 dark:bg-red-500/10">
                <FiLogOut size={16} />
              </div>

              <div>
                <p className="text-xs font-semibold text-ink-light dark:text-ink-dark">
                  Logout
                </p>

                <p className="-mt-0.5 text-[9px] text-muted-light dark:text-muted-dark">
                  End current session
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* QUICK CREATE */}
        <div className="px-3 pb-3">
          <Link
            to="/dashboard/goals/new"
            className="group flex items-center gap-3 rounded-xl bg-primary-500 px-3 py-2 text-white shadow-soft transition-colors hover:bg-primary-600"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <FiPlus size={16} />
            </span>

            <div>
              <p className="text-sm font-semibold"> Create Learning Goal</p>

            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar */}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* DRAWER */}
          <aside className="relative z-10 flex h-full w-[82vw] max-w-[320px] flex-col border-r border-primary-100 bg-white shadow-2xl dark:border-white/5 dark:bg-panel-dark">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-primary-100 px-5 py-5 dark:border-white/5">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-dark text-white font-mono font-semibold">
                  &lt;/&gt;
                </span>

                <div className="flex flex-col leading-tight">
                  <span className="font-display font-semibold text-lg sm:text-xl text-ink-light dark:text-ink-dark tracking-tight">
                    EduTech
                  </span>

                  <span className="-mt-1 text-[10px] sm:text-[11px] font-medium uppercase sm:tracking-wider text-muted-light dark:text-muted-dark">
                    A Learning Platform
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-light dark:text-muted-dark bg-primary-50 dark:bg-white/5 hover:bg-primary-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Close forgot password modal"
              >
                <FiX className="text-red-500 dark:text-red-700 text-xl" />
              </button>
            </div>

            {/* MOBILE NAV */}
            <div className="flex-1 overflow-y-auto px-3 py-5">
              <p className="px-3 text-[9px] font-mono uppercase tracking-[0.18em] text-muted-light dark:text-muted-dark">
                Workspace
              </p>

              <div className="mt-3">
                <NavItems onNavigate={onClose} />
              </div>

              <div className="my-5 h-px bg-primary-100 dark:bg-white/5" />

              <p className="px-3 text-[9px] font-mono uppercase tracking-[0.18em] text-muted-light dark:text-muted-dark">
                Account
              </p>

              <div className="mt-3">
                <AccountItems onNavigate={onClose} />
              </div>

              {/* MOBILE LOGOUT */}
              <div className="dark:border-white/5">
                <button
                  onClick={handleLogout}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <FiLogOut
                    size={17}
                    className="text-red-500 dark:bg-red-500/10"
                  />

                  <p className="text-xs font-semibold text-ink-light dark:text-ink-dark">
                    Logout
                  </p>
                </button>
              </div>
            </div>

            {/* MOBILE QUICK ACTION */}
            <div className="px-3 pb-4">
              <Link
                to="/dashboard/goals/new"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl bg-primary-500 px-3 py-3 text-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <FiPlus size={16} />
                </span>

                <div>
                  <p className="text-xs font-semibold">New learning goal</p>

                  <p className="text-[9px] text-white/60">
                    Build your personalized path
                  </p>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;

import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/image/logo.png";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  // { label: "Documentation", to: "/documentaion" },
  { label: "Dashboard", to: "/dashboard" },
];

const Header = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, isLogin } = useAuth();
  const profileImage = user?.profileImage?.url || user?.profile || "";
  const displayName = user?.fullName || user?.name || "User";

  const linkClass = ({ isActive }) =>
    `px-2 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-primary-600 dark:text-primary-300 "
        : "text-muted-light dark:text-muted-dark hover:text-primary-600 dark:hover:text-primary-300 hover:bg-primary-50/70 dark:hover:bg-white/5"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-9999 overflow-visible border-b border-primary-100 dark:border-white/5 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md">
      {/* Main Header */}

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mx-auto flex h-16 items-center justify-between ">
          {/* Left: Logo */}

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle theme={theme} setTheme={setTheme} />

            {isLogin && user ? (
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-3 rounded-lg px-2 h-10 hover:bg-primary-50 dark:hover:bg-white/5 transition-colors duration-200"
              >
                <div className="min-w-0 text-right">
                  <p className="text-sm font-semibold text-ink-light dark:text-ink-dark truncate">
                    Welcome back
                  </p>

                  <p className="-mt-0.5 text-xs text-muted-light dark:text-muted-dark">
                    {displayName}
                  </p>
                </div>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-50 dark:bg-primary-900/20">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-ink-light dark:text-ink-dark bg-primary-50 dark:bg-white/5 hover:bg-primary-100 dark:hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                >
                  Log in
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white shadow-soft hover:bg-primary-600 transition-colors duration-200 cursor-pointer"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle theme={theme} setTheme={setTheme} />

            {isLogin && user && (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200 dark:border-white/5 bg-primary-50 dark:bg-white/5 text-sm shadow-soft transition-all duration-300 hover:border-primary-400 dark:hover:border-white/10 hover:scale-105"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary-200 dark:border-white/5 bg-primary-50 dark:bg-white/5 px-1 transition-colors duration-300 hover:border-primary-400 dark:hover:border-white/10"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {/* Top */}
              <span
                className={`absolute h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out ${
                  open ? "rotate-45" : "-translate-y-2"
                }`}
              />

              {/* Middle */}
              <span
                className={`absolute h-0.5 w-6 rounded-full bg-current transition-all duration-200 ${
                  open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
                }`}
              />

              {/* Bottom */}
              <span
                className={`absolute h-0.5 w-6 rounded-full bg-current transition-all duration-300 ease-in-out ${
                  open ? "-rotate-45" : "translate-y-2"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="relative z-10 px-6 py-5 bg-white dark:bg-panel-dark border-t border-primary-100 dark:border-white/5">
          {/* Navigation */}

          <div className="flex flex-col items-center space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  ` w-full rounded-lg px-4 py-3 text-center text-[13px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300 ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300"
                      : "text-ink-light dark:text-ink-dark hover:bg-primary-50 dark:hover:bg-white/5 hover:text-primary-500"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-primary-100 dark:border-white/5" />

          {isLogin && user ? (
            <Link
              to="/dashboard/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg bg-primary-50 dark:bg-white/5 px-4 py-3 hover:bg-primary-100 dark:hover:bg-white/10 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary-200 dark:border-white/5 bg-primary-50 dark:bg-white/5 px-1 transition-colors duration-300 hover:border-primary-400 dark:hover:border-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-light dark:text-ink-dark truncate">
                  Welcome back, {displayName}!
                </p>

                <p className="text-xs text-muted-light dark:text-muted-dark">
                  View Your Insights..
                </p>
              </div>
            </Link>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/login");
                }}
                className="w-full rounded-lg border border-primary-200 dark:border-primary-800 px-4 py-2.5 text-center text-sm font-medium text-ink-light dark:text-ink-dark hover:bg-primary-50 dark:hover:bg-white/5 transition-colors"
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate("/signup");
                }}
                className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-600 transition-colors"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingPage from "../components/Loading";
import ForgetPassword from "../components/publicModal/ForgetPassword";
import toast from "react-hot-toast";
import api from "../config/Api";
import { useAuth } from "../context/AuthContext";

const REMEMBER_KEY = "EDUTECH_REMEMBER";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const rememberedUser = localStorage.getItem(REMEMBER_KEY);

    if (rememberedUser) {
      try {
        const parsedUser = JSON.parse(rememberedUser);
        setUserData({
          email: parsedUser.email || "",
          password: parsedUser.password || "",
        });
        setRememberMe(true);
      } catch (error) {
        console.error("Failed to parse remembered user", error);
        localStorage.removeItem(REMEMBER_KEY);
      }
    }
  }, []);

  const handleClear = () => {
    setUserData({
      email: "",
      password: "",
    });
    setErrors({});
  };

  const handleRememberMe = (checked) => {
    setRememberMe(checked);

    if (checked) {
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      );
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!userData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!userData.password) {
      newErrors.password = "Please enter your password.";
    } else if (userData.password.length < 6) {
      newErrors.password = "Password should contain at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const loggedInUser = response.data.data;
      setUser(loggedInUser);
      setIsLogin(true);

      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_KEY,
          JSON.stringify({
            email: userData.email.trim(),
            password: userData.password,
          }),
        );
        localStorage.setItem("EDUTECH USER", JSON.stringify(loggedInUser));
        sessionStorage.removeItem("EDUTECH USER");
      } else {
        localStorage.removeItem(REMEMBER_KEY);
        localStorage.removeItem("EDUTECH USER");
        sessionStorage.setItem("EDUTECH USER", JSON.stringify(loggedInUser));
      }

      toast.success(response.data.message);
      handleClear();
      navigate("/dashboard");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingPage />}

      <div className="h-[calc(100dvh-4rem)] grid lg:grid-cols-2 overflow-hidden scrollbar-hide">
        {/* Form side */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
          <div className="w-full max-w-sm">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-dark text-white font-mono font-semibold">
                &lt;/&gt;
              </span>
              <h1 className="mt-3 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                Log in to pick up where you left off.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium mb-1.5 ${
                    errors.email
                      ? "text-red-500"
                      : "text-ink-light dark:text-ink-dark"
                  }`}
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={userData.email}
                  onChange={handleChange}
                  placeholder="nitish@example.com"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:outline-none transition-colors duration-200 ${
                    errors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-primary-200 dark:border-primary-800 focus:border-primary-500"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium ${
                      errors.password
                        ? "text-red-500"
                        : "text-ink-light dark:text-ink-dark"
                    }`}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs text-primary-600 dark:text-primary-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:outline-none transition-colors duration-200 pr-16 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-primary-200 dark:border-primary-800 focus:border-primary-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary-600 dark:text-primary-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => handleRememberMe(e.target.checked)}
                    className="h-3 w-3 rounded border-primary-200 dark:border-primary-800 text-primary-500 focus:ring-primary-500 cursor-pointer"
                  />

                  <span className="text-sm text-muted-light dark:text-muted-dark">
                    Remember me
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-200 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-center text-muted-light dark:text-muted-dark">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary-600 dark:text-primary-300 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Visual side */}
        <div className="hidden lg:flex items-center justify-center bg-linear-to-br from-primary-600 to-dark relative overflow-hidden">
          <div className="grid-fade absolute inset-0 opacity-40"></div>
          <div className="relative terminal-window w-full max-w-md mx-8 bg-white/95 dark:bg-panel-dark/95">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-400"></span>
              <span className="terminal-dot bg-yellow-400"></span>
              <span className="terminal-dot bg-green-400"></span>
              <span className="ml-2 text-xs font-mono text-muted-light dark:text-muted-dark">
                session.log
              </span>
            </div>
            <div className="p-5 code-line text-ink-light dark:text-ink-dark">
              <p>
                <span className="text-success">✓</span> streak: 18 days
              </p>
              <p>
                <span className="text-success">✓</span> points: 3,420
              </p>
              <p>
                <span className="text-success">✓</span> level: 12
              </p>
              <p className="text-muted-light dark:text-muted-dark mt-3">
                // welcome back, keep shipping
              </p>
            </div>
          </div>
        </div>

        {forgotPasswordOpen && (
          <ForgetPassword onclose={() => setForgotPasswordOpen(false)} />
        )}
      </div>
    </>
  );
};

export default LoginPage;

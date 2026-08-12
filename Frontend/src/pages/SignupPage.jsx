import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../config/Api";
import LoadingPage from "../components/Loading";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin } = useAuth();

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [validError, setValidError] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleClear = () => {
    setUserData({
      fullName: "",
      email: "",
      password: "",
    });

    setValidError({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove field error while typing
    setValidError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    let Error = {};

    // Name validation
    if (userData.fullName.trim().length === 0) {
      Error.fullName = "Please enter your full name.";
    } else if (userData.fullName.trim().length < 3) {
      Error.fullName = "Name should contain at least three letters.";
    } else if (!/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(userData.fullName.trim())) {
      Error.fullName = "Enter a valid name using letters and spaces only.";
    }

    // Email validation
    if (userData.email.trim().length === 0) {
      Error.email = "Please enter your email.";
    } else if (
      !/^[\w.+-]+@(gmail|outlook|yahoo|zohomail)\.(com|in|co\.in)$/.test(
        userData.email.trim().toLowerCase(),
      )
    ) {
      Error.email = "Use a valid Gmail, Outlook, Yahoo, or Zoho email.";
    }

    // Password validation
    if (userData.password.length === 0) {
      Error.password = "Please create a password.";
    } else if (userData.password.length < 6) {
      Error.password = "Password should contain at least 6 characters.";
    }

    setValidError(Error);

    return Object.keys(Error).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", {
        fullName: userData.fullName.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const loggedInUser = response.data.data;
      setUser(loggedInUser);
      setIsLogin(true);
      sessionStorage.setItem("EDUTECH USER", JSON.stringify(loggedInUser));
      localStorage.removeItem("EDUTECH USER");

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

      <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] grid lg:grid-cols-2 overflow-y-auto">
        {/* Terminal Side */}
        <div className="hidden lg:flex items-center justify-center bg-linear-to-br from-dark to-primary-600 relative overflow-hidden order-2 lg:order-1 px-6">
          <div className="grid-fade absolute inset-0 opacity-40" />

          {/* Hero Section */}
          <div className="relative terminal-window w-full max-w-md bg-white/95 dark:bg-panel-dark/95">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-400"></span>
              <span className="terminal-dot bg-yellow-400"></span>
              <span className="terminal-dot bg-green-400"></span>

              <span className="ml-2 text-xs font-mono text-muted-light dark:text-muted-dark">
                new-user.js
              </span>
            </div>

            <div className="p-5 code-line text-ink-light dark:text-ink-dark">
              <p>
                <span className="text-primary-500">const</span> learner = {"{"}
              </p>

              <p className="pl-4">level: 1,</p>
              <p className="pl-4">points: 0,</p>
              <p className="pl-4">streak: 0,</p>

              <p className="pl-4">
                path:{" "}
                <span className="text-primary-500">"just getting started"</span>
              </p>

              <p>{"}"}</p>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-6 order-1 lg:order-2">
          <div className="w-full max-w-sm">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary-500 to-dark text-white font-mono font-semibold">
                &lt;/&gt;
              </span>

              <h1 className="mt-3 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
                Start your first learning path in under two minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium mb-1.5 ${
                    validError.fullName
                      ? "text-red-500"
                      : "text-ink-light dark:text-ink-dark"
                  }`}
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="fullName"
                  type="text"
                  required
                  value={userData.fullName}
                  onChange={handleChange}
                  placeholder="Nitish Kumar"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:outline-none transition-colors duration-200 ${
                    validError.fullName
                      ? "border-red-300 focus:border-red-500"
                      : "border-primary-200 dark:border-primary-800 focus:border-primary-500"
                  }`}
                />

                {validError.fullName && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {validError.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className={`block text-sm font-medium mb-1.5 ${
                    validError.email
                      ? "text-red-500"
                      : "text-ink-light dark:text-ink-dark"
                  }`}
                >
                  Email
                </label>

                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  value={userData.email}
                  onChange={handleChange}
                  placeholder="nitish@example.com"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:outline-none transition-colors duration-200 ${
                    validError.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-primary-200 dark:border-primary-800 focus:border-primary-500"
                  }`}
                />

                {validError.email && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {validError.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className={`block text-sm font-medium mb-1.5 ${
                    validError.password
                      ? "text-red-500"
                      : "text-ink-light dark:text-ink-dark"
                  }`}
                >
                  Password
                </label>

                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  value={userData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:outline-none transition-colors duration-200 ${
                    validError.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-primary-200 dark:border-primary-800 focus:border-primary-500"
                  }`}
                />

                {validError.password ? (
                  <p className="mt-1.5 text-xs text-red-500">
                    {validError.password}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-light dark:text-muted-dark">
                    At least 6 characters.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-200 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-5 text-sm text-center text-muted-light dark:text-muted-dark">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-300 font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;

import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";

const ForgetPassword = ({ onclose }) => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleSendOtp = (e) => {
    e.preventDefault();

    // Later:
    // API call -> send OTP to email

    setStep("otp");
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    // Later:
    // API call -> verify OTP

    setStep("password");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    // Later:
    // API call -> update password

    onclose();
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      onClick={onclose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-panel-dark p-6 shadow-2xl border border-primary-100 dark:border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-primary-500">
              Account recovery
            </p>

            <h2 className="mt-2 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
              {step === "email" && "Forgot your password?"}
              {step === "otp" && "Verify your email"}
              {step === "password" && "Create new password"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
              {step === "email" &&
                "Enter your email address and we'll send you a verification code."}

              {step === "otp" && `Enter the OTP sent to ${email}.`}

              {step === "password" &&
                "Your email has been verified. Create a new password for your account."}
            </p>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onclose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-light dark:text-muted-dark bg-primary-50 dark:bg-white/5 hover:bg-primary-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close forgot password modal"
          >
            <RxCross2 className="text-red-500 dark:text-red-700 text-xl" />
          </button>
        </div>

        {/* =====================================================
            STEP 1 — EMAIL
        ====================================================== */}

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="mt-6">
            <label
              htmlFor="forgot-email"
              className="block text-sm font-medium text-ink-light dark:text-ink-dark mb-1.5"
            >
              Email
            </label>

            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:border-primary-500 outline-none transition-colors duration-200"
            />

            <button
              type="submit"
              className="mt-5 w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-200 shadow-soft"
            >
              Send OTP
            </button>
          </form>
        )}

        {/* =====================================================
            STEP 2 — OTP
        ====================================================== */}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-6">
            <label
              htmlFor="forgot-otp"
              className="block text-sm font-medium text-ink-light dark:text-ink-dark mb-1.5"
            >
              Verification code
            </label>

            <input
              id="forgot-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-2.5 rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:border-primary-500 outline-none transition-colors duration-200 text-center tracking-[0.3em] font-mono"
            />

            <button
              type="submit"
              className="mt-5 w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-200 shadow-soft"
            >
              Verify OTP
            </button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="mt-3 w-full text-sm text-primary-600 dark:text-primary-300 hover:underline"
            >
              Change email
            </button>
          </form>
        )}

        {/* =====================================================
            STEP 3 — NEW PASSWORD
        ====================================================== */}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="mt-6">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-ink-light dark:text-ink-dark mb-1.5"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a new password"
                className="w-full px-4 py-2.5 pr-16 rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark text-ink-light dark:text-ink-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:border-primary-500 outline-none transition-colors duration-200"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary-600 dark:text-primary-300"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="mt-1.5 text-xs text-muted-light dark:text-muted-dark">
              Password must be at least 6 characters.
            </p>

            <button
              type="submit"
              className="mt-5 w-full py-2.5 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors duration-200 shadow-soft"
            >
              Reset password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;

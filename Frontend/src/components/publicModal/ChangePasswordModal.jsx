import React, { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-hot-toast";
import api from "../../config/Api.jsx";

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(res.data?.message || "Password updated successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      onClose();
    } catch (error) {
      console.error("Change password error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to change password. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white shadow-xl dark:bg-panel-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-primary-100 px-5 py-4 dark:border-white/5">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-primary-500">
              Security
            </p>

            <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
              Change password
            </h2>

            <p className="mt-1 text-[11px] leading-4 text-muted-light dark:text-muted-dark">
              Update your EduTech account password.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-muted-light transition-colors hover:bg-primary-100 dark:bg-white/5 dark:text-muted-dark dark:hover:bg-white/10 cursor-pointer"
            aria-label="Close Change Password"
          >
            <RxCross2 className="text-red-500" size={17} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          {/* Info */}
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-primary-50 px-4 py-2 dark:bg-primary-900/20">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-primary-500 dark:bg-panel-dark">
              <FaLock size={12} />
            </div>

            <p className="text-[11px] leading-4 text-muted-light dark:text-muted-dark">
              Use at least 6 characters for your new password.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Current password */}
          <div>
            <label
              htmlFor="current-password"
              className="mb-1 block text-xs font-medium text-ink-light dark:text-ink-dark"
            >
              Current password
            </label>

            <div className="relative">
              <input
                id="current-password"
                name="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setError("");
                }}
                required
                className="w-full rounded-lg border border-primary-200 bg-white px-3 py-2 pr-14 text-xs text-ink-light outline-none transition-colors focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-primary-600 dark:text-primary-300 cursor-pointer"
              >
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="mt-4">
            <label
              htmlFor="new-password"
              className="mb-1 block text-xs font-medium text-ink-light dark:text-ink-dark"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="new-password"
                name="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                minLength={6}
                required
                className="w-full rounded-lg border border-primary-200 bg-white px-3 py-2 pr-14 text-xs text-ink-light outline-none transition-colors focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-primary-600 dark:text-primary-300 cursor-pointer"
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="mt-4">
            <label
              htmlFor="confirm-password"
              className="mb-1 block text-xs font-medium text-ink-light dark:text-ink-dark"
            >
              Confirm new password
            </label>

            <div className="relative">
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                minLength={6}
                required
                className="w-full rounded-lg border border-primary-200 bg-white px-3 py-2 pr-14 text-xs text-ink-light outline-none transition-colors focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-primary-600 dark:text-primary-300 cursor-pointer"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-primary-200 px-3 py-2 text-xs font-medium text-ink-light transition-colors hover:bg-primary-50 disabled:opacity-50 dark:border-primary-800 dark:text-ink-dark dark:hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !currentPassword ||
                newPassword.length < 6 ||
                newPassword !== confirmPassword
              }
              className="flex-1 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

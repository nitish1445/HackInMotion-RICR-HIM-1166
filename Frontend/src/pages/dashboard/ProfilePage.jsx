import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaEdit,
  FaEnvelope,
  FaCalendarAlt,
  FaLock,
  FaTrophy,
  FaSignOutAlt,
  FaChevronRight,
  FaFire,
  FaStar,
  FaPhone,
  FaUser,
} from "react-icons/fa";

import ChangePasswordModal from "../../components/publicModal/ChangePasswordModal.jsx";
import ProfileSettingsModal from "../../components/publicModal/ProfileSettingModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../config/Api.jsx";
import { toast } from "react-hot-toast";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const displayName = user.fullName || "User Name";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const profileImage = user.profileImage?.url;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const badges = user.badges || [];

  const handleLogout = async () => {
    try {
      const response = await api.get("/auth/logout");
      toast.success(response?.data?.message);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <main className="min-h-screen ">
      <div className="mx-auto max-w-5xl pt-2 pb-16 sm:px-6 lg:px-8">
        {/* Profile Header */}

        <section className="overflow-hidden rounded-2xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark">
          {/* Cover */}
          <div className="relative h-28 overflow-hidden bg-linear-to-br from-dark via-primary-600 to-primary-500 sm:h-36">
            <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full border border-white/10" />

            <div className="absolute right-5 top-5 text-[9px] font-mono uppercase tracking-[0.25em] text-white/40">
              EDUTECH / PROFILE
            </div>
          </div>

          {/* Identity */}
          <div className="relative px-5 pb-6 sm:px-8">
            <div className="-mt-11 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                {/* Avatar */}
                <div className="flex h-22 w-22 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary-50 shadow-soft dark:border-panel-dark dark:bg-primary-900/30 sm:h-24 sm:w-24">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-2xl font-semibold text-primary-600 dark:text-primary-300">
                      {initials}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="min-w-0 pb-1">
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/80">
                    Your profile
                  </p>

                  <h1 className="mt-1 truncate font-display text-xl font-semibold text-ink-light dark:text-ink-dark sm:text-2xl">
                    {displayName}
                  </h1>

                  <p className="mt-1 text-xs capitalize text-muted-light dark:text-muted-dark">
                    {user.role || "student"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProfileSettingsOpen(true)}
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-600 cursor-pointer"
              >
                <FaEdit size={12} />
                Edit profile
              </button>
            </div>

            {/* Bio */}
            <div className="mt-5 max-w-2xl">
              <p className="text-sm leading-6 text-muted-light dark:text-muted-dark">
                {user.bio ||
                  "Full-stack developer in progress - Learn. Practice. Progress."}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-primary-100 bg-white p-4 dark:border-white/5 dark:bg-panel-dark">
            <FaStar className="text-primary-500" size={13} />

            <p className="mt-3 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
              {(user.points || 0).toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-muted-light dark:text-muted-dark">
              Points
            </p>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-white p-4 dark:border-white/5 dark:bg-panel-dark">
            <FaFire className="text-primary-500" size={13} />

            <p className="mt-3 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
              {user.streak || 0}
            </p>

            <p className="mt-1 text-[10px] text-muted-light dark:text-muted-dark">
              Day streak
            </p>
          </div>

          <div className="rounded-2xl border border-primary-100 bg-white p-4 dark:border-white/5 dark:bg-panel-dark">
            <FaTrophy className="text-primary-500" size={13} />

            <p className="mt-3 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
              {badges.length}
            </p>

            <p className="mt-1 text-[10px] text-muted-light dark:text-muted-dark">
              Badges Earned
            </p>
          </div>
        </div>

        {/* Account + Security */}
        <div className="mt-5 grid gap-5 lg:grid-cols-5">
          {/* Account */}
          <section className="rounded-2xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark lg:col-span-3">
            <div className="border-b border-primary-100 px-6 py-5 dark:border-white/5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
                Account
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                Personal details
              </h2>
            </div>

            <div className="divide-y divide-primary-100 dark:divide-white/5">
              {/* Full Name */}
              <div className="flex items-center justify-between gap-5 px-6 py-5">
                <div className="min-w-0">
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Full name
                  </p>

                  <p className="mt-1 text-sm font-medium text-ink-light dark:text-ink-dark">
                    {user.fullName}
                  </p>
                </div>
                <FaUser
                  size={13}
                  className="text-muted-light dark:text-muted-dark"
                />
              </div>

              {/* Email */}
              <div className="flex items-center justify-between gap-5 px-6 py-5">
                <div className="min-w-0">
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Email address
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-ink-light dark:text-ink-dark">
                    {user.email}
                  </p>
                </div>

                <FaEnvelope
                  size={13}
                  className="shrink-0 text-muted-light dark:text-muted-dark"
                />
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between gap-5 px-6 py-5">
                <div className="min-w-0">
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Phone number
                  </p>

                  <p className="mt-1 text-sm font-medium text-ink-light dark:text-ink-dark">
                    {user.mobileNumber || "Not provided"}
                  </p>
                </div>
                <FaPhone
                  size={13}
                  className="text-muted-light dark:text-muted-dark"
                />
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between gap-5 px-6 py-5">
                <div>
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Member since
                  </p>

                  <p className="mt-1 text-sm font-medium text-ink-light dark:text-ink-dark">
                    {memberSince}
                  </p>
                </div>

                <FaCalendarAlt
                  size={13}
                  className="text-muted-light dark:text-muted-dark"
                />
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="rounded-2xl border border-primary-100 bg-white dark:border-white/5 dark:bg-panel-dark lg:col-span-2">
            <div className="border-b border-primary-100 px-6 py-5 dark:border-white/5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
                Security
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                Account security
              </h2>
            </div>

            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                <FaLock size={15} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-ink-light dark:text-ink-dark">
                Password
              </h3>

              <p className="mt-2 text-xs leading-5 text-muted-light dark:text-muted-dark">
                Keep your EduTech account secure by updating your password.
              </p>

              <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary-600 hover:underline dark:text-primary-300 cursor-pointer"
              >
                Change password
                <FaChevronRight size={9} />
              </button>
            </div>
          </section>
        </div>

        {/* Achievements */}
        <section className="mt-5 rounded-2xl border border-primary-100 bg-white p-6 dark:border-white/5 dark:bg-panel-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-primary-500">
                Achievements
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                Badges you've earned
              </h2>
            </div>

            <FaTrophy size={15} className="text-primary-500" />
          </div>

          {badges.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {badges.map((badge, index) => (
                <div
                  key={badge.id || index}
                  className="flex min-w-37.5 flex-1 items-center gap-3 rounded-xl bg-primary-50 p-4 dark:bg-white/3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg dark:bg-panel-dark">
                    {badge.icon || "🏆"}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-ink-light dark:text-ink-dark">
                      {badge.name || "Achievement"}
                    </p>

                    <p className="mt-1 text-[10px] text-muted-light dark:text-muted-dark">
                      Achievement unlocked
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-primary-50 p-5 dark:bg-white/3">
              <p className="text-sm font-medium text-ink-light dark:text-ink-dark">
                No badges yet
              </p>

              <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
                Complete lessons, tests, and study goals to earn your first
                achievement.
              </p>
            </div>
          )}
        </section>

        {/* Logout */}
        <section className="mt-5 rounded-2xl border border-red-100 bg-white p-6 dark:border-red-900/30 dark:bg-panel-dark">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-red-500">
                Account action
              </p>

              <h2 className="mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
                Sign out
              </h2>

              <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">
                Sign out from your current EduTech session.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10 cursor-pointer"
            >
              <FaSignOutAlt size={12} />
              Log out
            </button>
          </div>
        </section>

        {profileSettingsOpen && (
          <ProfileSettingsModal
            onClose={() => setProfileSettingsOpen(false)}
          />
        )}

        {changePasswordOpen && (
          <ChangePasswordModal
            onClose={() => setChangePasswordOpen(false)}
          />
        )}
      </div>
    </main>
  );
};

export default ProfilePage;

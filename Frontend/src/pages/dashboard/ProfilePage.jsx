import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaEnvelope,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext.jsx";

const ProfilePage = () => {
  const { user } = useAuth();

  const displayName = user?.fullName || "Learner";

  return (
    <div className="mx-auto w-full max-w-4xl">

      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Account
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Your profile
        </h1>
      </div>

      <section className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-7">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary-100 bg-primary-50 dark:border-white/5 dark:bg-primary-900/20">

            {user?.photo?.url ? (
              <img
                src={user.photo.url}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-primary-500">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}

          </div>

          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
              {displayName}
            </h2>

            <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">
              {user?.bio ||
                "Full-stack developer in progress. Learn, Practice, Progress."}
            </p>
          </div>

        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">

          <Info
            icon={<FaUser size={11} />}
            label="Full name"
            value={user?.fullName || "Not provided"}
          />

          <Info
            icon={<FaEnvelope size={11} />}
            label="Email"
            value={user?.email || "Not provided"}
          />

          <Info
            icon={<FaPhone size={11} />}
            label="Mobile number"
            value={user?.mobileNumber || "Not provided"}
          />

          <Info
            icon={<FaUser size={11} />}
            label="Account role"
            value={user?.role || "user"}
          />

        </div>

        <Link
          to="/dashboard/settings"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white hover:bg-primary-600"
        >
          Edit profile
          <FaArrowRight size={9} />
        </Link>

      </section>
    </div>
  );
};

const Info = ({ icon, label, value }) => (
  <div className="rounded-lg bg-primary-50 p-4 dark:bg-white/5">

    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-primary-500 dark:bg-panel-dark">
      {icon}
    </div>

    <p className="mt-3 text-[10px] text-muted-light dark:text-muted-dark">
      {label}
    </p>

    <p className="mt-0.5 truncate text-sm font-medium text-ink-light dark:text-ink-dark">
      {value}
    </p>

  </div>
);

export default ProfilePage;
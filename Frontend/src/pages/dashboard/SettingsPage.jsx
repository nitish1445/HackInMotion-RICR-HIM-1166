import React, { useState } from "react";
import { FaBell, FaLock, FaSave, FaUser } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";

const SettingsPage = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    bio:
      user?.bio ||
      "Full-stack developer in progress. Learn, Practice, Progress.",
    email: user?.email || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    /*
      Later:

      await api.put("/user/profile", form);
    */

    toast.success("Profile updated successfully");
  };

  return (
    <div className="mx-auto w-full max-w-4xl">

      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Account settings
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Settings
        </h1>

        <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
          Manage your profile and learning preferences.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="mt-7 space-y-5"
      >

        {/* Profile */}
        <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaUser size={12} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                Profile information
              </h2>

              <p className="text-[10px] text-muted-light dark:text-muted-dark">
                Update your basic information
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-4">

            <Field
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
                Bio
              </label>

              <textarea
                name="bio"
                rows={3}
                value={form.bio}
                onChange={handleChange}
                className="w-full resize-none rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light outline-none focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
              />
            </div>

          </div>

        </section>

        {/* Notifications */}
        <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaBell size={12} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                Learning reminders
              </h2>

              <p className="text-[10px] text-muted-light dark:text-muted-dark">
                Stay consistent with your learning
              </p>
            </div>

          </div>

          <div className="mt-5 flex items-center justify-between">

            <div>
              <p className="text-xs font-medium text-ink-light dark:text-ink-dark">
                Daily study reminder
              </p>

              <p className="mt-1 text-[10px] text-muted-light dark:text-muted-dark">
                Remind me when I have unfinished sessions
              </p>
            </div>

            <div className="h-5 w-9 rounded-full bg-primary-500 p-0.5">
              <div className="ml-auto h-4 w-4 rounded-full bg-white" />
            </div>

          </div>

        </section>

        {/* Security */}
        <section className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaLock size={12} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                Security
              </h2>

              <p className="text-[10px] text-muted-light dark:text-muted-dark">
                Keep your account protected
              </p>
            </div>

          </div>

          <button
            type="button"
            className="mt-5 rounded-lg border border-primary-100 px-4 py-2.5 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
          >
            Change password
          </button>

        </section>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-xs font-medium text-white hover:bg-primary-600"
        >
          <FaSave size={10} />
          Save changes
        </button>

      </form>
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  type = "text",
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
      {label}
    </label>

    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light outline-none focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
    />
  </div>
);

export default SettingsPage;
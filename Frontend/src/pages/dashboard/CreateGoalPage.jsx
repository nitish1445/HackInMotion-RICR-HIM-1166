import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaGraduationCap,
  FaLayerGroup,
  FaRocket,
  FaSpinner,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../config/Api.jsx";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subject: "",
    level: "Beginner",
    hoursPerDay: "1",
    totalTopics: "10",
    deadline: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =====================================================
     CALCULATE ESTIMATE
  ===================================================== */

  const estimated = useMemo(() => {
    const topics = Number(form.totalTopics) || 0;
    const hours = Number(form.hoursPerDay) || 0;

    if (!topics || !hours) {
      return {
        days: 0,
        hours: 0,
      };
    }

    /*
      Approximation:
      1 topic = around 1 hour
    */

    const totalHours = topics;

    const days = Math.ceil(totalHours / hours);

    return {
      days,
      hours: totalHours,
    };
  }, [form.totalTopics, form.hoursPerDay]);

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    /* -----------------------------
       FRONTEND VALIDATION
    ----------------------------- */

    if (!form.title.trim()) {
      toast.error("Please enter your learning goal.");
      return;
    }

    if (!form.subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }

    if (!form.deadline) {
      toast.error("Please select a target deadline.");
      return;
    }

    if (!form.totalTopics || Number(form.totalTopics) <= 0) {
      toast.error("Please enter a valid number of topics.");
      return;
    }

    if (!form.hoursPerDay || Number(form.hoursPerDay) <= 0) {
      toast.error("Please enter your available study time.");
      return;
    }

    /* -----------------------------
       CHECK DEADLINE
    ----------------------------- */

    const selectedDate = new Date(form.deadline);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Deadline cannot be in the past.");
      return;
    }

    /* -----------------------------
       API REQUEST
    ----------------------------- */

    try {
      setLoading(true);

      const response = await api.post("/goals", {
        title: form.title.trim(),

        subject: form.subject.trim(),

        level: form.level,

        description: form.description.trim(),

        totalTopics: Number(form.totalTopics),

        targetDate: form.deadline,
      });

      if (response.data?.success) {
        toast.success("Learning goal created successfully!");

        /*
          Go back to Goals page.
          GoalsPage will fetch fresh data from backend.
        */

        navigate("/dashboard/goals");
      }
    } catch (error) {
      console.error("Create goal error:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to create your learning goal.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* BACK */}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted-light transition-colors hover:text-primary-500 dark:text-muted-dark"
      >
        <FaArrowLeft size={9} />
        Back
      </button>

      {/* HEADER */}

      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          New learning goal
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          What do you want to learn?
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-light dark:text-muted-dark">
          Tell EduTech what you're trying to achieve. We'll use
          your goal, current level, available time and deadline
          to build your learning path.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-7"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* GOAL */}

          <Input
            label="Learning goal"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Master JavaScript"
            icon={<FaGraduationCap size={12} />}
            required
          />

          {/* SUBJECT */}

          <Input
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Web Development"
            icon={<FaBookOpen size={12} />}
            required
          />

          {/* LEVEL */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
              Current knowledge
            </label>

            <div className="relative">
              <FaLayerGroup
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
              />

              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full appearance-none rounded-lg border border-primary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-ink-light outline-none transition-colors focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
              >
                <option value="Beginner">Beginner</option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* HOURS */}

          <Input
            label="Available time per day"
            name="hoursPerDay"
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={form.hoursPerDay}
            onChange={handleChange}
            placeholder="1"
            icon={<FaClock size={12} />}
            required
          />

          {/* TOTAL TOPICS */}

          <Input
            label="Total topics"
            name="totalTopics"
            type="number"
            min="1"
            max="500"
            step="1"
            value={form.totalTopics}
            onChange={handleChange}
            placeholder="e.g. 20"
            icon={<FaLayerGroup size={12} />}
            required
          />

          {/* DEADLINE */}

          <Input
            label="Target deadline"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            icon={<FaCalendarAlt size={12} />}
            required
            min={new Date().toISOString().split("T")[0]}
          />

          {/* DESCRIPTION */}

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
              Goal description
              <span className="ml-1 text-xs font-normal text-muted-light dark:text-muted-dark">
                (optional)
              </span>
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              placeholder="What exactly do you want to achieve?"
              className="w-full resize-none rounded-lg border border-primary-200 bg-white px-4 py-3 text-sm text-ink-light outline-none transition-colors placeholder:text-muted-light/60 focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
            />

            <div className="mt-1 flex justify-end">
              <span className="text-[9px] text-muted-light dark:text-muted-dark">
                {form.description.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* ESTIMATION */}

        {estimated.days > 0 && (
          <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50/60 p-4 dark:border-primary-900/30 dark:bg-primary-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
                <FaClock size={12} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink-light dark:text-ink-dark">
                  Estimated learning pace
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-light dark:text-muted-dark">
                  At{" "}
                  <span className="font-medium text-primary-500">
                    {form.hoursPerDay} hour
                    {Number(form.hoursPerDay) !== 1
                      ? "s"
                      : ""}
                  </span>{" "}
                  per day, completing{" "}
                  <span className="font-medium text-primary-500">
                    {form.totalTopics} topics
                  </span>{" "}
                  may take around{" "}
                  <span className="font-medium text-primary-500">
                    {estimated.days} days
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WHAT HAPPENS */}

        <div className="mt-6 rounded-xl border border-primary-100 bg-white p-4 dark:border-white/5 dark:bg-white/2">
          <div className="flex items-center gap-2">
            <FaRocket
              size={12}
              className="text-primary-500"
            />

            <p className="text-xs font-semibold text-ink-light dark:text-ink-dark">
              What happens next?
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Step
              number="01"
              title="Goal saved"
              description="Your learning goal is stored securely."
            />

            <Step
              number="02"
              title="Track progress"
              description="Complete topics to increase your progress."
            />

            <Step
              number="03"
              title="Stay consistent"
              description="Use your goal to follow your learning path."
            />
          </div>
        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <FaSpinner
                size={11}
                className="animate-spin"
              />

              Creating goal...
            </>
          ) : (
            <>
              Create personalized plan
              <FaArrowRight size={10} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

/* =========================================================
   INPUT
========================================================= */

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  min,
  max,
  step,
  required = false,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
        {label}

        {required && (
          <span className="ml-1 text-primary-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500">
            {icon}
          </span>
        )}

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          className={`w-full rounded-lg border border-primary-200 bg-white py-2.5 text-sm text-ink-light outline-none transition-colors placeholder:text-muted-light/60 focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark ${
            icon ? "pl-9 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
};

/* =========================================================
   STEP
========================================================= */

const Step = ({ number, title, description }) => {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 text-[8px] font-mono text-primary-500 dark:bg-primary-900/20">
        {number}
      </div>

      <div>
        <p className="text-[10px] font-semibold text-ink-light dark:text-ink-dark">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-muted-light dark:text-muted-dark">
          {description}
        </p>
      </div>
    </div>
  );
};

export default CreateGoalPage;
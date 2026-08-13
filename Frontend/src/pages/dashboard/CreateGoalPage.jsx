import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaGraduationCap,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

const CreateGoalPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    subject: "",
    level: "beginner",
    hoursPerDay: "1",
    deadline: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /*
      Later:

      await api.post("/user/goals", form);
    */

    if (!form.title || !form.subject || !form.deadline) {
      toast.error("Please complete all required fields.");
      return;
    }

    toast.success("Learning goal created");

    navigate("/dashboard/goals");
  };

  return (
    <div className="mx-auto w-full max-w-3xl">

      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted-light hover:text-primary-500 dark:text-muted-dark"
      >
        <FaArrowLeft size={9} />
        Back
      </button>

      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          New learning goal
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          What do you want to learn?
        </h1>

        <p className="mt-2 text-sm text-muted-light dark:text-muted-dark">
          Tell EduTech what you're trying to achieve. We'll use this
          information to create your personalized study plan.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-7"
      >

        <div className="grid gap-5 sm:grid-cols-2">

          <Input
            label="Learning goal"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Master JavaScript"
            icon={<FaGraduationCap size={12} />}
          />

          <Input
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Web Development"
            icon={<FaBookOpen size={12} />}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
              Current knowledge
            </label>

            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="w-full rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light outline-none focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <Input
            label="Available time per day"
            name="hoursPerDay"
            type="number"
            min="0.5"
            step="0.5"
            value={form.hoursPerDay}
            onChange={handleChange}
            placeholder="1"
            icon={<FaClock size={12} />}
          />

          <div className="sm:col-span-2">
            <Input
              label="Target deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              icon={<FaCalendarAlt size={12} />}
            />
          </div>

        </div>

        <div className="mt-6 rounded-lg bg-primary-50 p-4 dark:bg-primary-900/10">
          <p className="text-xs font-semibold text-ink-light dark:text-ink-dark">
            What happens next?
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-light dark:text-muted-dark">
            EduTech will assess your current understanding, identify weak
            areas, and generate a study plan based on your available time
            and deadline.
          </p>
        </div>

        <button
          type="submit"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
        >
          Create personalized plan
          <FaArrowRight size={10} />
        </button>
      </form>
    </div>
  );
};

const Input = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  min,
  step,
}) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
      {label}
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
        step={step}
        className={`w-full rounded-lg border border-primary-200 bg-white py-2.5 text-sm text-ink-light outline-none transition-colors placeholder:text-muted-light/60 focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark ${
          icon ? "pl-9 pr-4" : "px-4"
        }`}
      />
    </div>
  </div>
);

export default CreateGoalPage;
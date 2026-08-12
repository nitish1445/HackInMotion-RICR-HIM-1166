import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBrain,
  FaChartLine,
  FaCheck,
  FaClock,
  FaComments,
  FaGraduationCap,
  FaLightbulb,
  FaMagic,
  FaQuestionCircle,
  FaRocket,
  FaTasks,
  FaUserGraduate,
} from "react-icons/fa";

const AboutPage = () => {
  const principles = [
    {
      icon: <FaUserGraduate size={16} />,
      title: "Start with the student",
      description:
        "Learning begins with understanding the learner's goal, current knowledge, available time, and confidence.",
    },
    {
      icon: <FaBrain size={16} />,
      title: "Use AI with purpose",
      description:
        "AI isn't here just to generate text. It helps personalize plans, explain concepts, identify gaps, and adapt learning.",
    },
    {
      icon: <FaChartLine size={16} />,
      title: "Progress should influence learning",
      description:
        "What you complete, struggle with, or miss should affect what EduTech recommends next.",
    },
    {
      icon: <FaLightbulb size={16} />,
      title: "Understanding over completion",
      description:
        "Finishing a checklist isn't the goal. Building actual understanding and confidence is.",
    },
  ];

  const journey = [
    {
      number: "01",
      title: "Define",
      text: "Choose an exam, subject, skill, or topic you want to master.",
    },
    {
      number: "02",
      title: "Assess",
      text: "Understand your starting point through self-assessment and knowledge checks.",
    },
    {
      number: "03",
      title: "Plan",
      text: "Generate a schedule that considers your weaknesses, deadline, and available time.",
    },
    {
      number: "04",
      title: "Learn",
      text: "Study through structured sessions while getting AI assistance whenever you need it.",
    },
    {
      number: "05",
      title: "Validate",
      text: "Use quizzes and mock tests to check whether the knowledge actually stuck.",
    },
    {
      number: "06",
      title: "Adapt",
      text: "Use progress and performance to adjust the path when your situation changes.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* HERO */}
      <section className="relative grid-fade overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-primary-600 dark:text-primary-300">
              <FaGraduationCap size={10} />
              About EduTech
            </div>

            <h1 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink-light dark:text-ink-dark">
              Because no two students learn the same way.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-light dark:text-muted-dark">
              EduTech is an AI-powered learning platform designed to make
              studying more personal, structured, and adaptive.
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-light dark:text-muted-dark">
              Instead of giving every student the same content and the same
              schedule, EduTech starts with the individual learner and builds
              from there.
            </p>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
              Why EduTech
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
              The problem isn't a lack of information.
            </h2>
          </div>

          <div className="text-sm leading-7 text-muted-light dark:text-muted-dark space-y-5">
            <p>
              Students already have access to more educational content than ever
              before. Courses, videos, documentation, notes, quizzes, books, and
              tutorials are everywhere.
            </p>

            <p>
              The difficult part is knowing{" "}
              <strong className="font-semibold text-ink-light dark:text-ink-dark">
                what to study, when to study it, how deeply to study it, and
                what to do when something doesn't make sense.
              </strong>
            </p>

            <p>
              EduTech is built around that problem. It turns a large learning
              goal into a structured, personalized journey that can change as
              the learner changes.
            </p>
          </div>
        </div>
      </section>

      {/* PROBLEM CARDS */}
      <section className="border-y border-primary-100 dark:border-white/5 bg-primary-50/40 dark:bg-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
              The traditional approach
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
              Generic learning creates specific problems.
            </h2>
          </div>

          <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <FaClock />,
                title: "Wasted time",
                text: "Students repeatedly study topics they already understand.",
              },
              {
                icon: <FaQuestionCircle />,
                title: "Unclear priorities",
                text: "Weak areas can remain hidden until an exam is close.",
              },
              {
                icon: <FaComments />,
                title: "No instant help",
                text: "Getting stuck often means waiting for someone to explain it.",
              },
              {
                icon: <FaTasks />,
                title: "Rigid schedules",
                text: "Generic plans rarely account for real-life changes.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark p-5 shadow-soft"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                  {item.icon}
                </div>

                <h3 className="mt-4 font-display font-semibold text-ink-light dark:text-ink-dark">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-muted-light dark:text-muted-dark">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl bg-linear-to-br from-dark to-primary-600 p-7 sm:p-10 text-white">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 text-white/60">
                <FaMagic size={12} />

                <span className="text-[10px] font-mono uppercase tracking-[0.18em]">
                  Our approach
                </span>
              </div>

              <h2 className="mt-4 max-w-2xl font-display text-2xl sm:text-3xl font-semibold">
                Your learning path should respond to you.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">
                If you already understand a concept, move forward. If you
                struggle with something, spend more time there. If you miss a
                session, reorganize the plan. If you perform poorly on a test,
                revisit the underlying topic.
              </p>
            </div>

            <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10">
              <FaBrain size={30} />
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="border-y border-primary-100 dark:border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
              What we believe
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
              Four principles behind EduTech.
            </h2>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {principles.map((item) => (
              <div
                key={item.title}
                className="rounded-xl bg-white dark:bg-panel-dark border border-primary-100 dark:border-white/5 p-5 shadow-soft"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                  {item.icon}
                </div>

                <h3 className="mt-4 font-display font-semibold text-ink-light dark:text-ink-dark">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-12">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
              The learning loop
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
              A learning journey that doesn't stop at a plan.
            </h2>

            <p className="mt-4 text-sm leading-6 text-muted-light dark:text-muted-dark">
              Planning is only the beginning. EduTech connects planning,
              learning, assessment, and adaptation into one continuous loop.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {journey.map((item) => (
              <div
                key={item.number}
                className="flex gap-4 rounded-xl border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark p-4"
              >
                <span className="text-[10px] font-mono text-primary-500 pt-1">
                  {item.number}
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-light dark:text-muted-dark">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE */}
      <section className="border-t border-primary-100 dark:border-white/5 bg-primary-50/40 dark:bg-white/2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
              Where we're going
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
              Learning that becomes more intelligent over time.
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted-light dark:text-muted-dark">
              EduTech can evolve beyond personalized plans into deeper adaptive
              learning: spaced repetition, voice-based assistance, adaptive
              re-planning, richer assessments, and collaborative learning
              experiences.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "Adaptive re-planning",
              "Spaced repetition",
              "Voice learning",
              "Smart mock tests",
              "AI tutoring",
              "Collaborative study",
            ].map((item) => (
              <span
                key={item}
                className="rounded-lg border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark px-3 py-2 text-xs text-ink-light dark:text-ink-dark"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
          Start with your goal
        </p>

        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
          Let's make learning personal.
        </h2>

        <p className="mt-3 text-sm text-muted-light dark:text-muted-dark">
          Your goal. Your pace. Your learning path.
        </p>

        <Link
          to="/signup"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-600 transition-colors"
        >
          Start learning
          <FaArrowRight size={10} />
        </Link>
      </section>
    </div>
  );
};

export default AboutPage;

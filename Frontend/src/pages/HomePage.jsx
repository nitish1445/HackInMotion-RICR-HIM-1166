import React from "react";
import { Link } from "react-router-dom";
import {
  FaBrain,
  FaCalendarAlt,
  FaChartLine,
  FaChevronRight,
  FaClock,
  FaCode,
  FaComments,
  FaGraduationCap,
  FaLightbulb,
  FaMagic,
  FaPlay,
  FaQuestionCircle,
  FaRegCheckCircle,
  FaRocket,
  FaShieldAlt,
  FaTasks,
  FaTerminal,
  FaUserGraduate,
} from "react-icons/fa";
import { LuCircleCheckBig } from "react-icons/lu";

const HomePage = () => {
  const features = [
    {
      icon: <FaBrain size={17} />,
      title: "Personalized learning",
      description:
        "Your study plan is built around your goal, current knowledge, weak areas, and available time.",
    },
    {
      icon: <FaComments size={17} />,
      title: "AI study assistant",
      description:
        "Ask questions while learning and get simple, contextual explanations instead of searching through endless resources.",
    },
    {
      icon: <FaCalendarAlt size={17} />,
      title: "Smart study planning",
      description:
        "Turn a large exam or learning goal into manageable daily sessions that fit your schedule.",
    },
    {
      icon: <FaChartLine size={17} />,
      title: "Adaptive progress",
      description:
        "Your progress matters. If you fall behind or struggle with a topic, your learning path can adapt.",
    },
  ];

  const steps = [
    {
      number: "01",
      icon: <FaBullseyeIcon />,
      title: "Set your goal",
      description:
        "Tell EduTech what you want to learn, your deadline, available study time, and current confidence level.",
    },
    {
      number: "02",
      icon: <FaQuestionCircle size={16} />,
      title: "Assess your knowledge",
      description:
        "A quick assessment helps identify what you already understand and where you need more attention.",
    },
    {
      number: "03",
      icon: <FaMagic size={16} />,
      title: "Get your plan",
      description:
        "AI creates a personalized study path that prioritizes your weak areas and fits your available time.",
    },
    {
      number: "04",
      icon: <FaRocket size={16} />,
      title: "Learn and improve",
      description:
        "Study, ask questions, practice, take tests, and let your progress shape what comes next.",
    },
  ];

  const capabilities = [
    {
      icon: <FaCalendarAlt size={15} />,
      title: "Day-by-day plans",
      text: "Know exactly what deserves your attention today.",
    },
    {
      icon: <FaTerminal size={15} />,
      title: "AI explanations",
      text: "Break difficult concepts down into understandable steps.",
    },
    {
      icon: <FaTasks size={15} />,
      title: "Practice & tests",
      text: "Validate understanding instead of just reading.",
    },
    {
      icon: <FaChartLine size={15} />,
      title: "Progress insights",
      text: "See completed topics, weak areas, and remaining work.",
    },
    {
      icon: <FaClock size={15} />,
      title: "Time-aware planning",
      text: "Plans adapt around the time you actually have.",
    },
    {
      icon: <FaLightbulb size={15} />,
      title: "Smarter revision",
      text: "Bring previous topics back before they are forgotten.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative grid-fade overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-14 items-center">
          {/* Left of Hero */}

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-primary-600 dark:text-primary-300">
              <FaBrain size={10} />
              AI-powered learning platform
            </div>

            <h1 className="mt-5 max-w-3xl font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-ink-light dark:text-ink-dark">
              Learn smarter.
              <br />
              <span className="text-primary-500">Not harder.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-7 text-muted-light dark:text-muted-dark">
              EduTech creates personalized study plans based on what you know,
              what you need to learn, and the time you actually have. Then it
              stays beside you as an AI-powered learning assistant.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-3 text-sm font-medium text-white shadow-soft hover:bg-primary-600 transition-colors"
              >
                Start learning
                <FaChevronRight size={9} />
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-200 dark:border-primary-800 bg-white dark:bg-panel-dark px-5 py-3 text-sm font-medium text-ink-light dark:text-ink-dark hover:bg-primary-50 dark:hover:bg-white/5 transition-colors"
              >
                Explore learning
                <FaPlay size={9} />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-muted-light dark:text-muted-dark">
              <span className="flex items-center gap-2">
                <LuCircleCheckBig className="text-primary-500" size={15} />
                Personalized plans
              </span>

              <span className="flex items-center gap-2">
                <LuCircleCheckBig className="text-primary-500" size={15} />
                AI assistance
              </span>

              <span className="flex items-center gap-2">
                <LuCircleCheckBig className="text-primary-500" size={15} />
                Progress tracking
              </span>
            </div>
          </div>

          {/* Righ of Hero :- Signature terminal window */}

          <div className="terminal-window">
            <div className="terminal-titlebar">
              <span className="terminal-dot bg-red-400"></span>
              <span className="terminal-dot bg-yellow-400"></span>
              <span className="terminal-dot bg-green-400"></span>
              <span className="ml-2 text-xs font-mono text-muted-light dark:text-muted-dark">
                practice/two-sum.js
              </span>
            </div>
            <div className="p-5 code-line">
              <p>
                <span className="text-primary-500">function</span>{" "}
                <span className="text-dark dark:text-primary-300">twoSum</span>
                (nums, target) {"{"}
              </p>
              <p className="pl-4 text-muted-light dark:text-muted-dark">
                // map value → index
              </p>
              <p className="pl-4">
                <span className="text-primary-500">const</span> seen ={" "}
                <span className="text-primary-500">new</span> Map();
              </p>
              <p className="pl-4">
                <span className="text-primary-500">for</span> (let i = 0; i &lt;
                nums.length; i++) {"{"}
              </p>
              <p className="pl-8">
                <span className="text-primary-500">const</span> rest = target -
                nums[i];
              </p>
              <p className="pl-8">
                <span className="text-primary-500">if</span> (seen.has(rest)){" "}
                <span className="text-primary-500">return</span>{" "}
                [seen.get(rest), i];
              </p>
              <p className="pl-8">seen.set(nums[i], i);</p>
              <p className="pl-4">{"}"}</p>
              <p>{"}"}</p>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-primary-50 dark:bg-white/5 px-3 py-2">
                <span className="text-xs text-muted-light dark:text-muted-dark">
                  All 12 tests passed
                </span>
                <span className="text-xs font-semibold text-success">
                  +10 pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* problem */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
              The problem
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
              One study plan can't work for everyone.
            </h2>
          </div>

          <div>
            <p className="text-sm leading-7 text-muted-light dark:text-muted-dark">
              Students don't start from the same place. They don't learn at the
              same speed, have the same weaknesses, or have the same amount of
              time available every day.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {[
                "Time gets wasted on topics already understood.",
                "Weak areas are discovered too late.",
                "Exam preparation turns into last-minute cramming.",
                "Students get stuck without immediate help.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark p-4"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                    <FaChevronRight size={8} />
                  </span>

                  <p className="text-xs leading-5 text-ink-light dark:text-ink-dark">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* works */}
      <section className="border-y border-primary-100 dark:border-white/5 bg-primary-50/40 dark:bg-white/2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
              How EduTech works
            </p>

            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
              From "I need to learn this"
              <br className="hidden sm:block" />
              to a plan you can actually follow.
            </h2>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-xl border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark p-5 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                    {step.icon}
                  </span>

                  <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-5 font-display font-semibold text-ink-light dark:text-ink-dark">
                  {step.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-muted-light dark:text-muted-dark">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
            One learning workspace
          </p>

          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
            Everything around your learning journey.
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-light dark:text-muted-dark">
            EduTech combines planning, learning, assistance, assessment, and
            progress into one connected experience.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-primary-100 dark:border-white/5 bg-white dark:bg-panel-dark p-5 shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                {feature.icon}
              </div>

              <h3 className="mt-4 font-display font-semibold text-ink-light dark:text-ink-dark">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-light dark:text-muted-dark">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          CAPABILITIES
      ===================================================== */}
      <section className="border-y border-primary-100 dark:border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-primary-500">
                Built for real studying
              </p>

              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-ink-light dark:text-ink-dark">
                More than an AI chatbot.
              </h2>

              <p className="mt-4 text-sm leading-6 text-muted-light dark:text-muted-dark">
                EduTech connects every part of the learning cycle. Your
                assessment influences your plan. Your progress influences what
                comes next. Your questions become part of the learning
                experience.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {capabilities.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 rounded-xl bg-primary-50/60 dark:bg-white/3 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-panel-dark text-primary-500">
                    {item.icon}
                  </span>

                  <div>
                    <h3 className="text-xs font-semibold text-ink-light dark:text-ink-dark">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-muted-light dark:text-muted-dark">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl bg-linear-to-br from-dark to-primary-600 p-8 sm:p-12 text-center text-white">
          <FaUserGraduate size={28} className="mx-auto text-white/80" />

          <h2 className="mt-5 font-display text-2xl sm:text-3xl font-semibold">
            Your learning path shouldn't look like everyone else's.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/65">
            Tell EduTech what you're trying to achieve. We'll help you turn that
            goal into a learning path you can actually follow.
          </p>

          <Link
            to="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-dark hover:bg-white/90 transition-colors"
          >
            Create your learning path
            <FaChevronRight size={9} />
          </Link>
        </div>
      </section>
    </div>
  );
};

/* Small helper icon so the steps array stays readable */
const FaBullseyeIcon = () => <FaRocket size={16} />;

export default HomePage;

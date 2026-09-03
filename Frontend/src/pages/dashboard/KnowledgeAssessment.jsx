import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBookOpen,
  FaCheckCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaLayerGroup,
  FaRedo,
  FaSpinner,
  FaTrophy,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../config/Api.jsx";

/* =====================================================
   CONSTANTS
===================================================== */

const QUESTION_COUNT = 12;

const LEVEL_STYLES = {
  Advanced: "text-emerald-600 dark:text-emerald-400",
  Intermediate: "text-primary-600 dark:text-primary-300",
  Beginner: "text-amber-600 dark:text-amber-400",
  Foundation: "text-red-600 dark:text-red-400",
};

/* =====================================================
   PAGE
===================================================== */

const KnowledgeAssessment = () => {
  const navigate = useNavigate();

  /*
    phase:
    "setup"  -> choose subject, start
    "quiz"   -> answer questions
    "result" -> show scored result
  */
  const [phase, setPhase] = useState("setup");

  /* ---------- setup ---------- */
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [starting, setStarting] = useState(false);
  const [setupError, setSetupError] = useState("");

  /* ---------- quiz ---------- */
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ---------- result ---------- */
  const [result, setResult] = useState(null);

  /* =====================================================
     LOAD SUBJECTS
  ===================================================== */

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setSubjectsLoading(true);

        const response = await api.get("/api/assessment/subjects");

        const list = response.data?.data?.subjects || [];

        setSubjects(list);

        if (list.length > 0) {
          setSelectedSubject(list[0]);
        }
      } catch (err) {
        console.error("Load subjects error:", err);

        setSetupError(
          err?.response?.data?.message ||
            "Unable to load assessment subjects. Please try again."
        );
      } finally {
        setSubjectsLoading(false);
      }
    };

    loadSubjects();
  }, []);

  /* =====================================================
     START ASSESSMENT
  ===================================================== */

  const handleStart = async () => {
    if (!selectedSubject) return;

    setSetupError("");
    setStarting(true);

    try {
      const response = await api.get("/api/assessment/questions", {
        params: {
          subject: selectedSubject,
          count: QUESTION_COUNT,
        },
      });

      const fetchedQuestions = response.data?.data?.questions || [];

      if (fetchedQuestions.length === 0) {
        throw new Error("No questions were returned for this subject.");
      }

      setQuestions(fetchedQuestions);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setPhase("quiz");
    } catch (err) {
      console.error("Start assessment error:", err);

      const message =
        err?.response?.data?.message ||
        err.message ||
        "Unable to start the assessment. Please try again.";

      setSetupError(message);
      toast.error(message);
    } finally {
      setStarting(false);
    }
  };

  /* =====================================================
     QUIZ NAVIGATION
  ===================================================== */

  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers]
  );

  const unansweredCount = questions.length - answeredCount;

  const handleSelectOption = (optionIndex) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const isLastQuestion = currentIndex === questions.length - 1;

  /* =====================================================
     SUBMIT
  ===================================================== */

  const performSubmit = async () => {
    setSubmitting(true);
    setConfirmingSubmit(false);

    try {
      const payload = {
        subject: selectedSubject,
        answers: questions.map((q) => ({
          questionId: q.id,
          selectedAnswer:
            answers[q.id] === undefined ? null : answers[q.id],
        })),
      };

      const response = await api.post("/api/assessment/submit", payload);

      const submittedResult = response.data?.data?.result;

      setResult(submittedResult);
      setPhase("result");

      toast.success("Assessment submitted successfully!");
    } catch (err) {
      console.error("Submit assessment error:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to submit your assessment. Please try again.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setConfirmingSubmit(true);
      return;
    }

    performSubmit();
  };

  /* =====================================================
     RETAKE
  ===================================================== */

  const handleRetake = () => {
    setPhase("setup");
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setConfirmingSubmit(false);
  };

  /* =====================================================
     UI — SETUP
  ===================================================== */

  if (phase === "setup") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted-light transition-colors hover:text-primary-500 dark:text-muted-dark"
        >
          <FaArrowLeft size={9} />
          Back
        </button>

        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Diagnostic assessment
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          Knowledge Assessment
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-light dark:text-muted-dark">
          A short diagnostic quiz to objectively measure your current level
          and spot the topics you should focus on — instead of guessing from
          a dropdown.
        </p>

        {setupError && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <FaExclamationTriangle size={11} className="mt-0.5 shrink-0" />
            {setupError}
          </div>
        )}

        <div className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-7">
          <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
            Subject
          </label>

          <div className="relative">
            <FaBookOpen
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
            />

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={subjectsLoading || subjects.length === 0}
              className="w-full appearance-none rounded-lg border border-primary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-ink-light outline-none transition-colors focus:border-primary-500 disabled:opacity-60 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
            >
              {subjectsLoading && <option>Loading subjects...</option>}

              {!subjectsLoading && subjects.length === 0 && (
                <option>No subjects available</option>
              )}

              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <Stat label="Questions" value={QUESTION_COUNT} />
            <Stat label="Difficulty" value="Mixed" />
            <Stat label="Est. time" value="~10 min" />
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={starting || subjectsLoading || !selectedSubject}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {starting ? (
              <>
                <FaSpinner size={11} className="animate-spin" />
                Preparing questions...
              </>
            ) : (
              <>
                Start Assessment
                <FaArrowRight size={10} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — QUIZ
  ===================================================== */

  if (phase === "quiz" && currentQuestion) {
    const selected = answers[currentQuestion.id];

    const progressPct = Math.round(
      ((currentIndex + 1) / questions.length) * 100
    );

    return (
      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={handleRetake}
          className="inline-flex items-center gap-2 text-xs text-muted-light hover:text-primary-500 dark:text-muted-dark"
        >
          <FaArrowLeft size={9} />
          Exit assessment
        </button>

        <div className="mt-5 rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">
          <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4 dark:border-white/5">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                {selectedSubject}
              </p>

              <p className="mt-1 text-sm font-semibold text-ink-light dark:text-ink-dark">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-light dark:text-muted-dark">
              <FaClipboardList size={10} />
              {answeredCount}/{questions.length} answered
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <span className="mt-3 inline-block rounded-full bg-primary-50 px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-primary-500 dark:bg-primary-900/20">
              {currentQuestion.topic}
            </span>

            <h1 className="mt-4 font-display text-xl font-semibold leading-7 text-ink-light dark:text-ink-dark">
              {currentQuestion.question}
            </h1>

            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectOption(index)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    selected === index
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-primary-100 hover:border-primary-300 dark:border-white/5 dark:hover:border-primary-800"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-[10px] font-mono text-primary-500 dark:bg-white/5">
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="text-sm leading-6 text-ink-light dark:text-ink-dark">
                    {option}
                  </span>
                </button>
              ))}
            </div>

            {confirmingSubmit && (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400">
                <p className="flex items-start gap-2">
                  <FaExclamationTriangle size={11} className="mt-0.5 shrink-0" />
                  {unansweredCount} question{unansweredCount !== 1 ? "s" : ""}{" "}
                  left unanswered. Submit anyway?
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={performSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    {submitting && (
                      <FaSpinner size={10} className="animate-spin" />
                    )}
                    Yes, submit
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmingSubmit(false)}
                    disabled={submitting}
                    className="rounded-lg border border-amber-300 px-3 py-1.5 text-[11px] font-medium text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    Keep answering
                  </button>
                </div>
              </div>
            )}

            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-primary-100 px-4 py-2.5 text-sm font-medium text-ink-light transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/5 dark:text-ink-dark dark:hover:bg-white/5"
              >
                <FaArrowLeft size={10} />
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmitClick}
                  disabled={submitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <FaSpinner size={11} className="animate-spin" />
                      Scoring...
                    </>
                  ) : (
                    <>Submit Assessment</>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                  Next question
                  <FaArrowRight size={10} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — RESULT
  ===================================================== */

  if (phase === "result" && result) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-primary-100 bg-white p-6 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaTrophy size={18} />
          </div>

          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
            Assessment complete
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
            {result.subject}
          </h1>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ResultStat
              label="Score"
              value={`${result.correctAnswers}/${result.totalQuestions}`}
            />
            <ResultStat label="Percentage" value={`${result.percentage}%`} />
            <ResultStat
              label="Your level"
              value={result.level}
              valueClassName={LEVEL_STYLES[result.level]}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
              <FaCheckCircle size={13} className="text-emerald-500" />
              Strong Topics
            </h2>

            {result.strongTopics.length === 0 ? (
              <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                No topics scored high enough to be marked strong yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {result.strongTopics.map((topic) => (
                  <li
                    key={topic}
                    className="flex items-center gap-2 text-sm text-ink-light dark:text-ink-dark"
                  >
                    <span className="text-emerald-500">✓</span>
                    {topic}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
              <FaExclamationTriangle size={13} className="text-amber-500" />
              Needs Improvement
            </h2>

            {result.weakTopics.length === 0 ? (
              <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">
                No clearly weak topics — nice work.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {result.weakTopics.map((topic) => (
                  <li
                    key={topic}
                    className="flex items-center gap-2 text-sm text-ink-light dark:text-ink-dark"
                  >
                    <span className="text-amber-500">⚠</span>
                    {topic}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
            <FaLayerGroup size={13} className="text-primary-500" />
            Topic Performance
          </h2>

          <div className="mt-4 space-y-4">
            {result.topicPerformance.map((topic) => (
              <div key={topic.topic}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-light dark:text-ink-dark">
                    {topic.topic}
                  </span>

                  <span className="font-mono text-muted-light dark:text-muted-dark">
                    {topic.correctAnswers}/{topic.totalQuestions} &middot;{" "}
                    {topic.percentage}%
                  </span>
                </div>

                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      topic.percentage >= 75
                        ? "bg-emerald-500"
                        : topic.percentage < 60
                        ? "bg-amber-500"
                        : "bg-primary-500"
                    }`}
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleRetake}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary-100 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
          >
            <FaRedo size={10} />
            Take another assessment
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
          >
            Back to dashboard
            <FaArrowRight size={10} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

/* =====================================================
   STAT (setup screen)
===================================================== */

const Stat = ({ label, value }) => (
  <div className="rounded-lg bg-primary-50/70 p-3 dark:bg-white/3">
    <p className="text-[9px] text-muted-light dark:text-muted-dark">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-ink-light dark:text-ink-dark">
      {value}
    </p>
  </div>
);

/* =====================================================
   RESULT STAT
===================================================== */

const ResultStat = ({ label, value, valueClassName = "" }) => (
  <div className="rounded-lg bg-primary-50/70 p-4 dark:bg-white/3">
    <p className="text-[10px] text-muted-light dark:text-muted-dark">
      {label}
    </p>
    <p
      className={`mt-1 font-display text-lg font-semibold text-ink-light dark:text-ink-dark ${valueClassName}`}
    >
      {value}
    </p>
  </div>
);

export default KnowledgeAssessment;
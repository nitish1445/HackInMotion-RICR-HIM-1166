import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaLayerGroup,
  FaRedo,
  FaSpinner,
  FaTimesCircle,
  FaTrophy,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../config/Api.jsx";

/* =====================================================
   CONFIG
===================================================== */

const SECONDS_PER_QUESTION = 90;

/* =====================================================
   PAGE
===================================================== */

const TestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { testId } = useParams();

  const generatedTest = location.state?.generatedTest || null;

  /*
    phase:
    "loading" -> fetching an existing completed result
    "quiz"    -> answering a freshly generated test
    "result"  -> showing a scored result + review
    "error"   -> couldn't load anything usable
  */
  const [phase, setPhase] = useState(generatedTest ? "quiz" : "loading");
  const [loadError, setLoadError] = useState("");

  /* ---------- quiz ---------- */
  const [questions, setQuestions] = useState(
    generatedTest?.questions || []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: optionIndex }
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(
    generatedTest ? generatedTest.totalQuestions * SECONDS_PER_QUESTION : 0
  );
  const autoSubmittedRef = useRef(false);

  /* ---------- result ---------- */
  const [result, setResult] = useState(null);

  /* =====================================================
     LOAD EXISTING RESULT (no fresh generation in state)
  ===================================================== */

  useEffect(() => {
    if (generatedTest) return;

    const loadResult = async () => {
      try {
        setPhase("loading");
        setLoadError("");

        const response = await api.get(`/api/tests/results/${testId}`);

        setResult(response.data?.data);
        setPhase("result");
      } catch (err) {
        console.error("Load test result error:", err);

        setLoadError(
          err?.response?.data?.message ||
            "This test session is unavailable. It may have expired or was never completed."
        );
        setPhase("error");
      }
    };

    loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  /* =====================================================
     SUBMIT (defined before the timer effect uses it)
  ===================================================== */

  const performSubmit = async () => {
    setSubmitting(true);
    setConfirmingSubmit(false);

    try {
      const payload = {
        answers: questions.map((q) => ({
          questionId: q.id,
          selectedAnswer:
            answers[q.id] === undefined ? null : answers[q.id],
        })),
      };

      const response = await api.post(
        `/api/tests/${testId}/submit`,
        payload
      );

      setResult(response.data?.data);
      setPhase("result");

      toast.success("Test submitted successfully!");
    } catch (err) {
      console.error("Submit test error:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to submit your test. Please try again.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (phase !== "quiz") return;
    if (secondsLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        toast("Time's up! Submitting your test...", { icon: "⏱️" });
        performSubmit();
      }
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, secondsLeft]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [secondsLeft]);

  /* =====================================================
     QUIZ NAVIGATION
  ===================================================== */

  const currentQuestion = questions[currentIndex];

  const answeredCount = useMemo(() => Object.keys(answers).length, [
    answers,
  ]);

  const unansweredCount = questions.length - answeredCount;

  const handleSelectOption = (optionIndex) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const goPrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goNext = () =>
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));

  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setConfirmingSubmit(true);
      return;
    }
    performSubmit();
  };

  const handleExit = () => navigate("/dashboard/tests");

  /* =====================================================
     UI — LOADING
  ===================================================== */

  if (phase === "loading") {
    return (
      <div className="mx-auto flex min-h-[400px] w-full max-w-3xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaSpinner size={18} className="animate-spin" />
          </div>
          <p className="mt-4 text-sm font-medium text-ink-light dark:text-ink-dark">
            Loading test result...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — ERROR
  ===================================================== */

  if (phase === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <FaExclamationTriangle size={18} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-ink-light dark:text-ink-dark">
            Can't open this test
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-light dark:text-muted-dark">
            {loadError}
          </p>

          <button
            type="button"
            onClick={handleExit}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-primary-600"
          >
            <FaArrowLeft size={9} />
            Back to Mock Tests
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
      <div className="mx-auto w-full max-w-4xl">
        <button
          type="button"
          onClick={handleExit}
          className="inline-flex items-center gap-2 text-xs text-muted-light hover:text-primary-500 dark:text-muted-dark"
        >
          <FaArrowLeft size={9} />
          Exit test
        </button>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4 dark:border-white/5">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                  {generatedTest?.subject}
                  {generatedTest?.difficulty &&
                    generatedTest.difficulty !== "mixed" &&
                    ` · ${generatedTest.difficulty}`}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-light dark:text-ink-dark">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>

              <div
                className={`flex items-center gap-2 text-xs font-mono ${
                  secondsLeft <= 30
                    ? "text-red-500"
                    : "text-muted-light dark:text-muted-dark"
                }`}
              >
                <FaClock size={10} />
                {formattedTime}
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
                    <FaExclamationTriangle
                      size={11}
                      className="mt-0.5 shrink-0"
                    />
                    {unansweredCount} question
                    {unansweredCount !== 1 ? "s" : ""} left unanswered.
                    Submit anyway?
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
                      "Submit Test"
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

          {/* QUESTION NAVIGATOR */}
          <div className="h-fit rounded-xl border border-primary-100 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-light dark:text-muted-dark">
              {answeredCount}/{questions.length} answered
            </p>

            <div className="mt-3 grid grid-cols-5 gap-2 lg:grid-cols-4">
              {questions.map((q, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered = answers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-mono font-medium transition-colors ${
                      isCurrent
                        ? "bg-primary-500 text-white"
                        : isAnswered
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300"
                        : "bg-primary-50/50 text-muted-light dark:bg-white/[0.03] dark:text-muted-dark"
                    }`}
                    title={`Question ${index + 1}${
                      isAnswered ? " (answered)" : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — RESULT + REVIEW
  ===================================================== */

  if (phase === "result" && result) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-primary-100 bg-white p-6 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaTrophy size={18} />
          </div>

          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
            Test complete
          </p>

          <h1 className="mt-1 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
            {result.subject}
          </h1>

          <p className="mt-1 text-xs capitalize text-muted-light dark:text-muted-dark">
            {result.topics?.length > 0
              ? result.topics.join(", ")
              : "All Topics"}{" "}
            &middot; {result.difficulty} difficulty
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <ResultStat
              label="Score"
              value={`${result.correctAnswers}/${result.totalQuestions}`}
            />
            <ResultStat label="Percentage" value={`${result.percentage}%`} />
            <ResultStat
              label="Correct"
              value={result.correctAnswers}
              valueClassName="text-emerald-600 dark:text-emerald-400"
            />
            <ResultStat
              label="Incorrect"
              value={result.incorrectAnswers}
              valueClassName="text-red-600 dark:text-red-400"
            />
            <ResultStat
              label="Unanswered"
              value={result.unansweredQuestions}
              valueClassName="text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>

        {result.topicPerformance?.length > 0 && (
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
        )}

        {/* ANSWER REVIEW */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-ink-light dark:text-ink-dark">
            Answer Review
          </h2>

          <div className="space-y-4">
            {result.review?.map((item, index) => (
              <div
                key={item.questionId}
                className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                    Question {index + 1} &middot; {item.topic}
                  </p>

                  {item.isCorrect ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <FaCheckCircle size={9} />
                      Correct
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      <FaTimesCircle size={9} />
                      {item.selectedAnswer === null
                        ? "Unanswered"
                        : "Incorrect"}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm font-medium leading-6 text-ink-light dark:text-ink-dark">
                  {item.question}
                </p>

                <div className="mt-3 space-y-1.5 text-xs">
                  <p>
                    <span className="text-muted-light dark:text-muted-dark">
                      Your answer:{" "}
                    </span>
                    <span
                      className={
                        item.isCorrect
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {item.selectedAnswerText || "Not answered"}
                    </span>
                  </p>

                  {!item.isCorrect && (
                    <p>
                      <span className="text-muted-light dark:text-muted-dark">
                        Correct answer:{" "}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {item.correctAnswerText}
                      </span>
                    </p>
                  )}
                </div>

                {item.explanation && (
                  <p className="mt-3 rounded-lg bg-primary-50/70 px-3 py-2 text-[11px] leading-5 text-muted-light dark:bg-white/[0.03] dark:text-muted-dark">
                    <span className="font-medium text-ink-light dark:text-ink-dark">
                      Explanation:{" "}
                    </span>
                    {item.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/dashboard/tests")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary-100 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
          >
            <FaRedo size={10} />
            Take another test
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
   RESULT STAT
===================================================== */

const ResultStat = ({ label, value, valueClassName = "" }) => (
  <div className="rounded-lg bg-primary-50/70 p-3 dark:bg-white/3">
    <p className="text-[9px] text-muted-light dark:text-muted-dark">
      {label}
    </p>
    <p
      className={`mt-1 font-display text-base font-semibold text-ink-light dark:text-ink-dark ${valueClassName}`}
    >
      {value}
    </p>
  </div>
);

export default TestPage;
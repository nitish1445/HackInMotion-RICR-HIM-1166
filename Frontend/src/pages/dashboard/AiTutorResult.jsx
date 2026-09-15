import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaLightbulb,
  FaQuoteLeft,
  FaSpinner,
  FaTrophy,
} from "react-icons/fa";

import api from "../../config/Api.jsx";

const BREAKDOWN_LABELS = {
  relevance: "Relevance",
  contentAccuracy: "Content Accuracy",
  completeness: "Completeness",
  clarity: "Clarity",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  fluency: "Fluency",
  confidence: "Confidence",
};

const AiTutorResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (result) return;

    const loadResult = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/api/practice/${id}`);
        setResult(response.data?.data?.session);
      } catch (err) {
        console.error("Load practice result error:", err);
        setError(
          err?.response?.data?.message || "Unable to load this result."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-100 w-full max-w-3xl items-center justify-center">
        <FaSpinner size={20} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
          <FaExclamationTriangle size={20} className="mx-auto text-red-500" />
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error || "Result not found."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard/ai-tutor")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
          >
            Back to AI Tutor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* SCORE HEADER */}
      <div className="rounded-xl border border-primary-100 bg-white p-6 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-900/20">
          <FaTrophy size={18} />
        </div>
        <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Assessment Complete
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          {result.topic || result.subject}
        </h1>

        <p className="mt-5 font-mono text-5xl font-bold text-ink-light dark:text-ink-dark">
          {result.overallScore}
          <span className="text-2xl text-muted-light dark:text-muted-dark"> / 100</span>
        </p>
      </div>

      {/* BREAKDOWN */}
      <div className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
        <h2 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
          Score Breakdown
        </h2>
        <div className="mt-4 space-y-4">
          {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-light dark:text-ink-dark">{label}</span>
                <span className="font-mono text-muted-light dark:text-muted-dark">
                  {result.breakdown?.[key] ?? 0}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500"
                  style={{ width: `${result.breakdown?.[key] ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {typeof result.breakdown?.fillerWords === "number" && (
          <p className="mt-4 text-xs text-muted-light dark:text-muted-dark">
            Estimated filler words used: <strong>{result.breakdown.fillerWords}</strong>
          </p>
        )}
      </div>

      {/* TRANSCRIPT */}
      <div className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
          <FaQuoteLeft size={12} className="text-primary-500" />
          Your Transcript
        </h2>
        <p className="mt-3 text-sm italic leading-6 text-muted-light dark:text-muted-dark">
          "{result.transcript}"
        </p>
      </div>

      {/* FEEDBACK */}
      <div className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
        <h2 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
          AI Feedback
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink-light dark:text-ink-dark">
          {result.feedback}
        </p>
      </div>

      {/* STRENGTHS / IMPROVEMENTS */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
            <FaCheckCircle size={13} className="text-emerald-500" />
            Strengths
          </h2>
          {result.strengths?.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {result.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-ink-light dark:text-ink-dark">
                  <span className="text-emerald-500">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">None noted.</p>
          )}
        </div>

        <div className="rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
            <FaExclamationTriangle size={13} className="text-amber-500" />
            Improve
          </h2>
          {result.improvements?.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {result.improvements.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-ink-light dark:text-ink-dark">
                  <span className="text-amber-500">•</span>
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-light dark:text-muted-dark">None noted.</p>
          )}
        </div>
      </div>

      {/* NEXT PRACTICE */}
      {result.nextPractice && (
        <div className="mt-6 rounded-xl border border-primary-100 bg-primary-50/50 p-5 dark:border-white/5 dark:bg-white/3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
            <FaLightbulb size={13} className="text-primary-500" />
            Next Practice
          </h2>
          <p className="mt-2 text-sm italic text-ink-light dark:text-ink-dark">
            "{result.nextPractice}"
          </p>
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate("/dashboard/ai-tutor")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
        >
          Practice Again
          <FaArrowRight size={10} />
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard/ai-tutor/history")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary-100 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-white/5 dark:text-primary-300 dark:hover:bg-white/5"
        >
          <FaHistory size={11} />
          View History
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary-100 py-2.5 text-sm font-medium text-ink-light hover:bg-primary-50 dark:border-white/5 dark:text-ink-dark dark:hover:bg-white/5"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AiTutorResult;
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

import api from "../../config/Api.jsx";

/*
=========================================================
KNOWLEDGE ASSESSMENT STATUS WIDGET

Self-contained: fetches its own data and manages its own
loading/error state, so it can be dropped into the
dashboard without touching Overview's existing state.

Shows:
- loading skeleton while fetching
- "Assessment not completed" CTA if no result exists yet
- Assessed level + weak topics if a result exists

The manual "Level" dropdown on goal creation stays as a
self-selected preference; this widget is what surfaces the
*assessed* level from the diagnostic quiz — the source of
truth the future adaptive planner will use.
=========================================================
*/

const LEVEL_STYLES = {
  Advanced: "text-emerald-600 dark:text-emerald-400",
  Intermediate: "text-primary-600 dark:text-primary-300",
  Beginner: "text-amber-600 dark:text-amber-400",
  Foundation: "text-red-600 dark:text-red-400",
};

const AssessmentStatusWidget = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadLatest = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/assessment/latest");

        if (!cancelled) {
          setResult(response.data?.data?.result || null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Load latest assessment error:", err);
          setError("Couldn't load your assessment status.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLatest();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-6 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark">
      <div className="flex items-center gap-2">
        <FaClipboardCheck size={13} className="text-primary-500" />
        <h2 className="text-sm font-semibold text-ink-light dark:text-ink-dark">
          Knowledge Assessment
        </h2>
      </div>

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
          <FaSpinner size={10} className="animate-spin" />
          Checking your assessment status...
        </div>
      )}

      {!loading && error && (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <FaExclamationTriangle size={10} />
          {error}
        </div>
      )}

      {!loading && !error && !result && (
        <div className="mt-3">
          <p className="text-xs text-muted-light dark:text-muted-dark">
            Assessment not completed
          </p>

          <Link
            to="/dashboard/assessment"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-600"
          >
            Take Knowledge Assessment
            <FaArrowRight size={9} />
          </Link>
        </div>
      )}

      {!loading && !error && result && (
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-[10px] text-muted-light dark:text-muted-dark">
              {result.subject} &middot; Assessed Level
            </p>
            <p
              className={`text-sm font-semibold ${
                LEVEL_STYLES[result.level] || "text-ink-light dark:text-ink-dark"
              }`}
            >
              {result.level}
            </p>
          </div>

          {result.weakTopics?.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-light dark:text-muted-dark">
                Weak Areas
              </p>
              <p className="text-sm text-ink-light dark:text-ink-dark">
                {result.weakTopics.join(", ")}
              </p>
            </div>
          )}

          <Link
            to="/dashboard/assessment"
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-600"
          >
            Retake assessment
            <FaArrowRight size={9} />
          </Link>
        </div>
      )}
    </section>
  );
};

export default AssessmentStatusWidget;
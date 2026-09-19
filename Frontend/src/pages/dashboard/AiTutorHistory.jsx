import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaMicrophone,
  FaSpinner,
  FaVideo,
} from "react-icons/fa";

import api from "../../config/Api.jsx";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Speaking", value: "speaking" },
  { label: "Video", value: "video" },
];

const formatDate = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const AiTutorHistory = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchHistory = async (mode) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/practice/history", {
        params: mode && mode !== "all" ? { mode } : {},
      });

      setSessions(response.data?.data?.sessions || []);
    } catch (err) {
      console.error("Load practice history error:", err);
      setError(err?.response?.data?.message || "Unable to load your practice history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <button
        type="button"
        onClick={() => navigate("/dashboard/ai-tutor")}
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-light hover:text-primary-500 dark:text-muted-dark"
      >
        <FaArrowLeft size={9} />
        Back to AI Tutor
      </button>

      <h1 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
        Practice History
      </h1>

      <div className="mt-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
              filter === f.value
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-primary-200 text-ink-light hover:border-primary-400 dark:border-primary-800 dark:text-ink-dark"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
            <FaSpinner size={10} className="animate-spin" />
            Loading history...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
            <FaExclamationTriangle size={16} className="mx-auto text-red-500" />
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-primary-100 bg-white p-10 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <FaFileAlt size={20} className="mx-auto text-primary-400" />
            <p className="mt-3 text-sm text-muted-light dark:text-muted-dark">
              No practice sessions yet. Head back to AI Tutor to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <Link
                key={s._id}
                to={`/dashboard/ai-tutor/result/${s._id}`}
                className="flex items-center gap-4 rounded-xl border border-primary-100 bg-white p-4 shadow-soft transition-all hover:border-primary-200 hover:shadow-glow dark:border-white/5 dark:bg-panel-dark"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                  {s.mode === "video" ? <FaVideo size={14} /> : <FaMicrophone size={14} />}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-light dark:text-ink-dark">
                    {s.topic || s.subject || "Practice session"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-muted-light dark:text-muted-dark">
                    <span className="capitalize">{s.mode}</span>
                    <span className="flex items-center gap-1">
                      <FaClock size={8} />
                      {formatDuration(s.duration)}
                    </span>
                    <span>{formatDate(s.createdAt)}</span>
                  </div>
                </div>

                <p className="font-mono text-lg font-semibold text-primary-500">
                  {s.overallScore}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiTutorHistory;
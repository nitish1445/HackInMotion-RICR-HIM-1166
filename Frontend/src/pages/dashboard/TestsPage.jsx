import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBookOpen,
  FaCheckCircle,
  FaChevronDown,
  FaClipboardList,
  FaExclamationTriangle,
  FaFileAlt,
  FaLayerGroup,
  FaPlay,
  FaRedo,
  FaSearch,
  FaSpinner,
  FaTrophy,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../config/Api.jsx";

/*
=========================================================
MOCK TEST HUB

Two parts:
1. Configuration panel — pick subject/topics/difficulty/
   count and generate a real test from the backend
   question bank.
2. Test History — real past results from
   GET /api/tests/history.
=========================================================
*/

const TestsPage = () => {
  const navigate = useNavigate();

  /* ---------- config ---------- */
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("mixed");
  const [selectedCount, setSelectedCount] = useState(10);
  const [showTopics, setShowTopics] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  /* ---------- history ---------- */
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [search, setSearch] = useState("");

  /*
   * =========================================================
   * LOAD CONFIG
   * =========================================================
   */

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setConfigLoading(true);
        setConfigError("");

        const response = await api.get("/api/tests/config");
        const data = response.data?.data;

        setConfig(data);

        if (data?.subjects?.length > 0) {
          setSelectedSubject(data.subjects[0]);
        }
      } catch (err) {
        console.error("Load test config error:", err);
        setConfigError(
          err?.response?.data?.message ||
            "Unable to load test configuration options."
        );
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  /*
   * =========================================================
   * LOAD HISTORY
   * =========================================================
   */

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const response = await api.get("/api/tests/history");

      setHistory(response.data?.data?.results || []);
    } catch (err) {
      console.error("Load test history error:", err);
      setHistoryError(
        err?.response?.data?.message || "Unable to load test history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  /*
   * =========================================================
   * SUBJECT CHANGE -> RESET TOPICS
   * =========================================================
   */

  useEffect(() => {
    setSelectedTopics([]);
  }, [selectedSubject]);

  const availableTopics = useMemo(() => {
    if (!config || !selectedSubject) return [];
    return config.topicsBySubject?.[selectedSubject] || [];
  }, [config, selectedSubject]);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  /*
   * =========================================================
   * GENERATE TEST
   * =========================================================
   */

  const handleGenerate = async () => {
    if (!selectedSubject) return;

    setGenerateError("");
    setGenerating(true);

    try {
      const response = await api.post("/api/tests/generate", {
        subject: selectedSubject,
        topics: selectedTopics,
        difficulty: selectedDifficulty,
        numberOfQuestions: selectedCount,
      });

      const data = response.data?.data;

      /*
       * Hand the freshly generated test straight to
       * TestPage via router state — no extra fetch needed,
       * and the backend session (testId) is already the
       * source of truth for grading.
       */
      navigate(`/dashboard/tests/${data.testId}`, {
        state: { generatedTest: data },
      });
    } catch (err) {
      console.error("Generate test error:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to generate the test. Please try again.";

      setGenerateError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  /*
   * =========================================================
   * FILTER HISTORY
   * =========================================================
   */

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return history;

    return history.filter(
      (test) =>
        test.subject?.toLowerCase().includes(query) ||
        test.topics?.some((t) => t.toLowerCase().includes(query))
    );
  }, [history, search]);

  const statistics = useMemo(() => {
    const total = history.length;

    const scores = history
      .map((t) => Number(t.percentage))
      .filter((s) => Number.isFinite(s));

    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : null;

    const bestScore = scores.length > 0 ? Math.max(...scores) : null;

    return { total, averageScore, bestScore };
  }, [history]);

  const formatDate = (date) => {
    if (!date) return "";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  /*
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          Practice & assessment
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          Mock Tests
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-light dark:text-muted-dark">
          Generate a fresh, randomized test on any subject and topic, get
          scored instantly, and review every answer with an explanation.
        </p>
      </div>

      {/* =====================================================
          CONFIGURATION PANEL
      ===================================================== */}

      <section className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-6">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-light dark:text-ink-dark">
          <FaClipboardList size={13} className="text-primary-500" />
          Start a new mock test
        </h2>

        {configError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <FaExclamationTriangle size={11} className="mt-0.5 shrink-0" />
            {configError}
          </div>
        )}

        {configLoading ? (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
            <FaSpinner size={10} className="animate-spin" />
            Loading options...
          </div>
        ) : (
          config && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* SUBJECT */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
                  Subject
                </label>

                <div className="relative">
                  <FaBookOpen
                    size={11}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
                  />

                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-primary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-ink-light outline-none transition-colors focus:border-primary-500 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
                  >
                    {config.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DIFFICULTY */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
                  Difficulty
                </label>

                <div className="flex rounded-lg border border-primary-100 bg-primary-50/50 p-1 dark:border-white/5 dark:bg-white/[0.02]">
                  {config.difficulties.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDifficulty(d)}
                      className={`flex-1 rounded-md py-1.5 text-[11px] font-medium capitalize transition-colors ${
                        selectedDifficulty === d
                          ? "bg-primary-500 text-white"
                          : "text-muted-light hover:bg-primary-50 dark:text-muted-dark dark:hover:bg-white/5"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOPICS */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
                  Topics{" "}
                  <span className="font-normal text-muted-light dark:text-muted-dark">
                    (optional — leave empty for all topics)
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowTopics((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
                >
                  <span className="truncate text-left">
                    {selectedTopics.length === 0
                      ? "All Topics"
                      : selectedTopics.join(", ")}
                  </span>

                  <FaChevronDown
                    size={10}
                    className={`shrink-0 text-primary-500 transition-transform ${
                      showTopics ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTopics && (
                  <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-primary-100 bg-primary-50/50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                    {availableTopics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                          selectedTopics.includes(topic)
                            ? "border-primary-500 bg-primary-500 text-white"
                            : "border-primary-200 text-ink-light hover:border-primary-400 dark:border-primary-800 dark:text-ink-dark"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* NUMBER OF QUESTIONS */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-ink-light dark:text-ink-dark">
                  Number of questions
                </label>

                <div className="flex flex-wrap gap-2">
                  {config.questionCountOptions.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSelectedCount(n)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCount === n
                          ? "border-primary-500 bg-primary-500 text-white"
                          : "border-primary-200 text-ink-light hover:border-primary-400 dark:border-primary-800 dark:text-ink-dark"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {generateError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <FaExclamationTriangle size={11} className="mt-0.5 shrink-0" />
            {generateError}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || configLoading || !selectedSubject}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
        >
          {generating ? (
            <>
              <FaSpinner size={11} className="animate-spin" />
              Generating test...
            </>
          ) : (
            <>
              <FaPlay size={10} />
              Generate Test
            </>
          )}
        </button>
      </section>

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="mt-7 grid grid-cols-3 gap-3">
        <TestStat
          icon={<FaFileAlt size={12} />}
          label="Tests taken"
          value={statistics.total}
        />

        <TestStat
          icon={<FaTrophy size={12} />}
          label="Average score"
          value={
            statistics.averageScore !== null
              ? `${statistics.averageScore}%`
              : "—"
          }
        />

        <TestStat
          icon={<FaLayerGroup size={12} />}
          label="Best score"
          value={
            statistics.bestScore !== null ? `${statistics.bestScore}%` : "—"
          }
        />
      </section>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      {history.length > 0 && (
        <section className="mt-6">
          <div className="relative">
            <FaSearch
              size={11}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject or topic..."
              className="w-full rounded-lg border border-primary-100 bg-white py-2.5 pl-9 pr-3 text-xs text-ink-light outline-none transition-colors placeholder:text-muted-light focus:border-primary-300 dark:border-white/5 dark:bg-panel-dark dark:text-ink-dark dark:placeholder:text-muted-dark"
            />
          </div>
        </section>
      )}

      {/* =====================================================
          HISTORY
      ===================================================== */}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-light dark:text-ink-dark">
          Test History
        </h2>

        {historyLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
            <FaSpinner size={10} className="animate-spin" />
            Loading history...
          </div>
        ) : historyError ? (
          <section className="rounded-xl border border-red-200 bg-white p-6 text-center shadow-soft dark:border-red-900/30 dark:bg-panel-dark">
            <p className="text-sm text-red-600 dark:text-red-400">
              {historyError}
            </p>

            <button
              type="button"
              onClick={fetchHistory}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
            >
              <FaRedo size={9} />
              Try again
            </button>
          </section>
        ) : filteredHistory.length === 0 ? (
          <section className="rounded-xl border border-primary-100 bg-white p-10 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
              <FaFileAlt size={20} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-ink-light dark:text-ink-dark">
              {history.length === 0
                ? "No tests taken yet"
                : "No tests found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-muted-light dark:text-muted-dark">
              {history.length === 0
                ? "Generate your first mock test above to see your results here."
                : "Try a different search."}
            </p>
          </section>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((test) => (
              <Link
                key={test._id}
                to={`/dashboard/tests/${test._id}`}
                className="group flex flex-col gap-4 rounded-xl border border-primary-100 bg-white p-5 shadow-soft transition-all hover:border-primary-200 hover:shadow-glow dark:border-white/5 dark:bg-panel-dark sm:flex-row sm:items-center sm:p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
                  <FaCheckCircle size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                      {test.subject}
                    </p>

                    <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[8px] font-mono uppercase capitalize text-primary-500 dark:bg-primary-900/20">
                      {test.difficulty}
                    </span>
                  </div>

                  <h3 className="mt-1 truncate text-sm font-semibold text-ink-light dark:text-ink-dark">
                    {test.topics?.length > 0
                      ? test.topics.join(", ")
                      : "All Topics"}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-muted-light dark:text-muted-dark">
                    <span>{test.totalQuestions} questions</span>
                    <span>
                      {test.correctAnswers}/{test.totalQuestions} correct
                    </span>
                    {test.completedAt && (
                      <span>{formatDate(test.completedAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-primary-500">
                      {test.percentage}%
                    </p>
                    <p className="text-[9px] text-muted-light dark:text-muted-dark">
                      Score
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-100 text-muted-light transition-all group-hover:border-primary-300 group-hover:text-primary-500 dark:border-white/5 dark:text-muted-dark">
                    <FaArrowRight
                      size={10}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/*
=========================================================
TEST STAT
=========================================================
*/

const TestStat = ({ icon, label, value }) => (
  <div className="rounded-xl border border-primary-100 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-panel-dark">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
      {icon}
    </div>

    <p className="mt-3 text-[10px] text-muted-light dark:text-muted-dark">
      {label}
    </p>

    <p className="mt-0.5 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
      {value}
    </p>
  </div>
);

export default TestsPage;
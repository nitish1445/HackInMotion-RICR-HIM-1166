import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaClock,
  FaExclamationTriangle,
  FaMicrophone,
  FaPause,
  FaPlay,
  FaRedo,
  FaSpinner,
  FaStop,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../config/Api.jsx";

/* =====================================================
   CONFIG
===================================================== */

const DURATION_OPTIONS = [
  { label: "1 minute", seconds: 60 },
  { label: "2 minutes", seconds: 120 },
  { label: "3 minutes", seconds: 180 },
  { label: "5 minutes", seconds: 300 },
];

const MIN_MEANINGFUL_RECORDING_SECONDS = 5;

/* =====================================================
   HELPERS
===================================================== */

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const getSupportedMimeType = () => {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  if (typeof MediaRecorder === "undefined") return null;

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported?.(type)) return type;
  }

  return ""; // let the browser pick a default
};

/* =====================================================
   PAGE
===================================================== */

const ExplainPractice = () => {
  const navigate = useNavigate();

  /* ---------- topic config (reused from the existing question-bank API) ---------- */
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[1].seconds);

  /*
    phase:
    "setup"        -> choosing subject/topic/duration
    "ready"        -> instructions shown, mic not yet started
    "recording"    -> the actual recorder UI (drives its own recordingState)
  */
  const [phase, setPhase] = useState("setup");

  /* ---------- recorder ----------
     recordingState: IDLE | RECORDING | PAUSED | STOPPED | SUBMITTING | SUBMITTED | ERROR
  */
  const [recordingState, setRecordingState] = useState("IDLE");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordedSecondsRef = useRef(0);

  /* =====================================================
     LOAD SUBJECT/TOPIC CONFIG (reuses the mock-test config
     endpoint — same taxonomy already powering Assessment
     and Mock Tests, so this feature doesn't introduce a
     second topic list).
  ===================================================== */

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
        console.error("Load topic config error:", err);
        setConfigError(
          err?.response?.data?.message ||
            "Unable to load subjects and topics. Please try again."
        );
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  const availableTopics = useMemo(() => {
    if (!config || !selectedSubject) return [];
    return config.topicsBySubject?.[selectedSubject] || [];
  }, [config, selectedSubject]);

  useEffect(() => {
    if (availableTopics.length > 0) {
      setSelectedTopic(availableTopics[0]);
    } else {
      setSelectedTopic("");
    }
  }, [availableTopics]);

  /* =====================================================
     CLEANUP (object URL + any live stream/timer) on unmount
  ===================================================== */

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =====================================================
     TIMER
  ===================================================== */

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      recordedSecondsRef.current += 1;
      setElapsedSeconds(recordedSecondsRef.current);

      if (recordedSecondsRef.current >= selectedDuration) {
        stopRecording();
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* =====================================================
     RECORDING CONTROLS
  ===================================================== */

  const beginRecording = async () => {
    setErrorMessage("");

    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setRecordingState("ERROR");
      setErrorMessage(
        "Your browser doesn't support audio recording. Please try a recent version of Chrome, Edge, or Firefox."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recordedSecondsRef.current = 0;
      setElapsedSeconds(0);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState("STOPPED");
        stopTimer();
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };

      recorder.onerror = () => {
        setRecordingState("ERROR");
        setErrorMessage("Something went wrong while recording. Please try again.");
        stopTimer();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingState("RECORDING");
      startTimer();
    } catch (err) {
      console.error("getUserMedia error:", err);
      setRecordingState("ERROR");

      if (err?.name === "NotAllowedError" || err?.name === "SecurityError") {
        setErrorMessage(
          "Microphone permission is required to record your explanation."
        );
      } else if (err?.name === "NotFoundError") {
        setErrorMessage("No microphone was found on this device.");
      } else {
        setErrorMessage("Unable to access the microphone. Please try again.");
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("PAUSED");
      stopTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("RECORDING");
      startTimer();
    }
  };

  const stopRecording = () => {
    stopTimer();

    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === "recording" ||
        mediaRecorderRef.current.state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRetake = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    chunksRef.current = [];
    recordedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setErrorMessage("");
    setRecordingState("IDLE");
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async () => {
    if (recordedSecondsRef.current < MIN_MEANINGFUL_RECORDING_SECONDS) {
      toast.error(
        `Please record at least ${MIN_MEANINGFUL_RECORDING_SECONDS} seconds before submitting.`
      );
      return;
    }

    setRecordingState("SUBMITTING");

    try {
      await api.post("/api/explanations", {
        subject: selectedSubject,
        topic: selectedTopic,
        duration: selectedDuration,
        recordedDuration: recordedSecondsRef.current,
      });

      setRecordingState("SUBMITTED");
      toast.success("Explanation submitted successfully!");
    } catch (err) {
      console.error("Submit explanation error:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to submit your explanation. Please try again.";

      setErrorMessage(message);
      setRecordingState("STOPPED"); // keep the recording so they can retry submit
      toast.error(message);
    }
  };

  const handleStartOver = () => {
    handleRetake();
    setPhase("setup");
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
          🎤 Explain &amp; Practice
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          Explain &amp; Practice
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-light dark:text-muted-dark">
          Learn a topic, explain it in your own words, and improve your understanding.
        </p>

        {configError && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <FaExclamationTriangle size={11} className="mt-0.5 shrink-0" />
            {configError}
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
              disabled={configLoading || !config?.subjects?.length}
              className="w-full appearance-none rounded-lg border border-primary-200 bg-white py-2.5 pl-9 pr-4 text-sm text-ink-light outline-none transition-colors focus:border-primary-500 disabled:opacity-60 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
            >
              {configLoading && <option>Loading subjects...</option>}
              {!configLoading &&
                (config?.subjects || []).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
          </div>

          <label className="mb-1.5 mt-5 block text-sm font-medium text-ink-light dark:text-ink-dark">
            Topic
          </label>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={configLoading || availableTopics.length === 0}
            className="w-full appearance-none rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm text-ink-light outline-none transition-colors focus:border-primary-500 disabled:opacity-60 dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
          >
            {availableTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="mb-1.5 mt-5 block text-sm font-medium text-ink-light dark:text-ink-dark">
            Explanation Time
          </label>

          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                type="button"
                onClick={() => setSelectedDuration(opt.seconds)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedDuration === opt.seconds
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-primary-200 text-ink-light hover:border-primary-400 dark:border-primary-800 dark:text-ink-dark"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPhase("ready")}
            disabled={configLoading || !selectedSubject || !selectedTopic}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaMicrophone size={12} />
            Start Explanation
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — READY (instructions, before mic starts)
  ===================================================== */

  if (phase === "ready") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="mb-6 inline-flex items-center gap-2 text-xs text-muted-light hover:text-primary-500 dark:text-muted-dark"
        >
          <FaArrowLeft size={9} />
          Change topic
        </button>

        <div className="rounded-xl border border-primary-100 bg-white p-6 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-8">
          <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
            {selectedSubject}
          </p>
          <h1 className="mt-1 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            {selectedTopic}
          </h1>

          <p className="mt-4 text-sm font-medium text-ink-light dark:text-ink-dark">
            Explain the selected topic in your own words.
          </p>

          <p className="mt-2 text-xs text-muted-light dark:text-muted-dark">
            You can explain:
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-light dark:text-muted-dark">
            {[
              `What is ${selectedTopic}?`,
              "Why is it used?",
              "Any types or variations",
              "Give a simple example",
              "Explain it as if you are teaching another student",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary-400" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-primary-50/70 px-3 py-2 text-xs text-primary-600 dark:bg-white/5 dark:text-primary-300">
            <FaClock size={11} />
            You'll have up to {formatTime(selectedDuration)} to explain this topic.
          </div>

          <button
            type="button"
            onClick={() => {
              setPhase("recording");
              beginRecording();
            }}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-600"
          >
            <FaMicrophone size={12} />
            Start Recording
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — RECORDING PHASE
  ===================================================== */

  return (
    <div className="mx-auto w-full max-w-2xl">
      <button
        type="button"
        onClick={handleStartOver}
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-light hover:text-primary-500 dark:text-muted-dark"
      >
        <FaArrowLeft size={9} />
        Start over
      </button>

      <div className="rounded-xl border border-primary-100 bg-white p-6 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-8">
        <p className="text-[10px] font-mono uppercase tracking-wider text-primary-500">
          {selectedSubject}
        </p>
        <h1 className="mt-1 font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          {selectedTopic}
        </h1>

        {/* ERROR */}
        {recordingState === "ERROR" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
              <FaExclamationTriangle size={18} />
            </div>
            <p className="max-w-sm text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={beginRecording}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-xs font-medium text-white hover:bg-primary-600"
            >
              <FaRedo size={10} />
              Try Again
            </button>
          </div>
        )}

        {/* IDLE (rare — only hit if user retakes from STOPPED) */}
        {recordingState === "IDLE" && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-light dark:text-muted-dark">
              Ready to record your explanation.
            </p>
            <button
              type="button"
              onClick={beginRecording}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-sm font-medium text-white shadow-soft hover:bg-primary-600"
            >
              <FaMicrophone size={13} />
              Start Recording
            </button>
          </div>
        )}

        {/* RECORDING / PAUSED */}
        {(recordingState === "RECORDING" || recordingState === "PAUSED") && (
          <div className="mt-6 flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  recordingState === "RECORDING"
                    ? "animate-pulse bg-red-500"
                    : "bg-amber-500"
                }`}
              />
              <p className="text-sm font-medium text-ink-light dark:text-ink-dark">
                {recordingState === "RECORDING" ? "🎙 Recording..." : "Paused"}
              </p>
            </div>

            <p className="font-mono text-4xl font-semibold text-ink-light dark:text-ink-dark">
              {formatTime(elapsedSeconds)}{" "}
              <span className="text-lg text-muted-light dark:text-muted-dark">
                / {formatTime(selectedDuration)}
              </span>
            </p>

            <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-1000"
                style={{
                  width: `${Math.min(100, (elapsedSeconds / selectedDuration) * 100)}%`,
                }}
              />
            </div>

            <div className="flex gap-3">
              {recordingState === "RECORDING" ? (
                <button
                  type="button"
                  onClick={pauseRecording}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-5 py-2.5 text-sm font-medium text-ink-light hover:bg-primary-50 dark:border-primary-800 dark:text-ink-dark dark:hover:bg-white/5"
                >
                  <FaPause size={11} />
                  Pause
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resumeRecording}
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-5 py-2.5 text-sm font-medium text-ink-light hover:bg-primary-50 dark:border-primary-800 dark:text-ink-dark dark:hover:bg-white/5"
                >
                  <FaPlay size={11} />
                  Resume
                </button>
              )}

              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600"
              >
                <FaStop size={11} />
                Stop
              </button>
            </div>
          </div>
        )}

        {/* STOPPED — preview + retake/submit */}
        {(recordingState === "STOPPED" ||
          recordingState === "SUBMITTING" ||
          recordingState === "SUBMITTED") && (
          <div className="mt-6 flex flex-col items-center gap-5">
            <p className="text-sm text-muted-light dark:text-muted-dark">
              Recorded {formatTime(recordedSecondsRef.current)} of{" "}
              {formatTime(selectedDuration)}
            </p>

            {audioUrl && (
              <audio
                controls
                src={audioUrl}
                className="w-full max-w-sm"
                style={{ height: "40px" }}
              />
            )}

            {recordingState === "SUBMITTED" ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Explanation submitted successfully!
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    Practice Another Topic
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-5 py-2.5 text-sm font-medium text-ink-light hover:bg-primary-50 dark:border-primary-800 dark:text-ink-dark dark:hover:bg-white/5"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                    <FaExclamationTriangle size={11} className="mt-0.5 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    disabled={recordingState === "SUBMITTING"}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-5 py-2.5 text-sm font-medium text-ink-light hover:bg-primary-50 disabled:opacity-50 dark:border-primary-800 dark:text-ink-dark dark:hover:bg-white/5"
                  >
                    <FaRedo size={11} />
                    Retake
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={recordingState === "SUBMITTING"}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {recordingState === "SUBMITTING" ? (
                      <>
                        <FaSpinner size={11} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Explanation"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplainPractice;
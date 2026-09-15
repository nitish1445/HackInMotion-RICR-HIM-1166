import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaMicrophone,
  FaPause,
  FaPlay,
  FaRedo,
  FaSpinner,
  FaStop,
  FaVideo,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

import api from "../../config/Api.jsx";

/* =====================================================
   CONFIG
===================================================== */

const MAX_RECORDING_SECONDS = 300; // 5 minutes hard cap for this UI
const MIN_MEANINGFUL_RECORDING_SECONDS = 5;

const ANALYSIS_STEPS = [
  "Uploading recording",
  "Processing speech",
  "Understanding your answer",
  "AI evaluating response",
  "Generating feedback",
];

/* =====================================================
   HELPERS
===================================================== */

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const getSupportedMimeType = (video) => {
  if (typeof MediaRecorder === "undefined") return null;

  const candidates = video
    ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
    : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported?.(type)) return type;
  }
  return "";
};

/* =====================================================
   PAGE
===================================================== */

const AiTutor = () => {
  const navigate = useNavigate();

  /* ---------- topic / mode ---------- */
  const [mode, setMode] = useState("speaking"); // "speaking" | "video"
  const [question, setQuestion] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questionLoading, setQuestionLoading] = useState(true);
  const [questionError, setQuestionError] = useState("");

  const [customizing, setCustomizing] = useState(false);
  const [config, setConfig] = useState(null);
  const [customSubject, setCustomSubject] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  /*
    phase:
    "setup"      -> mode + topic selection
    "ready"      -> instructions, mic/camera not yet started
    "recording"  -> live recorder (drives recordingState)
    "review"     -> stopped, preview + retake/analyze
    "analyzing"  -> staged loading while the real request runs
  */
  const [phase, setPhase] = useState("setup");

  /* recordingState: IDLE | RECORDING | PAUSED | STOPPED | ERROR */
  const [recordingState, setRecordingState] = useState("IDLE");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState(null);
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordedSecondsRef = useRef(0);
  const liveVideoRef = useRef(null);
  const blobRef = useRef(null);
  const stepTimerRef = useRef(null);

  /* =====================================================
     LOAD TODAY'S QUESTION
  ===================================================== */

  const loadTodayQuestion = async () => {
    try {
      setQuestionLoading(true);
      setQuestionError("");

      const response = await api.get("/api/practice/today");
      const data = response.data?.data;

      setSubject(data.subject);
      setTopic(data.topic);
      setQuestion(data.question);
    } catch (err) {
      console.error("Load today's question error:", err);
      setQuestionError(
        err?.response?.data?.message || "Unable to load today's question."
      );
    } finally {
      setQuestionLoading(false);
    }
  };

  useEffect(() => {
    loadTodayQuestion();
  }, []);

  /* =====================================================
     CUSTOM TOPIC CONFIG (reuses existing question-bank API)
  ===================================================== */

  useEffect(() => {
    if (!customizing || config) return;

    (async () => {
      try {
        const response = await api.get("/api/tests/config");
        const data = response.data?.data;
        setConfig(data);
        if (data?.subjects?.length > 0) {
          setCustomSubject(data.subjects[0]);
        }
      } catch (err) {
        console.error("Load custom topic config error:", err);
        toast.error("Unable to load subjects for custom topic selection.");
      }
    })();
  }, [customizing, config]);

  const customTopics = useMemo(() => {
    if (!config || !customSubject) return [];
    return config.topicsBySubject?.[customSubject] || [];
  }, [config, customSubject]);

  useEffect(() => {
    if (customTopics.length > 0) setCustomTopic(customTopics[0]);
  }, [customTopics]);

  const applyCustomTopic = () => {
    if (!customSubject || !customTopic) return;
    setSubject(customSubject);
    setTopic(customTopic);
    setQuestion(
      `Explain ${customTopic} in ${customSubject}. Cover what it is, why it's used, and give a simple example — as if you were teaching another student.`
    );
    setCustomizing(false);
  };

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
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
      if (recordedSecondsRef.current >= MAX_RECORDING_SECONDS) {
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
        "Your browser doesn't support recording. Please try a recent version of Chrome, Edge, or Firefox."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        mode === "video" ? { video: true, audio: true } : { audio: true }
      );
      streamRef.current = stream;

      if (mode === "video" && liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }

      const mimeType = getSupportedMimeType(mode === "video");
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
        const fallbackMimeType = mode === "video" ? "video/webm" : "audio/webm";
        const recorderMimeType = recorder.mimeType || mimeType;
        const recordedMimeType = recorderMimeType?.startsWith(`${mode === "video" ? "video" : "audio"}/`)
          ? recorderMimeType.split(";", 1)[0]
          : fallbackMimeType;
        const blob = new Blob(chunksRef.current, {
          type: recordedMimeType,
        });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        setRecordingState("STOPPED");
        setPhase("review");
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
          mode === "video"
            ? "Camera and microphone permission is required to record your answer."
            : "Microphone permission is required to record your answer."
        );
      } else if (err?.name === "NotFoundError") {
        setErrorMessage(
          mode === "video"
            ? "No camera/microphone was found on this device."
            : "No microphone was found on this device."
        );
      } else {
        setErrorMessage("Unable to access the microphone/camera. Please try again.");
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
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(null);
    blobRef.current = null;
    chunksRef.current = [];
    recordedSecondsRef.current = 0;
    setElapsedSeconds(0);
    setErrorMessage("");
    setRecordingState("IDLE");
    setPhase("ready");
  };

  /* =====================================================
     ANALYZE
  ===================================================== */

  const handleAnalyze = async () => {
    if (recordedSecondsRef.current < MIN_MEANINGFUL_RECORDING_SECONDS) {
      toast.error(
        `Please record at least ${MIN_MEANINGFUL_RECORDING_SECONDS} seconds before analyzing.`
      );
      return;
    }

    setPhase("analyzing");
    setErrorMessage("");
    setAnalysisStepIndex(0);

    // Staged visual progress — the real request runs in parallel;
    // this just gives the user meaningful feedback while it's in flight.
    stepTimerRef.current = setInterval(() => {
      setAnalysisStepIndex((prev) =>
        prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev
      );
    }, 1600);

    try {
      const formData = new FormData();

      if (mode === "speaking") {
        formData.append("audio", blobRef.current, "answer.webm");
      } else {
        formData.append("video", blobRef.current, "answer.webm");
      }

      formData.append("question", question);
      formData.append("mode", mode);
      formData.append("subject", subject);
      formData.append("topic", topic);
      formData.append("recordedDuration", String(recordedSecondsRef.current));

      const response = await api.post("/api/practice/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data?.data;

      clearInterval(stepTimerRef.current);
      toast.success("Your answer has been analyzed!");
      navigate(`/dashboard/ai-tutor/result/${result.id}`, { state: { result } });
    } catch (err) {
      console.error("Analyze error:", err);
      clearInterval(stepTimerRef.current);

      const message =
        err?.response?.data?.message ||
        "Unable to analyze your answer right now. Please try again.";

      setErrorMessage(message);
      setPhase("review"); // keep the recording so they can retry without re-recording
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
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-light transition-colors hover:text-primary-500 dark:text-muted-dark"
          >
            <FaArrowLeft size={9} />
            Back
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/ai-tutor/history")}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-light transition-colors hover:text-primary-500 dark:text-muted-dark"
          >
            <FaHistory size={10} />
            History
          </button>
        </div>

        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          AI Tutor
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-light dark:text-ink-dark sm:text-3xl">
          Explain &amp; Get Scored
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-light dark:text-muted-dark">
          Answer out loud, and get real AI-evaluated feedback on relevance, clarity, grammar, and more.
        </p>

        <div className="mt-7 rounded-xl border border-primary-100 bg-white p-5 shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-7">
          <label className="mb-1.5 block text-sm font-medium text-ink-light dark:text-ink-dark">
            Mode
          </label>
          <div className="flex rounded-lg border border-primary-100 bg-primary-50/50 p-1 dark:border-white/5 dark:bg-white/2">
            <button
              type="button"
              onClick={() => setMode("speaking")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "speaking"
                  ? "bg-primary-500 text-white"
                  : "text-muted-light hover:bg-primary-50 dark:text-muted-dark"
              }`}
            >
              <FaMicrophone size={12} />
              Speaking
            </button>
            <button
              type="button"
              onClick={() => setMode("video")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "video"
                  ? "bg-primary-500 text-white"
                  : "text-muted-light hover:bg-primary-50 dark:text-muted-dark"
              }`}
            >
              <FaVideo size={12} />
              Video
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <label className="block text-sm font-medium text-ink-light dark:text-ink-dark">
              Today's Question
            </label>
            <button
              type="button"
              onClick={() => setCustomizing((prev) => !prev)}
              className="text-xs font-medium text-primary-500 hover:underline"
            >
              {customizing ? "Use today's question" : "Choose a different topic"}
            </button>
          </div>

          {!customizing && (
            <div className="mt-2 rounded-lg bg-primary-50/70 p-4 dark:bg-white/5">
              {questionLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
                  <FaSpinner size={10} className="animate-spin" />
                  Loading today's question...
                </div>
              ) : questionError ? (
                <p className="text-xs text-red-600 dark:text-red-400">{questionError}</p>
              ) : (
                <>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
                    {subject} &middot; {topic}
                  </p>
                  <p className="mt-1.5 text-sm text-ink-light dark:text-ink-dark">
                    {question}
                  </p>
                </>
              )}
            </div>
          )}

          {customizing && (
            <div className="mt-2 space-y-3 rounded-lg border border-primary-100 p-4 dark:border-white/5">
              <div className="relative">
                <FaBookOpen
                  size={11}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500"
                />
                <select
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  disabled={!config}
                  className="w-full appearance-none rounded-lg border border-primary-200 bg-white py-2 pl-9 pr-4 text-sm text-ink-light outline-none dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
                >
                  {(config?.subjects || []).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                disabled={customTopics.length === 0}
                className="w-full appearance-none rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm text-ink-light outline-none dark:border-primary-800 dark:bg-panel-dark dark:text-ink-dark"
              >
                {customTopics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={applyCustomTopic}
                className="w-full rounded-lg bg-primary-500 py-2 text-xs font-medium text-white hover:bg-primary-600"
              >
                Use this topic
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setPhase("ready")}
            disabled={questionLoading || !question}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === "video" ? <FaVideo size={12} /> : <FaMicrophone size={12} />}
            Continue
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — READY (instructions)
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
            {subject} &middot; {topic}
          </p>
          <h1 className="mt-2 text-sm font-medium leading-6 text-ink-light dark:text-ink-dark">
            {question}
          </h1>

          <div className="mt-5 flex items-center gap-2 rounded-lg bg-primary-50/70 px-3 py-2 text-xs text-primary-600 dark:bg-white/5 dark:text-primary-300">
            {mode === "video" ? <FaVideo size={11} /> : <FaMicrophone size={11} />}
            {mode === "video"
              ? "This will use your camera and microphone."
              : "This will use your microphone."}
          </div>

          <button
            type="button"
            onClick={() => {
              setPhase("recording");
              beginRecording();
            }}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3 text-sm font-medium text-white shadow-soft transition-all hover:bg-primary-600"
          >
            {mode === "video" ? <FaVideo size={12} /> : <FaMicrophone size={12} />}
            Start Recording
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — ANALYZING
  ===================================================== */

  if (phase === "analyzing") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-xl border border-primary-100 bg-white p-8 text-center shadow-soft dark:border-white/5 dark:bg-panel-dark sm:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaSpinner size={18} className="animate-spin" />
          </div>
          <h1 className="mt-4 font-display text-lg font-semibold text-ink-light dark:text-ink-dark">
            Analyzing your answer...
          </h1>

          <div className="mx-auto mt-6 max-w-xs space-y-3 text-left">
            {ANALYSIS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                {i < analysisStepIndex ? (
                  <FaCheckCircle size={14} className="shrink-0 text-emerald-500" />
                ) : i === analysisStepIndex ? (
                  <FaSpinner size={14} className="shrink-0 animate-spin text-primary-500" />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary-100 dark:border-white/10" />
                )}
                <span
                  className={`text-sm ${
                    i <= analysisStepIndex
                      ? "text-ink-light dark:text-ink-dark"
                      : "text-muted-light dark:text-muted-dark"
                  }`}
                >
                  {step}
                  {i < analysisStepIndex ? " ✓" : i === analysisStepIndex ? "..." : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI — RECORDING / REVIEW
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
          {subject} &middot; {topic}
        </p>
        <h1 className="mt-1 text-sm font-medium leading-6 text-ink-light dark:text-ink-dark">
          {question}
        </h1>

        {recordingState === "ERROR" && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
              <FaExclamationTriangle size={18} />
            </div>
            <p className="max-w-sm text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
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

        {(recordingState === "RECORDING" || recordingState === "PAUSED") && (
          <div className="mt-6 flex flex-col items-center gap-5">
            {mode === "video" && (
              <video
                ref={liveVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full max-w-sm rounded-lg bg-black"
              />
            )}

            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  recordingState === "RECORDING" ? "animate-pulse bg-red-500" : "bg-amber-500"
                }`}
              />
              <p className="text-sm font-medium text-ink-light dark:text-ink-dark">
                {recordingState === "RECORDING" ? "🎙 Recording..." : "Paused"}
              </p>
            </div>

            <p className="font-mono text-4xl font-semibold text-ink-light dark:text-ink-dark">
              {formatTime(elapsedSeconds)}
            </p>

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

        {phase === "review" && mediaUrl && (
          <div className="mt-6 flex flex-col items-center gap-5">
            <p className="text-sm text-muted-light dark:text-muted-dark">
              Recorded {formatTime(recordedSecondsRef.current)}
            </p>

            {mode === "video" ? (
              <video controls src={mediaUrl} className="w-full max-w-sm rounded-lg" />
            ) : (
              <audio controls src={mediaUrl} className="w-full max-w-sm" style={{ height: "40px" }} />
            )}

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
                className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-5 py-2.5 text-sm font-medium text-ink-light hover:bg-primary-50 dark:border-primary-800 dark:text-ink-dark dark:hover:bg-white/5"
              >
                <FaRedo size={11} />
                Retake
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
              >
                Analyze Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiTutor;
import React, { useState } from "react";
import {
  FaArrowUp,
  FaExclamationTriangle,
  FaRobot,
  FaSpinner,
  FaUser,
} from "react-icons/fa";

import api from "../../config/Api.jsx";

/*
  Only the last N turns are sent as history, to keep the
  request payload reasonably small.
*/
const MAX_HISTORY_TURNS = 10;

const AIAssistantPage = () => {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: "Hi! I'm your EduTech learning assistant. Ask me anything about what you're currently studying.",
    },
  ]);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = message.trim();

    if (!trimmed || sending) return;

    setError("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    /*
      Build the conversation history to send for context,
      from the messages that exist right now (before adding
      the new user message), mapped to {role, content}.
    */
    const conversation = messages
      .filter((item) => item.role === "user" || item.role === "ai")
      .slice(-MAX_HISTORY_TURNS)
      .map((item) => ({
        role: item.role === "ai" ? "assistant" : "user",
        content: item.text,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setSending(true);

    try {
      const response = await api.post("/api/ai/chat", {
        message: trimmed,
        conversation,
      });

      const reply =
        response.data?.message ||
        "I couldn't generate a response for that. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          text: reply,
        },
      ]);
    } catch (err) {
      console.error("AI chat error:", err);

      const friendlyMessage =
        err?.response?.data?.message ||
        "Something went wrong reaching the AI assistant. Please try again.";

      setError(friendlyMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] w-full max-w-5xl flex-col">

      <div className="mb-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary-500">
          AI learning assistant
        </p>

        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">
          Ask your tutor
        </h1>
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-primary-100 px-5 py-4 dark:border-white/5">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
            <FaRobot size={15} />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-light dark:text-ink-dark">
              EduTech AI
            </p>

            <p className="text-[10px] text-primary-500">
              Learning assistant · Online
            </p>
          </div>

        </div>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">

          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex gap-3 ${
                item.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              {item.role === "ai" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                  <FaRobot size={12} />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-6 ${
                  item.role === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-primary-50 text-ink-light dark:bg-white/5 dark:text-ink-dark"
                }`}
              >
                {item.text}
              </div>

              {item.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
                  <FaUser size={11} />
                </div>
              )}

            </div>
          ))}

          {sending && (
            <div className="flex justify-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                <FaRobot size={12} />
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-muted-light dark:bg-white/5 dark:text-muted-dark">
                <FaSpinner size={11} className="animate-spin" />
                Thinking...
              </div>
            </div>
          )}

        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <FaExclamationTriangle size={11} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-primary-100 p-4 dark:border-white/5"
        >
          <div className="flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50/50 p-1 dark:border-white/5 dark:bg-white/[0.02]">

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask something you're learning..."
              disabled={sending}
              maxLength={2000}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink-light outline-none placeholder:text-muted-light/60 disabled:opacity-60 dark:text-ink-dark dark:placeholder:text-muted-dark/60"
            />

            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? (
                <FaSpinner size={11} className="animate-spin" />
              ) : (
                <FaArrowUp size={11} />
              )}
            </button>

          </div>

          <p className="mt-2 px-1 text-[9px] text-muted-light dark:text-muted-dark">
            EduTech AI uses your learning context to personalize explanations.
          </p>
        </form>

      </section>
    </div>
  );
};

export default AIAssistantPage;
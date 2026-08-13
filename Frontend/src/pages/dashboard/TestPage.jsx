import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaArrowRight, FaClock } from "react-icons/fa";

const TestPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();

  const [selected, setSelected] = useState("");

  const question = {
    number: 1,
    total: 15,
    text: "Which statement best describes a JavaScript Promise?",
    options: [
      "A function that always runs synchronously",
      "An object representing the eventual completion or failure of an operation",
      "A variable that stores multiple functions",
      "A loop used to handle asynchronous operations",
    ],
  };

  const handleNext = () => {
    /*
      Later:
      await api.post(`/user/tests/${testId}/answer`, {
        answer: selected,
      });
    */

    setSelected("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl">

      <button
        onClick={() => navigate("/dashboard/tests")}
        className="inline-flex items-center gap-2 text-xs text-muted-light hover:text-primary-500 dark:text-muted-dark"
      >
        <FaArrowLeft size={9} />
        Exit test
      </button>

      <div className="mt-5 rounded-xl border border-primary-100 bg-white shadow-soft dark:border-white/5 dark:bg-panel-dark">

        <div className="flex items-center justify-between border-b border-primary-100 px-5 py-4 dark:border-white/5">

          <div>
            <p className="text-[9px] font-mono uppercase tracking-wider text-primary-500">
              Async JavaScript
            </p>

            <p className="mt-1 text-sm font-semibold text-ink-light dark:text-ink-dark">
              Question {question.number} of {question.total}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-light dark:text-muted-dark">
            <FaClock size={10} />
            18:42
          </div>

        </div>

        <div className="p-5 sm:p-8">

          <div className="h-1.5 overflow-hidden rounded-full bg-primary-50 dark:bg-white/5">
            <div className="h-full w-[7%] rounded-full bg-primary-500" />
          </div>

          <h1 className="mt-8 font-display text-xl font-semibold leading-7 text-ink-light dark:text-ink-dark">
            {question.text}
          </h1>

          <div className="mt-6 space-y-3">

            {question.options.map((option, index) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelected(option)}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                  selected === option
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

          <button
            type="button"
            onClick={handleNext}
            disabled={!selected}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next question
            <FaArrowRight size={10} />
          </button>

        </div>

      </div>
    </div>
  );
};

export default TestPage;
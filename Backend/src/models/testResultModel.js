import mongoose from "mongoose";

/*
=========================================================
TOPIC PERFORMANCE (SUBDOCUMENT)
=========================================================
*/

const topicPerformanceSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 0,
    },

    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

/*
=========================================================
ANSWER (SUBDOCUMENT)

One entry per question in the test, recorded at submit
time. Kept lightweight — the question text/options/correct
answer are re-derived from the (static) question bank via
questionId when building a review, rather than duplicated
here.
=========================================================
*/

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    selectedAnswer: {
      type: Number,
      default: null,
    },

    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

/*
=========================================================
TEST RESULT

Doubles as the server-side "test session": a document is
created in "in-progress" status at generation time (the
document's own _id IS the testId), holding the exact
question ids that were served. Submission looks the
session up by id + owning user, so the backend — not the
client — is the source of truth for which questions
belonged to the test.
=========================================================
*/

const testResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    topics: {
      type: [String],
      default: [], // empty = "All Topics"
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      required: true,
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
      index: true,
    },

    /*
     * The exact, ordered set of question ids generated for
     * this test — the authoritative session record.
     */
    questionIds: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "A test must have at least one question.",
      },
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    attemptedQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    unansweredQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    topicPerformance: {
      type: [topicPerformanceSchema],
      default: [],
    },

    answers: {
      type: [answerSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/*
 * "My recent tests" / history is the main read pattern.
 */
testResultSchema.index({ user: 1, status: 1, completedAt: -1 });

const TestResult = mongoose.model("TestResult", testResultSchema);

export default TestResult;
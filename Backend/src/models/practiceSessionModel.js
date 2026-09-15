import mongoose from "mongoose";

/*
=========================================================
PRACTICE SESSION

Replaces the earlier, lighter-weight "Explanation" model
from the first phase of this feature (metadata only, no
transcript/scoring) — this is the real, complete record of
an AI-analyzed practice attempt: what was asked, what the
student actually said (transcript), and the AI's full
structured evaluation.

A document is only ever created AFTER a successful AI
evaluation (see practiceController.js) — there is no
"pending"/"failed" row left behind for an attempt that
never completed, so existence of a document already means
completion. No separate `status` field is needed.
=========================================================
*/

const breakdownSchema = new mongoose.Schema(
  {
    relevance: { type: Number, required: true, min: 0, max: 100 },
    contentAccuracy: { type: Number, required: true, min: 0, max: 100 },
    completeness: { type: Number, required: true, min: 0, max: 100 },
    clarity: { type: Number, required: true, min: 0, max: 100 },
    grammar: { type: Number, required: true, min: 0, max: 100 },
    vocabulary: { type: Number, required: true, min: 0, max: 100 },
    fluency: { type: Number, required: true, min: 0, max: 100 },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    fillerWords: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const practiceSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      trim: true,
      default: "General",
    },

    topic: {
      type: String,
      trim: true,
      default: "",
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["speaking", "video"],
      required: true,
    },

    transcript: {
      type: String,
      required: true,
    },

    /*
     * Actual recorded length, in seconds.
     */
    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    breakdown: {
      type: breakdownSchema,
      required: true,
    },

    feedback: {
      type: String,
      required: true,
    },

    strengths: {
      type: [String],
      default: [],
    },

    improvements: {
      type: [String],
      default: [],
    },

    nextPractice: {
      type: String,
      default: "",
    },

    /*
     * Cloudinary URL of the uploaded recording. The raw
     * file itself is never stored in MongoDB.
     */
    recordingUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
 * History listing and stats aggregation both query by
 * user, most-recent-first.
 */
practiceSessionSchema.index({ user: 1, createdAt: -1 });

const PracticeSession = mongoose.model(
  "PracticeSession",
  practiceSessionSchema
);

export default PracticeSession;
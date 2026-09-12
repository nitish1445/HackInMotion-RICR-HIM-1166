import mongoose from "mongoose";

/*
=========================================================
EXPLANATION ATTEMPT

Phase 1 (this feature): stores only metadata about a
voice-explanation attempt — subject, topic, requested vs.
actual recorded duration, and status. The audio itself is
NOT persisted; the frontend only keeps the recorded Blob
in memory for preview before/at submission.

`status` is intentionally a broader enum than this phase
needs, so Part 2 (Gemini transcription + evaluation) can
transition a document from "submitted" -> "evaluated" (or
"failed") without a schema migration.
=========================================================
*/

const explanationSchema = new mongoose.Schema(
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
    },

    topic: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * The time limit the student selected before
     * recording, in seconds (e.g. 120 for "2 minutes").
     */
    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    /*
     * How long the student actually recorded for, in
     * seconds. Always <= duration.
     */
    recordedDuration: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["submitted", "evaluated", "failed"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

explanationSchema.index({ user: 1, createdAt: -1 });

const Explanation = mongoose.model("Explanation", explanationSchema);

export default Explanation;
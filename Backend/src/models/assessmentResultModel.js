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
ASSESSMENT RESULT
=========================================================
*/

const assessmentResultSchema = new mongoose.Schema(
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

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },

    score: {
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

    level: {
      type: String,
      enum: ["Foundation", "Beginner", "Intermediate", "Advanced"],
      required: true,
    },

    topicPerformance: {
      type: [topicPerformanceSchema],
      default: [],
    },

    strongTopics: {
      type: [String],
      default: [],
    },

    weakTopics: {
      type: [String],
      default: [],
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Fetching "latest result for this user in this subject"
 * is the main query pattern (dashboard widget, history).
 */
assessmentResultSchema.index({ user: 1, subject: 1, completedAt: -1 });

const AssessmentResult = mongoose.model(
  "AssessmentResult",
  assessmentResultSchema
);

export default AssessmentResult;
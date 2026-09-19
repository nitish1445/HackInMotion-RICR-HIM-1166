import mongoose from "mongoose";

/*
=========================================================
LEARNING ACTIVITY

A single, unified event log for every REAL learning action
a student performs across the platform. This is the source
of truth for:

- the GitHub-style "Learning Activity" contribution heatmap
- streak calculation (current / longest)
- "active learner" counts
- the consistency component of the competition ranking

Every document here corresponds to something the student
actually did — it is written from inside the controllers
that already own that action (assessment submission, mock
test submission, study-plan session completion, AI chat,
explanation/practice attempts) rather than being inferred
from generic page views.

`activityType` is intentionally scoped to features that
already exist in this codebase — see the individual
controllers for where each value is written:

  ASSESSMENT_COMPLETED         -> assessmentController.submitAssessment
  MOCK_TEST_COMPLETED          -> testController.submitTest
  STUDY_PLAN_TASK_COMPLETED    -> studyPlanController.updateSession / updateMySession
  AI_INTERACTION               -> Aicontroller.chatWithAI
  VIDEO_EXPLANATION_COMPLETED  -> explanationController.createExplanation
=========================================================
*/

export const ACTIVITY_TYPES = [
  "ASSESSMENT_COMPLETED",
  "MOCK_TEST_COMPLETED",
  "STUDY_PLAN_TASK_COMPLETED",
  "AI_INTERACTION",
  "VIDEO_EXPLANATION_COMPLETED",
];

/*
 * Human-readable labels used when building tooltip/summary
 * text server-side, so the frontend never has to hardcode
 * a second copy of this mapping.
 */
export const ACTIVITY_TYPE_LABELS = {
  ASSESSMENT_COMPLETED: "Completed Knowledge Assessment",
  MOCK_TEST_COMPLETED: "Completed Mock Test",
  STUDY_PLAN_TASK_COMPLETED: "Completed Study Plan Task",
  AI_INTERACTION: "Used AI Study Assistant",
  VIDEO_EXPLANATION_COMPLETED: "Completed Topic Explanation",
};

const learningActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    activityType: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },

    /*
     * Optional — AI_INTERACTION has no fixed subject, every
     * other activity type sets this from real data
     * (assessment/test/session/explanation subject).
     */
    subject: {
      type: String,
      default: "",
      trim: true,
    },

    topic: {
      type: String,
      default: "",
      trim: true,
    },

    /*
     * Small, activity-specific extra context (score,
     * percentage, session type, etc.) used for tooltips —
     * never anything sensitive (no answers, no chat text).
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /*
     * When the activity actually happened. Defaults to now,
     * but callers pass the source document's own
     * completedAt so the heatmap reflects the real moment
     * of completion rather than whenever this write runs.
     */
    occurredAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Primary read pattern: "this user's activity, most recent
 * first" — heatmap + streak calculation.
 */
learningActivitySchema.index({ user: 1, occurredAt: -1 });

/*
 * "Active learners in this subject" / subject-specific
 * ranking consistency component.
 */
learningActivitySchema.index({ subject: 1, occurredAt: -1 });

learningActivitySchema.index({ user: 1, subject: 1, occurredAt: -1 });

const LearningActivity = mongoose.model(
  "LearningActivity",
  learningActivitySchema
);

export default LearningActivity;

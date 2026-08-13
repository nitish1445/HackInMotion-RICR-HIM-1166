import mongoose from "mongoose";

/*
=========================================================
SESSION SCHEMA
=========================================================
*/

const sessionSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: [
          "LEARN",
          "PRACTICE",
          "TEST",
          "REVIEW",
        ],
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      topic: {
        type: String,
        default: "",
        trim: true,
      },

      duration: {
        type: Number,
        required: true,
        min: 1,
      },

      completed: {
        type: Boolean,
        default: false,
      },

      completedAt: {
        type: Date,
        default: null,
      },

      link: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    },
  );

/*
=========================================================
DAY SCHEMA
=========================================================
*/

const studyDaySchema =
  new mongoose.Schema(
    {
      day: {
        type: String,
        required: true,
      },

      date: {
        type: Date,
        required: true,
      },

      sessions: {
        type: [sessionSchema],
        default: [],
      },
    },
    {
      _id: true,
    },
  );

/*
=========================================================
STUDY PLAN SCHEMA
=========================================================
*/

const studyPlanSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      goal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Goal",
        required: true,
        index: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      days: {
        type: [studyDaySchema],
        default: [],
      },
    },
    {
      timestamps: true,
    },
  );

/*
=========================================================
PREVENT DUPLICATE PLAN
=========================================================
*/

studyPlanSchema.index(
  {
    user: 1,
    goal: 1,
  },
  {
    unique: true,
  },
);

const StudyPlan =
  mongoose.models.StudyPlan ||
  mongoose.model(
    "StudyPlan",
    studyPlanSchema,
  );

export default StudyPlan;
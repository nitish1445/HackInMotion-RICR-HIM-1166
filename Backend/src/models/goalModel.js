import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    level: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
      default: "Beginner",
    },

    hoursPerDay: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 24,
    },

    totalTopics: {
      type: Number,
      required: true,
      min: 1,
    },

    completedTopics: {
      type: Number,
      default: 0,
      min: 0,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    targetDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "active",
        "completed",
        "overdue",
      ],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

/*
=========================================================
AUTO PROGRESS
=========================================================
*/

goalSchema.pre("save", function () {
  if (this.totalTopics > 0) {
    this.progress = Math.min(
      100,
      Math.round(
        (this.completedTopics /
          this.totalTopics) *
          100
      )
    );
  }

  if (this.progress >= 100) {
    this.progress = 100;
    this.status = "completed";
  } else if (
    this.targetDate &&
    new Date(this.targetDate) <
      new Date()
  ) {
    this.status = "overdue";
  } else {
    this.status = "active";
  }
});

const Goal =
  mongoose.model("Goal", goalSchema);

export default Goal;
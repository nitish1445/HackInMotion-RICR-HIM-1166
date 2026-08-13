import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["LEARN", "PRACTICE", "TEST", "REVIEW"],
      default: "LEARN",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      default: "30 min",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const achievementSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "🏆",
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const dashboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    studyHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    activeGoal: {
      title: {
        type: String,
        default: "",
        trim: true,
      },

      subject: {
        type: String,
        default: "",
        trim: true,
      },

      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      daysLeft: {
        type: Number,
        default: 0,
        min: 0,
      },

      completedTopics: {
        type: Number,
        default: 0,
        min: 0,
      },

      totalTopics: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    today: {
      type: [taskSchema],
      default: [],
    },

    achievements: {
      type: [achievementSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);

export default Dashboard;
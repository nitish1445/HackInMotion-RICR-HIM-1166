import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import cloudinary from "./src/config/cloudinary.js";

import AuthRouter from "./src/routers/authRouter.js";
import connectDB from "./src/config/db.js";
import DashboardRouter from "./src/routers/dashboardRouter.js";
import GoalRouter from "./src/routers/goalRouter.js";
import studyPlanRouter from "./src/routers/studyPlanRouter.js";
import ProgressRouter from "./src/routers/progressRouter.js";
import AiRouter from "./src/routers/Airouter.js";
import AssessmentRouter from "./src/routers/assessmentRouter.js";
import TestRouter from "./src/routers/testRouter.js";
import PracticeRouter from "./src/routers/practiceRouter.js";

/* =========================================================
   DEBUG ENV
========================================================= */

console.log("=================================");
console.log("ENVIRONMENT CHECK");

console.log(
  "GEMINI_API_KEY loaded:",
  Boolean(process.env.GEMINI_API_KEY)
);

console.log(
  "GEMINI_MODEL:",
  process.env.GEMINI_MODEL || "gemini-3.7-flash"
);

console.log(
  "PORT:",
  process.env.PORT || 4500
);

console.log("=================================");

/* =========================================================
   APP
========================================================= */

const app = express();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://devlab-hackathon-project.vercel.app",
    ],
    credentials: true,
  })
);

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

/* =========================================================
   ROUTES
========================================================= */

app.use("/auth", AuthRouter);

app.use("/dashboard", DashboardRouter);

app.use("/goals", GoalRouter);

app.use("/study-plans", studyPlanRouter);

app.use("/progress", ProgressRouter);

app.use("/api/ai", AiRouter);

app.use("/api/assessment", AssessmentRouter);

app.use("/api/tests", TestRouter);

app.use("/api/practice", PracticeRouter);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EduTech backend server is working",
  });
});

/* =========================================================
   AI HEALTH CHECK
========================================================= */

app.get("/api/ai/health", (req, res) => {
  const configured =
    Boolean(process.env.GEMINI_API_KEY);

  res.status(configured ? 200 : 503).json({
    success: configured,

    aiConfigured: configured,

    provider: "Google Gemini",

    model:
      process.env.GEMINI_MODEL ||
      "gemini-3.7-flash",

    message: configured
      ? "Gemini AI service is configured."
      : "Gemini AI service is not configured. Missing GEMINI_API_KEY.",
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("=================================");
  console.error("GLOBAL ERROR");
  console.error("Message:", err?.message);
  console.error("Code:", err?.code);
  console.error("Status:", err?.statusCode);
  console.error("=================================");

  const errorMessage =
    err?.message ||
    "Internal Server Error";

  const statusCode =
    err?.statusCode ||
    500;

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    code:
      err?.code ||
      "SERVER_ERROR",
  });
});

/* =========================================================
   SERVER
========================================================= */

const port =
  process.env.PORT || 4500;

app.listen(port, async () => {
  console.log(
    `Server started at port: ${port}`
  );

  /* =======================================================
     MongoDB
  ======================================================= */

  try {
    await connectDB();

    console.log(
      "MongoDB connection successful"
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error
    );
  }

  /* =======================================================
     Cloudinary
  ======================================================= */

  try {
    const result =
      await cloudinary.api.ping();

    console.log(
      "Cloudinary connection successful:",
      result
    );
  } catch (error) {
    console.error(
      "Cloudinary connection failed:",
      error
    );
  }
});
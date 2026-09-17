# EduTech AI — AI Learning Assistant & Personalized Study Planner

> "Because no two students learn the same way — so why should they all get the same study plan?"

A full-stack web application where a student sets a learning goal, takes a short diagnostic
assessment, and gets a **day-by-day study plan personalized by AI** around their subject,
deadline, available time, and weak areas — plus an AI tutor to ask questions while studying
and AI-generated mock tests to validate understanding.

---

## Table of Contents

- [Problem & Solution](#problem--solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [AI / LLM Integration](#ai--llm-integration)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Database Schema Overview](#database-schema-overview)
- [Error Handling](#error-handling)
- [Future Scope](#future-scope)

---

## Problem & Solution

Most schools, colleges, and self-study resources give every student the same content, the
same pace, and the same generic study schedule — regardless of their strengths, weaknesses,
or how much time they actually have. Students spend hours on topics they already understand
while weak areas go unaddressed, exam prep becomes last-minute cramming, and personal
tutoring isn't accessible to everyone.

**EduTech AI** solves this by:

1. Letting a student define a learning goal (subject, deadline, available time, self-rated level).
2. Running a short **diagnostic assessment** (AI-generated quiz, or a topic-confidence
   self-rating when no AI provider is configured) to find real weak areas.
3. Generating a **personalized, day-by-day study plan** with an LLM that prioritizes those
   weak areas within the available time.
4. Providing an **AI tutor chat** for doubt-solving while studying.
5. Auto-generating **mock tests** from the plan's topics to validate understanding.
6. Tracking **progress** (streaks, topic mastery, completion %) against the plan, with a
   **regenerate** option if the student falls behind schedule.

## Key Features

| Requirement | Status |
|---|---|
| Secure signup/login, private per-account data | ✅ |
| Learning goal setup (subject, deadline, available time, level) | ✅ |
| Knowledge assessment (AI quiz + self-rating fallback) → weak areas | ✅ |
| Personalized, AI-generated day/session study plan | ✅ |
| AI study assistant (chat, persisted history) | ✅ |
| Progress tracking (streaks, mastery, weekly activity) | ✅ |
| Plan regeneration when falling behind | ✅ |
| Mock test generator (AI, tied to real plan topics) + scoring | ✅ |
| Error handling across auth, AI, DB, validation | ✅ |
| Responsive UI (desktop/tablet/mobile) | ✅ |

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios, react-hot-toast, react-icons
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (httpOnly cookies) + email OTP flow
- **AI / LLM:** OpenAI API (via the official `openai` SDK) — see below
- **File uploads:** Cloudinary (profile images)
- **Email:** Nodemailer (Gmail transport, OTP delivery)

## AI / LLM Integration

**Provider used:** OpenAI, via the official `openai` npm SDK (already a project dependency).
The client (`Backend/src/config/openai.js`) is also compatible with any OpenAI-compatible
endpoint (OpenRouter, Groq, etc.) via `OPENAI_BASE_URL`, so the AI provider can be swapped
without touching application code.

**Why OpenAI:** it was already listed as a dependency in this project's `package.json`,
has first-class structured-output support (JSON mode) needed for reliably parsing generated
study plans and quizzes, and offers small, fast, inexpensive models (`gpt-4o-mini` by default)
well suited to the short, frequent calls this app makes (plan generation, quiz generation,
tutoring, test generation).

**What it does, and where:**

| Capability | File | Used for |
|---|---|---|
| `generateStudyTopics()` | `Backend/src/services/aiService.js` | Breaks the goal's subject into a personalized, ordered topic list (title + focus + study tip), prioritizing weak areas from the assessment |
| `generateAssessmentQuestions()` | `Backend/src/services/aiService.js` | Generates the diagnostic quiz for a new goal |
| `generateMockTestQuestions()` | `Backend/src/services/aiService.js` | Generates a scored practice test (with explanations) for a specific topic reached in the plan |
| `getTutorReply()` | `Backend/src/services/aiService.js` | Powers the AI study assistant chat, using the student's active goal + recent chat history as context |

**Graceful degradation:** every AI call is wrapped so that if `OPENAI_API_KEY` isn't set, or
the API call/JSON-parsing fails, the app **never breaks** — it falls back to a deterministic
template (plan generation), a topic-confidence self-rating quiz (assessment), or a clear
"AI assistant not configured" message (chat, mock tests) instead of a blank screen or crash.

## Architecture

```
┌─────────────┐        HTTPS / JSON        ┌──────────────┐        Mongoose        ┌───────────┐
│   React     │  ─────────────────────────▶ │   Express    │  ─────────────────────▶ │  MongoDB  │
│  (Vite SPA) │ ◀───────────────────────── │   Backend    │ ◀───────────────────────│           │
└─────────────┘        JWT cookie          └──────┬───────┘                          └───────────┘
                                                    │
                                                    │  openai SDK (chat.completions)
                                                    ▼
                                            ┌──────────────┐
                                            │  OpenAI API  │
                                            └──────────────┘
```

- **Frontend → Backend:** all requests go through `Frontend/src/config/Api.jsx` (a shared
  Axios instance with `withCredentials: true`), never hardcoded URLs in components.
- **Backend → Database:** Mongoose models under `Backend/src/models`.
- **Backend → AI:** all LLM calls are centralized in `Backend/src/services/aiService.js` and
  `Backend/src/services/planGenerationService.js` — controllers never call the OpenAI SDK
  directly.
- **Auth:** JWT stored in an httpOnly cookie, verified by `Protect` middleware
  (`Backend/src/middlewares/authMiddleware.js`) on every private route; all data queries are
  scoped to `req.user._id` so students can only ever see their own goals/plans/chat/tests.

## Project Structure

```
Backend/
  index.js                     Express app entry, router mounting
  src/
    config/                    db, cloudinary, openai clients
    controllers/                route handlers (auth, goal, studyPlan, assessment, ai, mockTest, progress, dashboard, user)
    middlewares/                auth protection, upload handling
    models/                     Mongoose schemas (User, Goal, StudyPlan, Assessment, ChatMessage, MockTest, Dashboard, Otp)
    routers/                    Express routers, one per resource
    services/                   aiService.js, planGenerationService.js (shared AI + plan-building logic)
Frontend/
  src/
    config/Api.jsx              single Axios instance (source of truth for API base URL)
    pages/dashboard/            Overview, Goals, CreateGoal, Assessment, StudyPlan, AIAssistant, Tests, Test, Progress, Achievements, Profile
    App.jsx                     route definitions
documentation/                  feature-by-feature and API documentation
```

## Installation

```bash
git clone https://github.com/nitish1445/HackInMotion-RICR-HIM-1166.git
cd HackInMotion-RICR-HIM-1166
```

### Backend

```bash
cd Backend
npm install
cp .env.example .env   # fill in the values described below
npm run dev             # nodemon, http://localhost:4500
```

### Frontend

```bash
cd Frontend
npm install
npm run dev             # vite, http://localhost:5173
```

## Environment Variables

Backend `.env` (see `Backend/.env.example` for the full annotated template):

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No (default 4500) | Backend port |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Yes, for profile image upload | Cloudinary config |
| `GMAIL_USER` / `GMAIL_PASSCODE` | Yes, for OTP email | Nodemailer transport |
| `OPENAI_API_KEY` | No, but required for AI features | Enables AI plan generation, assessment, tutor, mock tests |
| `OPENAI_MODEL` | No (default `gpt-4o-mini`) | Override the model |
| `OPENAI_BASE_URL` | No | Point at an OpenAI-compatible endpoint instead of OpenAI directly |

Frontend `.env`:

| Variable | Purpose |
|---|---|
| `VITE_URL` | Backend base URL used by `Api.jsx` (defaults to `http://localhost:4500`) |

Never commit a real `.env` file — only `.env.example` is checked in.

## Running Locally

1. Start MongoDB (local or Atlas — set `MONGO_URI` accordingly).
2. `cd Backend && npm run dev`
3. `cd Frontend && npm run dev`
4. Visit `http://localhost:5173`, sign up, create a learning goal, and you'll be taken
   straight into the diagnostic assessment → personalized study plan.
5. Without `OPENAI_API_KEY` set, everything still works end-to-end using the deterministic
   fallbacks described above — set it to see the AI-personalized behavior.

## API Documentation

Full endpoint-by-endpoint documentation (method, auth, request/response shape, error cases)
lives in [`documentation/api-documentation.md`](documentation/api-documentation.md).

Quick reference:

| Base path | Purpose |
|---|---|
| `/auth` | Signup, login, logout, OTP, password reset/change |
| `/user` | Profile update |
| `/goals` | Learning goal CRUD |
| `/assessment` | Diagnostic quiz: start, get, submit |
| `/study-plans` | Plan create/get/regenerate, session completion |
| `/ai` | AI assistant chat: get/send/clear history |
| `/tests` | Mock test: start, get, submit |
| `/progress` | Aggregated progress metrics |
| `/dashboard` | Dashboard overview/summary data |

## Database Schema Overview

Full schema documentation lives in
[`documentation/09-database.md`](documentation/09-database.md). Summary:

- **User** — account, profile, points/streak/badges
- **Goal** — subject/title/level/deadline/hoursPerDay/totalTopics, `weakAreas`,
  `assessmentCompleted`, `completedTopics`/`progress`
- **Assessment** — one per (user, goal): questions, submitted answers, score, derived
  `weakAreas`
- **StudyPlan** — one per goal: `days[]` → `sessions[]` (LEARN/PRACTICE/TEST/REVIEW), each
  session tracks `completed`/`completedAt` and an optional AI-generated `tip`
- **ChatMessage** — one per turn of the AI assistant conversation, scoped to user (+ goal)
- **MockTest** — one per TEST session in a study plan: questions, per-question
  `selectedIndex`, score
- **Dashboard** — cached per-user summary used by the overview page

All of the above are scoped to `user` (and cross-checked against `goal` ownership where
relevant), so one student can never read or modify another student's data.

## Error Handling

- All controllers use `try/catch` + a shared `next(error)` pattern; a global error handler
  formats consistent `{ success: false, message }` responses with proper status codes.
- AI failures (missing key, network error, malformed JSON) never crash a request — they fall
  back to deterministic behavior or a clear in-UI message.
- Frontend pages handle loading, empty, and error states explicitly (see `AssessmentPage.jsx`,
  `TestPage.jsx`, `StudyPlanPage.jsx`, `AIAssistant.jsx`) — no blank screens or silent failures.
- Auth middleware rejects missing/expired/invalid tokens with 401s; ownership checks return
  404s (not 403s, to avoid leaking existence of other users' data) for cross-user access
  attempts.

## Future Scope

- **Adaptive re-planning** — automatically re-balance remaining sessions after a missed day
  or a poor re-test score, instead of requiring a manual "regenerate."
- **Spaced repetition** — schedule periodic revision of already-completed topics based on
  memory-retention research rather than a fixed every-N-days REVIEW session.
- **Voice-based doubt solving** — speech-to-text into the AI assistant, and text-to-speech
  for its replies.
- **Gamification** — streak/points/badges already exist as user fields; extend them with
  richer rules and a leaderboard.
- **Group study mode** — let students with the same goal compare progress or study together.

---

Implementation change log and full requirement-by-requirement audit:
[`documentation/project-implementation-audit.pdf`](documentation/project-implementation-audit.pdf).

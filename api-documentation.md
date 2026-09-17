# API Documentation

Base URL: `http://localhost:4500` (or your deployed backend URL / `VITE_URL`).

Authentication is via an httpOnly `DevLabToken` cookie (see
[documentation/04-authentication.md](documentation/04-authentication.md)). Routes marked
**Auth: required** need this cookie (sent automatically by the frontend's Axios instance via
`withCredentials: true`); unauthenticated requests to them return `401`.

All responses follow `{ success: boolean, message: string, data?: ... }`. Error responses
follow `{ success: false, message: string }` with an appropriate HTTP status code.

---

## Auth — `/auth`

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{ fullName, email, password }` | 409 if email taken; sets `DevLabToken` cookie on success |
| POST | `/auth/login` | No | `{ email, password }` | 401 on bad credentials; sets `DevLabToken` cookie |
| GET | `/auth/logout` | No | — | Clears `DevLabToken` |
| PUT | `/auth/change-password` | **Yes** | `{ currentPassword, newPassword }` | |
| POST | `/auth/genOtp` | No | `{ email }` | 401 if email not registered; emails a 6-digit OTP |
| POST | `/auth/verifyOtp` | No | `{ email, otp }` | Sets short-lived `DevLabOtpToken` cookie |
| POST | `/auth/forgetPassword` | OTP token | `{ newPassword }` | Requires `DevLabOtpToken` from verifyOtp |

## User — `/user`

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| PUT | `/user/profile` | **Yes** | `multipart/form-data`: `fullName`, `bio`, `mobileNumber`, `profileImage` (file) | Photo uploaded to Cloudinary; email is intentionally not editable here |

## Goals — `/goals`

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/goals` | **Yes** | `{ title, subject, level, description?, totalTopics, targetDate }` | Also generates a `StudyPlan` immediately (AI-personalized when configured) |
| GET | `/goals` | **Yes** | — | All of the caller's goals |
| GET | `/goals/:goalId` | **Yes** | — | 404 if not owned by caller |
| PUT | `/goals/:goalId` | **Yes** | Same shape as create | Regenerates the study plan |
| DELETE | `/goals/:goalId` | **Yes** | — | |

## Assessment — `/assessment`

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/assessment/:goalId` | **Yes** | — | Creates (or returns existing) diagnostic quiz — AI mode or self-rating fallback |
| GET | `/assessment/:goalId` | **Yes** | — | 404 if not started yet |
| POST | `/assessment/:goalId/submit` | **Yes** | `{ answers: [{ questionId, selectedIndex }] }` | Scores, derives `weakAreas`, clears the existing study plan so it regenerates with this data |

## Study Plans — `/study-plans`

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/study-plans/my-plan` | **Yes** | — | Returns `{ goal, studyPlan }` for the caller's most recent goal; auto-creates the plan if missing |
| PATCH | `/study-plans/my-plan/session/:sessionId/complete` | **Yes** | `{ completed: boolean }` | Toggles a session, recomputes goal progress |
| POST | `/study-plans/:goalId` | **Yes** | — | Explicit create for a specific goal |
| GET | `/study-plans/:goalId` | **Yes** | — | Get (or auto-create) the plan for a specific goal |
| PATCH | `/study-plans/:goalId/session/:sessionId` | **Yes** | `{ completed: boolean }` | Same as the `/my-plan` variant, scoped by goal |
| POST | `/study-plans/:goalId/regenerate` | **Yes** | — | Deletes and rebuilds the plan from today; resets `completedTopics`; cleans up orphaned mock tests |

## AI Assistant — `/ai`

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| GET | `/ai/chat` | **Yes** | — | Last 50 messages, oldest first |
| POST | `/ai/chat` | **Yes** | `{ message }` | 400 if empty; returns `{ userMessage, assistantMessage, aiAvailable, aiError }` |
| DELETE | `/ai/chat` | **Yes** | — | Clears the caller's chat history |

## Mock Tests — `/tests`

| Method | Endpoint | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/tests/:sessionId` | **Yes** | — | Creates (or returns existing) test for a real TEST session in the caller's study plan; 404 if the session doesn't exist/isn't theirs |
| GET | `/tests/:sessionId` | **Yes** | — | 404 if not started yet |
| POST | `/tests/:sessionId/submit` | **Yes** | `{ answers: [{ questionId, selectedIndex }] }` | Scores, marks the underlying session complete, returns per-question results with explanations |

## Progress — `/progress`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/progress` | **Yes** | Aggregated metrics: lessons completed/total, topic mastery, study minutes, streaks, weekly activity, goal summary — all computed from persisted data |

## Dashboard — `/dashboard`

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/dashboard/overview` | **Yes** | Cached per-user summary for the overview page |
| PUT | `/dashboard/goal` | **Yes** | Update the cached active-goal snapshot |
| POST | `/dashboard/tasks` | **Yes** | Add a quick task |
| PATCH | `/dashboard/tasks/:taskId` | **Yes** | Update/toggle a task |
| PATCH | `/dashboard/study-hours` | **Yes** | Log study hours |
| POST | `/dashboard/achievements` | **Yes** | Record an achievement |

---

## Error responses

All errors follow:

```json
{ "success": false, "message": "Human-readable explanation." }
```

Common status codes: `400` invalid input, `401` unauthenticated/expired token,
`404` not found or not owned by the caller, `409` conflict (e.g. duplicate email),
`500` unexpected server error.

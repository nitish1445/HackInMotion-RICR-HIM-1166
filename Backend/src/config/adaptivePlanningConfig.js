/*
=========================================================
ADAPTIVE PLANNING CONFIG

Single source of truth for every tunable used by the
adaptive study planner. Nothing in performanceService.js
or adaptiveStudyPlanService.js should hardcode these
values directly — import them from here.
=========================================================
*/

/*
 * Topic performance categories, based on the current
 * (weighted, recency-aware) score for that topic.
 *
 *   80-100 -> strong
 *   60-79  -> average
 *   0-59   -> weak
 */
export const WEAK_THRESHOLD = 60;
export const STRONG_THRESHOLD = 80;

/*
 * How much a data point's weight shrinks per rank as it
 * gets older, when averaging a topic's performance across
 * multiple assessment/mock-test results.
 * weight(rank) = RECENCY_DECAY ^ rank, rank 0 = most recent.
 */
export const RECENCY_DECAY = 0.7;

/*
 * How many recent completed mock tests (per subject) feed
 * into the performance profile.
 */
export const MAX_RECENT_TESTS = 10;

/*
 * How many recent diagnostic assessments (per subject)
 * feed into the performance profile (covers retakes).
 */
export const MAX_RECENT_ASSESSMENTS = 3;

/*
 * Share of total available study time allocated to each
 * priority bucket. Renormalized at generation time over
 * whichever buckets actually have topics in them.
 */
export const TIME_ALLOCATION = {
  weak: 0.6,
  average: 0.3,
  strong: 0.1,
};

/*
 * category -> priority mapping used throughout the planner
 * and surfaced to the frontend.
 */
export const CATEGORY_PRIORITY = {
  weak: "high",
  average: "medium",
  strong: "low",
  unassessed: "medium",
};

/*
 * Minimum minutes given to a single learning session, so
 * very short plans still produce meaningful sessions
 * instead of pointless 2-minute slivers.
 */
export const MIN_SESSION_MINUTES = 15;
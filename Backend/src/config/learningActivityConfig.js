/*
=========================================================
LEARNING ACTIVITY & COMPETITION CONFIG

Single source of truth for every tunable used by the
Learning Activity heatmap, streak calculation, "active
learner" definition, and the competition ranking score.
Nothing in learningActivityService.js or
leaderboardService.js should hardcode these values
directly — import them from here.
=========================================================
*/

/*
 * Daily activity-count -> heatmap intensity bucket.
 * Mirrors GitHub's 5-level legend (empty + 4 intensities).
 * Thresholds are configurable here based on real observed
 * activity volume, without touching rendering logic.
 */
export const INTENSITY_THRESHOLDS = {
  low: 1, // 1 activity
  medium: 2, // 2-3 activities
  high: 4, // 4-5 activities
  highest: 6, // 6+ activities
};

/*
 * A user counts as an "active learner" if they logged at
 * least one real learning activity within this many days.
 * Used consistently everywhere "active learners" is shown
 * (dashboard card, competition denominator).
 */
export const ACTIVE_LEARNER_WINDOW_DAYS = 30;

/*
 * Consistency score window: the ranking's "how regularly do
 * you learn" component looks at active days within the last
 * N days, scaled to 0-100.
 */
export const CONSISTENCY_WINDOW_DAYS = 30;

/*
 * How far back (in days) the heatmap streak calculation
 * looks when reconstructing "all-time" active days, so a
 * years-old account doesn't require scanning its entire
 * history just to compute today's streak.
 */
export const STREAK_LOOKBACK_DAYS = 730; // ~2 years

/*
 * Competition ranking score weights. Must sum to 1. See
 * leaderboardService.js `computeRankingScore` for the full
 * explanation of each component.
 */
export const RANKING_WEIGHTS = {
  performance: 0.5,
  consistency: 0.3,
  learningProgress: 0.2,
};

/*
 * How long a computed leaderboard (per subject) is cached
 * in-memory before being recalculated. Ranking is a
 * whole-subject aggregate, expensive to recompute on every
 * dashboard load, and doesn't need to be real-time.
 */
export const LEADERBOARD_CACHE_TTL_MS = 60 * 1000; // 60s

/*
 * Number of days included when the frontend asks for the
 * rolling "last 12 months" heatmap (GitHub uses 371 to
 * always show 53 full weeks — we mirror that so the grid
 * aligns to full weeks/columns).
 */
export const ROLLING_WINDOW_DAYS = 371;

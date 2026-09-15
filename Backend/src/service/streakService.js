/*
=========================================================
STREAK SERVICE

Rules (server-side only — never trust a client streak):
- First successful practice ever -> streak = 1
- Next practice on the very next calendar day -> streak + 1
- Another practice on the SAME calendar day -> no change
- A practice after a gap of 2+ days -> streak resets to 1

Dates are compared at day granularity in UTC so "same day"
is unambiguous regardless of time of day.
=========================================================
*/

const startOfUtcDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const daysBetween = (a, b) => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((startOfUtcDay(b) - startOfUtcDay(a)) / MS_PER_DAY);
};

/*
 * Mutates and returns the given Mongoose user document's
 * streak fields (does NOT call .save() — the caller is
 * responsible for persisting, so it can be done in the
 * same write as anything else if desired).
 */
export const applyPracticeStreak = (user, now = new Date()) => {
  const today = startOfUtcDay(now);

  if (!user.lastPracticeDate) {
    user.streak = 1;
  } else {
    const diff = daysBetween(user.lastPracticeDate, today);

    if (diff === 0) {
      // already practiced today — no change
    } else if (diff === 1) {
      user.streak = (user.streak || 0) + 1;
    } else if (diff > 1) {
      user.streak = 1;
    }
    // diff < 0 (clock skew) is ignored — leave streak untouched
  }

  user.longestStreak = Math.max(user.longestStreak || 0, user.streak || 0);
  user.lastPracticeDate = today;

  return {
    currentStreak: user.streak,
    longestStreak: user.longestStreak,
  };
};
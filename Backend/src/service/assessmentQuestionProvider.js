import rawQuestionBank from "../data/questionBank.js";

/*
=========================================================
CONFIG
=========================================================
*/

export const DEFAULT_QUESTION_COUNT = 12;

export const MIN_QUESTION_COUNT = 5;
export const MAX_QUESTION_COUNT = 15;

/*
 * Configurable difficulty split for a diagnostic
 * assessment. Kept as fractions so DEFAULT_QUESTION_COUNT
 * (or a caller-supplied count) can be scaled cleanly.
 */
export const DIFFICULTY_DISTRIBUTION = {
  easy: 0.3,
  medium: 0.5,
  hard: 0.2,
};

/*
=========================================================
BUILD THE BANK (attach stable ids + subject)

Runs once at module load. Question ids are derived from
the subject + its position in that subject's array, so
they stay stable across requests/process restarts as long
as questionBank.js entries aren't reordered.
=========================================================
*/

const slugify = (subject) =>
  subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildBank = () => {
  const bank = {};
  const byId = new Map();

  for (const [subject, questions] of Object.entries(rawQuestionBank)) {
    const slug = slugify(subject);

    const enriched = questions.map((q, index) => {
      const question = {
        id: `${slug}-${index + 1}`,
        subject,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        topic: q.topic,
        difficulty: q.difficulty,
        explanation: q.explanation || null,
      };

      byId.set(question.id, question);

      return question;
    });

    bank[subject] = enriched;
  }

  return { bank, byId };
};

const { bank, byId } = buildBank();

export const SUBJECTS = Object.keys(bank);

/*
=========================================================
HELPERS
=========================================================
*/

const shuffle = (array) => {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

/*
 * Exported so other providers (e.g. the mock test
 * provider) can reuse the same Fisher-Yates shuffle
 * instead of re-implementing it.
 */
export const shuffleArray = shuffle;

/*
 * Case/whitespace-insensitive subject lookup, so
 * "javascript", " JavaScript ", etc. all resolve.
 */
export const resolveSubject = (subject) => {
  if (!subject || typeof subject !== "string") return null;

  const normalized = subject.trim().toLowerCase();

  return (
    SUBJECTS.find((s) => s.toLowerCase() === normalized) || null
  );
};

/*
 * Strips correctAnswer before sending to the frontend.
 */
export const toPublicQuestion = (question) => ({
  id: question.id,
  question: question.question,
  options: question.options,
  subject: question.subject,
  topic: question.topic,
  difficulty: question.difficulty,
});

/*
 * Look up a question (with its correct answer) by id.
 * Used only server-side during scoring.
 */
export const getQuestionById = (id) => byId.get(id) || null;

/*
 * Full question pool (with correct answers) for a
 * subject — server-side only. Used by other providers
 * (e.g. mock test generation) that need to filter/select
 * from the same underlying bank without rebuilding it.
 */
export const getSubjectPool = (subject) => {
  const resolvedSubject = resolveSubject(subject);
  return resolvedSubject ? bank[resolvedSubject] : [];
};

/*
 * Distinct topics available for a subject, in first-seen
 * order. Used to validate/populate topic filters.
 */
export const getTopicsForSubject = (subject) => {
  const pool = getSubjectPool(subject);
  return [...new Set(pool.map((q) => q.topic))];
};

/*
=========================================================
SELECT ASSESSMENT QUESTIONS

Picks `count` questions for a subject following the
configured difficulty distribution, randomizing which
questions are chosen and their final order.

Question OPTION order is intentionally left as authored.
Shuffling option order per-request would require the
server to remember (per user, per question) which
permutation was served, which this stateless bank-backed
provider does not persist. Randomizing question selection
and order already prevents a static, memorizable quiz.
=========================================================
*/

export const selectAssessmentQuestions = (
  subject,
  count = DEFAULT_QUESTION_COUNT,
  distribution = DIFFICULTY_DISTRIBUTION
) => {
  const resolvedSubject = resolveSubject(subject);

  if (!resolvedSubject) {
    const error = new Error(
      `Unsupported subject. Supported subjects: ${SUBJECTS.join(", ")}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const pool = bank[resolvedSubject];

  const clampedCount = Math.min(
    MAX_QUESTION_COUNT,
    Math.max(MIN_QUESTION_COUNT, Math.min(count, pool.length))
  );

  const byDifficulty = {
    easy: shuffle(pool.filter((q) => q.difficulty === "easy")),
    medium: shuffle(pool.filter((q) => q.difficulty === "medium")),
    hard: shuffle(pool.filter((q) => q.difficulty === "hard")),
  };

  /*
   * Target counts per difficulty, rounded, then
   * reconciled against clampedCount.
   */
  const targets = {
    easy: Math.round(clampedCount * distribution.easy),
    medium: Math.round(clampedCount * distribution.medium),
    hard: Math.round(clampedCount * distribution.hard),
  };

  let targetSum = targets.easy + targets.medium + targets.hard;

  /*
   * Rounding can leave us 1 off in either direction —
   * nudge "medium" since it's the largest bucket.
   */
  targets.medium += clampedCount - targetSum;

  const selected = [];
  const leftovers = [];

  for (const difficulty of ["easy", "medium", "hard"]) {
    const take = Math.max(0, targets[difficulty]);
    const available = byDifficulty[difficulty];

    selected.push(...available.slice(0, take));
    leftovers.push(...available.slice(take));
  }

  /*
   * If a difficulty bucket didn't have enough questions
   * to hit its target (small subject pool), backfill from
   * whatever's left over, regardless of difficulty, so we
   * still return `clampedCount` questions when possible.
   */
  if (selected.length < clampedCount) {
    const shuffledLeftovers = shuffle(leftovers);
    const needed = clampedCount - selected.length;

    selected.push(...shuffledLeftovers.slice(0, needed));
  }

  return {
    subject: resolvedSubject,
    questions: shuffle(selected).slice(0, clampedCount),
  };
};
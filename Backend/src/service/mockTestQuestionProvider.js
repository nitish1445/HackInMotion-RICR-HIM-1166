import {
  getSubjectPool,
  resolveSubject,
  shuffleArray,
} from "./assessmentQuestionProvider.js";

export const QUESTION_COUNT_OPTIONS = [5, 10, 15];
export const MAX_TEST_QUESTIONS = 15;
export const DIFFICULTIES = ["easy", "medium", "hard", "mixed"];

const normalizeTopics = (topics) =>
  Array.isArray(topics)
    ? topics
        .filter((topic) => typeof topic === "string")
        .map((topic) => topic.trim())
        .filter(Boolean)
    : [];

export const generateMockTestQuestions = ({
  subject,
  topics = [],
  difficulty = "mixed",
  numberOfQuestions = QUESTION_COUNT_OPTIONS[0],
}) => {
  const resolvedSubject = resolveSubject(subject);

  if (!resolvedSubject) {
    const error = new Error("Unsupported subject.");
    error.statusCode = 400;
    throw error;
  }

  if (!DIFFICULTIES.includes(difficulty)) {
    const error = new Error(
      `Unsupported difficulty. Choose one of: ${DIFFICULTIES.join(", ")}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const count = Number(numberOfQuestions);

  if (!Number.isInteger(count) || count < 1 || count > MAX_TEST_QUESTIONS) {
    const error = new Error(
      `Number of questions must be an integer between 1 and ${MAX_TEST_QUESTIONS}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const requestedTopics = normalizeTopics(topics);
  const topicSet = new Set(requestedTopics.map((topic) => topic.toLowerCase()));
  let pool = getSubjectPool(resolvedSubject);

  if (topicSet.size) {
    pool = pool.filter((question) => topicSet.has(question.topic.toLowerCase()));
  }

  if (difficulty !== "mixed") {
    pool = pool.filter((question) => question.difficulty === difficulty);
  }

  if (pool.length < count) {
    const error = new Error(
      `Not enough questions match the selected filters. Only ${pool.length} available.`
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    subject: resolvedSubject,
    topics: requestedTopics,
    difficulty,
    questions: shuffleArray(pool).slice(0, count),
  };
};
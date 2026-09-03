import AssessmentResult from "../models/assessmentResultModel.js";

import {
  SUBJECTS,
  DEFAULT_QUESTION_COUNT,
  MIN_QUESTION_COUNT,
  MAX_QUESTION_COUNT,
  DIFFICULTY_DISTRIBUTION,
  resolveSubject,
  selectAssessmentQuestions,
  toPublicQuestion,
  getQuestionById,
} from "../service/assessmentQuestionProvider.js";

import { calculateAssessmentResult } from "../service/assessmentScoringService.js";

/*
=========================================================
CONFIG
=========================================================
*/

/*
 * Hard ceiling on how many answers a single submission can
 * contain — well above MAX_QUESTION_COUNT, just to reject
 * obviously abusive payloads outright.
 */
const MAX_ANSWERS_PER_SUBMISSION = 50;

const HISTORY_LIMIT = 20;

/*
=========================================================
GET SUPPORTED SUBJECTS
=========================================================
*/

export const getAssessmentSubjects = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        subjects: SUBJECTS,
      },
    });
  } catch (error) {
    console.error("GET ASSESSMENT SUBJECTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load assessment subjects.",
    });
  }
};

/*
=========================================================
GET ASSESSMENT QUESTIONS

Never includes `correctAnswer` in the response.
=========================================================
*/

export const getAssessmentQuestions = async (req, res) => {
  try {
    const { subject, count } = req.query;

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        success: false,
        message: `Subject is required. Supported subjects: ${SUBJECTS.join(", ")}.`,
      });
    }

    const parsedCount = Number(count);

    const questionCount =
      Number.isFinite(parsedCount) && parsedCount > 0
        ? Math.min(MAX_QUESTION_COUNT, Math.max(MIN_QUESTION_COUNT, Math.round(parsedCount)))
        : DEFAULT_QUESTION_COUNT;

    const { subject: resolvedSubject, questions } = selectAssessmentQuestions(
      subject,
      questionCount
    );

    return res.status(200).json({
      success: true,
      data: {
        subject: resolvedSubject,
        totalQuestions: questions.length,
        difficultyDistribution: DIFFICULTY_DISTRIBUTION,
        questions: questions.map(toPublicQuestion),
      },
    });
  } catch (error) {
    console.error("GET ASSESSMENT QUESTIONS ERROR:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to load assessment questions.",
    });
  }
};

/*
=========================================================
SUBMIT ASSESSMENT

The backend is the only source of truth for scoring:
- looks up each question by id in the bank
- compares selectedAnswer against the bank's correctAnswer
- never trusts a score/percentage/level sent by the client
=========================================================
*/

export const submitAssessment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { subject, answers } = req.body || {};

    /*
     * Subject
     */
    const resolvedSubject = resolveSubject(subject);

    if (!resolvedSubject) {
      return res.status(400).json({
        success: false,
        message: `Unsupported subject. Supported subjects: ${SUBJECTS.join(", ")}.`,
      });
    }

    /*
     * Answers array
     */
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one answer is required.",
      });
    }

    if (answers.length > MAX_ANSWERS_PER_SUBMISSION) {
      return res.status(400).json({
        success: false,
        message: "Too many answers submitted for a single assessment.",
      });
    }

    /*
     * Per-answer validation + duplicate detection
     */
    const seenQuestionIds = new Set();
    const gradedAnswers = [];

    for (const entry of answers) {
      if (!entry || typeof entry.questionId !== "string" || !entry.questionId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Each answer must include a valid questionId.",
        });
      }

      const questionId = entry.questionId.trim();

      if (seenQuestionIds.has(questionId)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate answer submitted for question "${questionId}".`,
        });
      }

      seenQuestionIds.add(questionId);

      const question = getQuestionById(questionId);

      if (!question) {
        return res.status(400).json({
          success: false,
          message: `Invalid question in submission: "${questionId}".`,
        });
      }

      if (question.subject !== resolvedSubject) {
        return res.status(400).json({
          success: false,
          message: `Question "${questionId}" does not belong to subject "${resolvedSubject}".`,
        });
      }

      /*
       * selectedAnswer:
       * - a valid option index -> graded normally
       * - null / undefined      -> treated as unanswered (incorrect)
       * - anything else invalid -> reject the request
       */
      let selectedAnswer = entry.selectedAnswer;

      let isCorrect = false;

      if (selectedAnswer === null || selectedAnswer === undefined) {
        isCorrect = false;
      } else if (
        !Number.isInteger(selectedAnswer) ||
        selectedAnswer < 0 ||
        selectedAnswer >= question.options.length
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid selected answer for question "${questionId}".`,
        });
      } else {
        isCorrect = selectedAnswer === question.correctAnswer;
      }

      gradedAnswers.push({
        topic: question.topic,
        isCorrect,
      });
    }

    /*
     * Score
     */
    const result = calculateAssessmentResult(gradedAnswers);

    /*
     * Persist
     */
    const savedResult = await AssessmentResult.create({
      user: req.user._id,
      subject: resolvedSubject,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      score: result.score,
      percentage: result.percentage,
      level: result.level,
      topicPerformance: result.topicPerformance,
      strongTopics: result.strongTopics,
      weakTopics: result.weakTopics,
      completedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Assessment submitted successfully.",
      data: {
        result: savedResult,
      },
    });
  } catch (error) {
    console.error("SUBMIT ASSESSMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit assessment.",
    });
  }
};

/*
=========================================================
GET LATEST ASSESSMENT RESULT

Used by the dashboard/profile to show the "assessed
level" instead of the manually self-selected level.
=========================================================
*/

export const getLatestAssessment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { subject } = req.query;

    const filter = { user: req.user._id };

    if (subject && String(subject).trim()) {
      const resolvedSubject = resolveSubject(subject);

      /*
       * Unknown subject -> no possible result, respond
       * with null rather than erroring on a read.
       */
      if (!resolvedSubject) {
        return res.status(200).json({
          success: true,
          data: { result: null },
        });
      }

      filter.subject = resolvedSubject;
    }

    const result = await AssessmentResult.findOne(filter).sort({
      completedAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: { result: result || null },
    });
  } catch (error) {
    console.error("GET LATEST ASSESSMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load latest assessment result.",
    });
  }
};

/*
=========================================================
GET ASSESSMENT HISTORY
=========================================================
*/

export const getAssessmentHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { subject } = req.query;

    const filter = { user: req.user._id };

    if (subject && String(subject).trim()) {
      const resolvedSubject = resolveSubject(subject);

      if (!resolvedSubject) {
        return res.status(200).json({
          success: true,
          data: { results: [] },
        });
      }

      filter.subject = resolvedSubject;
    }

    const results = await AssessmentResult.find(filter)
      .sort({ completedAt: -1 })
      .limit(HISTORY_LIMIT);

    return res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error("GET ASSESSMENT HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load assessment history.",
    });
  }
};
import mongoose from "mongoose";

import TestResult from "../models/testResultModel.js";

import {
  SUBJECTS,
  resolveSubject,
  toPublicQuestion,
  getQuestionById,
  getTopicsForSubject,
} from "../service/assessmentQuestionProvider.js";

import {
  generateMockTestQuestions,
  QUESTION_COUNT_OPTIONS,
  MAX_TEST_QUESTIONS,
  DIFFICULTIES,
} from "../service/mockTestQuestionProvider.js";

import { calculateTopicPerformance } from "../service/assessmentScoringService.js";
import { logActivity } from "../service/learningActivityService.js";

/*
=========================================================
CONFIG
=========================================================
*/

const HISTORY_LIMIT = 30;

/*
=========================================================
HELPERS
=========================================================
*/

/*
 * Falls back to a plain, honest statement of the correct
 * answer when a question doesn't have a curated
 * explanation — never fabricated, always derived from the
 * question's own data.
 */
const getExplanation = (question) =>
  question.explanation ||
  `The correct answer is "${question.options[question.correctAnswer]}".`;

/*
 * Builds the full result payload (summary + per-question
 * review) for an already-completed TestResult document.
 * Review data is re-derived from the static question bank
 * via questionId rather than duplicated into the DB.
 */
const buildTestResultPayload = (testDoc) => {
  const review = testDoc.questionIds.map((questionId) => {
    const question = getQuestionById(questionId);

    const answerRecord = testDoc.answers.find(
      (a) => a.questionId === questionId
    );

    const selectedAnswer =
      answerRecord && answerRecord.selectedAnswer !== undefined
        ? answerRecord.selectedAnswer
        : null;

    const isCorrect = answerRecord ? answerRecord.isCorrect : false;

    /*
     * Extremely defensive: the bank is static so this
     * should never happen, but don't crash a result view
     * over it.
     */
    if (!question) {
      return {
        questionId,
        question: "This question is no longer available.",
        options: [],
        topic: null,
        difficulty: null,
        correctAnswer: null,
        correctAnswerText: null,
        selectedAnswer,
        selectedAnswerText: null,
        isCorrect,
        explanation: null,
      };
    }

    return {
      questionId,
      question: question.question,
      options: question.options,
      topic: question.topic,
      difficulty: question.difficulty,
      correctAnswer: question.correctAnswer,
      correctAnswerText: question.options[question.correctAnswer],
      selectedAnswer,
      selectedAnswerText:
        selectedAnswer !== null ? question.options[selectedAnswer] : null,
      isCorrect,
      explanation: getExplanation(question),
    };
  });

  return {
    testId: testDoc._id,
    subject: testDoc.subject,
    topics: testDoc.topics,
    difficulty: testDoc.difficulty,
    status: testDoc.status,
    totalQuestions: testDoc.totalQuestions,
    attemptedQuestions: testDoc.attemptedQuestions,
    correctAnswers: testDoc.correctAnswers,
    incorrectAnswers: testDoc.incorrectAnswers,
    unansweredQuestions: testDoc.unansweredQuestions,
    score: testDoc.score,
    percentage: testDoc.percentage,
    topicPerformance: testDoc.topicPerformance,
    startedAt: testDoc.startedAt,
    completedAt: testDoc.completedAt,
    review,
  };
};

/*
=========================================================
GET TEST CONFIG OPTIONS

Lets the frontend build the configuration screen (subject
list, difficulty options, question-count options) without
hardcoding them client-side.
=========================================================
*/

export const getTestConfigOptions = async (req, res) => {
  try {
    const topicsBySubject = {};

    for (const subject of SUBJECTS) {
      topicsBySubject[subject] = getTopicsForSubject(subject);
    }

    return res.status(200).json({
      success: true,
      data: {
        subjects: SUBJECTS,
        topicsBySubject,
        difficulties: DIFFICULTIES,
        questionCountOptions: QUESTION_COUNT_OPTIONS,
        maxQuestions: MAX_TEST_QUESTIONS,
      },
    });
  } catch (error) {
    console.error("GET TEST CONFIG OPTIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load test configuration options.",
    });
  }
};

/*
=========================================================
GENERATE TEST

Creates the test "session" (a TestResult document in
"in-progress" status) holding the exact question ids
served, and returns those questions WITHOUT correct
answers.
=========================================================
*/

export const generateTest = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { subject, topics, difficulty, numberOfQuestions } =
      req.body || {};

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        success: false,
        message: `Subject is required. Supported subjects: ${SUBJECTS.join(", ")}.`,
      });
    }

    if (topics !== undefined && !Array.isArray(topics)) {
      return res.status(400).json({
        success: false,
        message: "Topics must be an array of topic names.",
      });
    }

    let generated;

    try {
      generated = generateMockTestQuestions({
        subject,
        topics,
        difficulty,
        numberOfQuestions,
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.statusCode
          ? err.message
          : "Failed to generate the test.",
      });
    }

    const testDoc = await TestResult.create({
      user: req.user._id,
      subject: generated.subject,
      topics: generated.topics,
      difficulty: generated.difficulty,
      status: "in-progress",
      questionIds: generated.questions.map((q) => q.id),
      startedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      data: {
        testId: testDoc._id,
        subject: generated.subject,
        topics: generated.topics,
        difficulty: generated.difficulty,
        totalQuestions: generated.questions.length,
        startedAt: testDoc.startedAt,
        questions: generated.questions.map(toPublicQuestion),
      },
    });
  } catch (error) {
    console.error("GENERATE TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate the test.",
    });
  }
};

/*
=========================================================
SUBMIT TEST

The backend is the only source of truth for:
- which questions belonged to this test (testDoc.questionIds)
- the correct answers (looked up from the bank)
- the resulting score/percentage/topic performance
=========================================================
*/

export const submitTest = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(404).json({
        success: false,
        message: "Test not found.",
      });
    }

    const testDoc = await TestResult.findById(testId);

    if (!testDoc || String(testDoc.user) !== String(req.user._id)) {
      /*
       * Same response for "doesn't exist" and "not yours"
       * to avoid leaking which test ids are valid.
       */
      return res.status(404).json({
        success: false,
        message: "Test not found.",
      });
    }

    if (testDoc.status === "completed") {
      return res.status(409).json({
        success: false,
        message: "This test has already been submitted.",
      });
    }

    const { answers } = req.body || {};

    if (answers !== undefined && !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array.",
      });
    }

    const submittedAnswers = Array.isArray(answers) ? answers : [];

    const sessionQuestionIds = new Set(testDoc.questionIds);
    const seenQuestionIds = new Set();
    const selectedByQuestionId = new Map();

    for (const entry of submittedAnswers) {
      if (
        !entry ||
        typeof entry.questionId !== "string" ||
        !entry.questionId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Each answer must include a valid questionId.",
        });
      }

      const questionId = entry.questionId.trim();

      if (!sessionQuestionIds.has(questionId)) {
        return res.status(400).json({
          success: false,
          message: `Question "${questionId}" does not belong to this test.`,
        });
      }

      if (seenQuestionIds.has(questionId)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate answer submitted for question "${questionId}".`,
        });
      }

      seenQuestionIds.add(questionId);

      const question = getQuestionById(questionId);

      if (!question) {
        return res.status(500).json({
          success: false,
          message: "Unable to grade this test right now. Please try again.",
        });
      }

      const selectedAnswer = entry.selectedAnswer;

      if (selectedAnswer === null || selectedAnswer === undefined) {
        selectedByQuestionId.set(questionId, null);
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
        selectedByQuestionId.set(questionId, selectedAnswer);
      }
    }

    /*
     * Grade every question that belongs to the session —
     * not just the ones the client sent an answer for —
     * so missing answers are counted as unanswered rather
     * than silently ignored.
     */
    const gradedAnswers = [];
    const answerDocs = [];

    for (const questionId of testDoc.questionIds) {
      const question = getQuestionById(questionId);

      const selectedAnswer = selectedByQuestionId.has(questionId)
        ? selectedByQuestionId.get(questionId)
        : null;

      const isCorrect =
        selectedAnswer !== null && selectedAnswer === question.correctAnswer;

      gradedAnswers.push({ topic: question.topic, isCorrect });

      answerDocs.push({
        questionId,
        selectedAnswer,
        isCorrect,
      });
    }

    const totalQuestions = testDoc.questionIds.length;
    const attemptedQuestions = answerDocs.filter(
      (a) => a.selectedAnswer !== null
    ).length;
    const correctAnswers = answerDocs.filter((a) => a.isCorrect).length;
    const incorrectAnswers = attemptedQuestions - correctAnswers;
    const unansweredQuestions = totalQuestions - attemptedQuestions;

    /*
     * Simple transparent scoring: +1 per correct answer,
     * 0 otherwise. Centralized here so negative marking
     * (or partial credit) can be introduced later by
     * changing only this line.
     */
    const score = correctAnswers;

    const percentage = totalQuestions
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

    const { topicPerformance } = calculateTopicPerformance(gradedAnswers);

    testDoc.status = "completed";
    testDoc.completedAt = new Date();
    testDoc.totalQuestions = totalQuestions;
    testDoc.attemptedQuestions = attemptedQuestions;
    testDoc.correctAnswers = correctAnswers;
    testDoc.incorrectAnswers = incorrectAnswers;
    testDoc.unansweredQuestions = unansweredQuestions;
    testDoc.score = score;
    testDoc.percentage = percentage;
    testDoc.topicPerformance = topicPerformance;
    testDoc.answers = answerDocs;

    await testDoc.save();

    await logActivity({
      userId: req.user._id,
      activityType: "MOCK_TEST_COMPLETED",
      subject: testDoc.subject,
      metadata: {
        percentage: testDoc.percentage,
        totalQuestions: testDoc.totalQuestions,
        difficulty: testDoc.difficulty,
      },
      occurredAt: testDoc.completedAt,
    });

    return res.status(200).json({
      success: true,
      message: "Test submitted successfully.",
      data: buildTestResultPayload(testDoc),
    });
  } catch (error) {
    console.error("SUBMIT TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit the test.",
    });
  }
};

/*
=========================================================
GET TEST HISTORY
=========================================================
*/

export const getTestHistory = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { subject } = req.query;

    const filter = {
      user: req.user._id,
      status: "completed",
    };

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

    const results = await TestResult.find(filter)
      .sort({ completedAt: -1 })
      .limit(HISTORY_LIMIT)
      .select("-answers -questionIds");

    return res.status(200).json({
      success: true,
      data: { results },
    });
  } catch (error) {
    console.error("GET TEST HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load test history.",
    });
  }
};

/*
=========================================================
GET TEST RESULT (summary + full answer review)
=========================================================
*/

export const getTestResult = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(404).json({
        success: false,
        message: "Test not found.",
      });
    }

    const testDoc = await TestResult.findById(testId);

    if (!testDoc || String(testDoc.user) !== String(req.user._id)) {
      return res.status(404).json({
        success: false,
        message: "Test not found.",
      });
    }

    if (testDoc.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "This test has not been submitted yet.",
      });
    }

    return res.status(200).json({
      success: true,
      data: buildTestResultPayload(testDoc),
    });
  } catch (error) {
    console.error("GET TEST RESULT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load the test result.",
    });
  }
};
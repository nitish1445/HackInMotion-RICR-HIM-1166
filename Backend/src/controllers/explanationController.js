import Explanation from "../models/explanationModel.js";

import {
  resolveSubject,
  getTopicsForSubject,
} from "../service/assessmentQuestionProvider.js";

import { logActivity } from "../service/learningActivityService.js";

/*
=========================================================
CONFIG
=========================================================
*/

const MAX_DURATION_SECONDS = 600; // 10 minutes, sane upper bound
const RECORDED_DURATION_TOLERANCE_SECONDS = 2; // allow for timer/stop-event lag

/*
=========================================================
CREATE EXPLANATION ATTEMPT

Stores only metadata (no audio). Subject/topic are
validated against the existing question-bank taxonomy —
the same one already powering the Knowledge Assessment
and Mock Test configuration screens — so this feature
doesn't introduce a second, inconsistent topic list.
=========================================================
*/

export const createExplanation = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { subject, topic, duration, recordedDuration } = req.body || {};

    /*
     * Subject
     */
    const resolvedSubject = resolveSubject(subject);

    if (!resolvedSubject) {
      return res.status(400).json({
        success: false,
        message: "A valid subject is required.",
      });
    }

    /*
     * Topic — must belong to the resolved subject.
     */
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: "A topic is required.",
      });
    }

    const availableTopics = getTopicsForSubject(resolvedSubject);
    const resolvedTopic = availableTopics.find(
      (t) => t.toLowerCase() === topic.trim().toLowerCase()
    );

    if (!resolvedTopic) {
      return res.status(400).json({
        success: false,
        message: `Unknown topic for ${resolvedSubject}. Available topics: ${availableTopics.join(", ")}.`,
      });
    }

    /*
     * Duration (the selected time limit)
     */
    const parsedDuration = Number(duration);

    if (
      !Number.isFinite(parsedDuration) ||
      !Number.isInteger(parsedDuration) ||
      parsedDuration <= 0 ||
      parsedDuration > MAX_DURATION_SECONDS
    ) {
      return res.status(400).json({
        success: false,
        message: `Duration must be a whole number of seconds between 1 and ${MAX_DURATION_SECONDS}.`,
      });
    }

    /*
     * Recorded duration (actual time recorded)
     */
    const parsedRecordedDuration = Number(recordedDuration);

    if (
      !Number.isFinite(parsedRecordedDuration) ||
      !Number.isInteger(parsedRecordedDuration) ||
      parsedRecordedDuration <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Recorded duration must be a positive whole number of seconds.",
      });
    }

    if (parsedRecordedDuration > parsedDuration + RECORDED_DURATION_TOLERANCE_SECONDS) {
      return res.status(400).json({
        success: false,
        message: "Recorded duration cannot exceed the selected explanation time.",
      });
    }

    /*
     * Persist — userId always comes from the authenticated
     * session, never from the request body.
     */
    const explanation = await Explanation.create({
      user: req.user._id,
      subject: resolvedSubject,
      topic: resolvedTopic,
      duration: parsedDuration,
      recordedDuration: parsedRecordedDuration,
      status: "submitted",
    });

    await logActivity({
      userId: req.user._id,
      activityType: "VIDEO_EXPLANATION_COMPLETED",
      subject: explanation.subject,
      topic: explanation.topic,
      metadata: {
        recordedDuration: explanation.recordedDuration,
      },
      occurredAt: explanation.createdAt,
    });

    return res.status(201).json({
      success: true,
      message: "Explanation attempt created successfully",
      data: {
        id: explanation._id,
        subject: explanation.subject,
        topic: explanation.topic,
        duration: explanation.duration,
        recordedDuration: explanation.recordedDuration,
        status: explanation.status,
      },
    });
  } catch (error) {
    console.error("CREATE EXPLANATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save your explanation attempt. Please try again.",
    });
  }
};

/*
=========================================================
GET MY EXPLANATIONS

Not required by this phase's UI, but exposed now (list of
the user's own attempts) since it's a natural, low-risk
companion to POST and will be needed by the Part 3
results dashboard — no extra model/route wiring required
later.
=========================================================
*/

export const getMyExplanations = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const explanations = await Explanation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: { explanations },
    });
  } catch (error) {
    console.error("GET MY EXPLANATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load your explanation attempts.",
    });
  }
};
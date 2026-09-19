import { GoogleGenAI } from "@google/genai";

/*
=========================================================
CONFIG

Design note: Gemini's multimodal models understand audio
and video directly (as inline data), so this service asks
Gemini to BOTH transcribe the recording AND evaluate the
answer in a single call, instead of chaining a separate
third-party speech-to-text API in front of it. This still
produces a real transcript grounded in the actual audio —
it is not fabricated — while avoiding a second unrelated
provider/API key that isn't otherwise part of this project.
=========================================================
*/

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";

const REQUIRED_NUMERIC_FIELDS = [
  "overallScore",
  "relevance",
  "contentAccuracy",
  "completeness",
  "clarity",
  "grammar",
  "vocabulary",
  "fluency",
  "confidence",
  "fillerWords",
];

const MIN_TRANSCRIPT_LENGTH = 3;

/*
=========================================================
CLIENT (lazy singleton)
=========================================================
*/

let genAI = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error(
      "AI evaluation service is not configured. Missing GEMINI_API_KEY."
    );
    error.statusCode = 503;
    error.code = "AI_NOT_CONFIGURED";
    throw error;
  }

  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  return genAI;
};

/*
=========================================================
PROMPT
=========================================================
*/

const buildPrompt = (question, mode) => `You are an AI communication and technical assessment evaluator.

The attached ${mode === "video" ? "video" : "audio"} recording is a student's spoken answer to the question below.

First, transcribe exactly what the student said, as accurately as possible. Do not clean up or rephrase it — transcribe their actual words, including hesitations if clearly audible.

Then evaluate the student's answer against the question.

QUESTION:
${question}

Evaluate:
1. Relevance — does the answer actually address the question?
2. Content accuracy — is what they said technically/factually correct?
3. Completeness — did they cover the key points a good answer would include?
4. Clarity — how clear and well-structured is the explanation?
5. Grammar — grammatical correctness of the spoken language.
6. Vocabulary — appropriateness and range of vocabulary used.
7. Fluency — smoothness of delivery based on the transcript (hesitations, repetition, run-ons).
8. Confidence — based ONLY on linguistic evidence in the transcript (assertiveness, hedging language, filler words) — never guess at tone of voice or emotion.
9. Filler word count — an estimated count of filler words/sounds (e.g. "um", "uh", "like", "you know") in the transcript.
10. Overall quality — a holistic score considering everything above.

The score must depend entirely on the actual transcript and question. Do not assign a generic or random score. If the answer is empty, silent, or completely unrelated to the question, scores should be very low and this must be reflected honestly in the feedback.

Return ONLY valid JSON, with no markdown formatting, no code fences, and no text outside the JSON object. Required format:

{
  "transcript": "",
  "overallScore": 0,
  "relevance": 0,
  "contentAccuracy": 0,
  "completeness": 0,
  "clarity": 0,
  "grammar": 0,
  "vocabulary": 0,
  "fluency": 0,
  "confidence": 0,
  "fillerWords": 0,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  "nextPractice": ""
}

All numeric scores (except fillerWords, which is a raw count) must be integers from 0 to 100. "strengths" and "improvements" must be arrays of short strings. "feedback" should be 2-4 sentences of specific, actionable feedback referencing what the student actually said. "nextPractice" should be a single suggested follow-up question/topic for the student to practice next.`;

/*
=========================================================
PARSE + VALIDATE

Never trusts the raw model output. Strips markdown fences
defensively, parses JSON, checks every required field is
present and the right type, and clamps every score to
[0, 100] before it can reach the database.
=========================================================
*/

export const extractJson = (rawText) => {
  let text = rawText.trim();

  // Strip ```json ... ``` or ``` ... ``` fences if the model added them anyway.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  try {
    return JSON.parse(text);
  } catch {
    const error = new Error(
      "The AI evaluation response could not be understood. Please try again."
    );
    error.statusCode = 502;
    error.code = "AI_INVALID_JSON";
    throw error;
  }
};

const clampScore = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.round(Math.min(100, Math.max(0, num)));
};

export const validateAndNormalize = (parsed) => {
  if (!parsed || typeof parsed !== "object") {
    const error = new Error(
      "The AI evaluation response was malformed. Please try again."
    );
    error.statusCode = 502;
    error.code = "AI_MALFORMED_RESPONSE";
    throw error;
  }

  if (
    typeof parsed.transcript !== "string" ||
    parsed.transcript.trim().length < MIN_TRANSCRIPT_LENGTH
  ) {
    const error = new Error(
      "We couldn't make out enough speech in your recording. Please try recording again, speaking clearly."
    );
    error.statusCode = 422;
    error.code = "TRANSCRIPT_TOO_SHORT";
    throw error;
  }

  const normalized = { transcript: parsed.transcript.trim() };

  for (const field of REQUIRED_NUMERIC_FIELDS) {
    const clamped = clampScore(parsed[field]);

    if (clamped === null) {
      const error = new Error(
        "The AI evaluation response was missing required scoring data. Please try again."
      );
      error.statusCode = 502;
      error.code = "AI_MALFORMED_RESPONSE";
      throw error;
    }

    normalized[field] = clamped;
  }

  normalized.feedback =
    typeof parsed.feedback === "string" && parsed.feedback.trim()
      ? parsed.feedback.trim()
      : "No detailed feedback was generated for this attempt.";

  normalized.strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.filter((s) => typeof s === "string" && s.trim()).slice(0, 10)
    : [];

  normalized.improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.filter((s) => typeof s === "string" && s.trim()).slice(0, 10)
    : [];

  normalized.nextPractice =
    typeof parsed.nextPractice === "string" ? parsed.nextPractice.trim() : "";

  return normalized;
};

/*
=========================================================
PUBLIC ENTRY POINT
=========================================================
*/

export const evaluateRecording = async ({ buffer, mimeType, question, mode }) => {
  const client = getClient();

  const prompt = buildPrompt(question, mode);

  let result;

  try {
    result = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: buffer.toString("base64"),
          },
        },
        { text: prompt },
      ],
    });
  } catch (err) {
    console.error("GEMINI EVALUATION ERROR:", err?.status, err?.message || err);

    const status = err?.status || err?.response?.status;
    const mapped = new Error("Unable to analyze your answer right now. Please try again.");

    if (status === 401 || status === 403) {
      mapped.statusCode = 503;
      mapped.code = "AI_AUTH_FAILED";
    } else if (status === 429) {
      mapped.statusCode = 429;
      mapped.code = "AI_RATE_LIMITED";
      mapped.message = "The AI evaluator is receiving too many requests right now. Please try again shortly.";
    } else if (status === 400 && /size|large/i.test(err?.message || "")) {
      mapped.statusCode = 413;
      mapped.code = "RECORDING_TOO_LARGE";
      mapped.message = "Your recording is too large for the AI to process. Please record a shorter answer.";
    } else if (status === 400) {
      mapped.statusCode = 422;
      mapped.code = "RECORDING_FORMAT_UNSUPPORTED";
      mapped.message = "This recording format could not be analyzed. Please retake it using the current browser or try audio mode.";
    } else if (err?.code === "ETIMEDOUT" || /timeout/i.test(err?.message || "")) {
      mapped.statusCode = 504;
      mapped.code = "AI_TIMEOUT";
      mapped.message = "The AI evaluator took too long to respond. Please try again.";
    } else {
      mapped.statusCode = 502;
      mapped.code = "AI_UPSTREAM_ERROR";
    }

    throw mapped;
  }

  const rawText = result.text;

  const parsed = extractJson(rawText);

  return validateAndNormalize(parsed);
};
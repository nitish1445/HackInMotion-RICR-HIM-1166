import { GoogleGenAI } from "@google/genai";

/* =========================================================
   CONFIG
========================================================= */

const PRIMARY_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.7-flash";

const configuredFallbackModel =
  process.env.GEMINI_FALLBACK_MODEL;

const FALLBACK_MODEL =
  configuredFallbackModel &&
  configuredFallbackModel !== PRIMARY_MODEL
    ? configuredFallbackModel
    : "gemini-2.5-flash";

const MAX_HISTORY_MESSAGES = 10;

/* =========================================================
   SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `
You are EduTech AI, a friendly and knowledgeable study assistant
inside a personalized learning application.

Your job is to help students understand what they are studying.

Guidelines:

- Explain concepts clearly and simply.
- Use plain language.
- Give short examples when helpful.
- Adapt explanations to the student's level.
- Keep answers focused and reasonably concise.
- Use bullet points and numbered steps when useful.
- You are especially strong in programming and technical subjects.
- You can also help with:
  Java,
  JavaScript,
  React,
  Node.js,
  MERN,
  DSA,
  SQL,
  DBMS,
  Operating Systems,
  Computer Networks,
  Data Communication,
  Electronics,
  Mathematics,
  Science,
  and other academic subjects.

- Never invent facts.
- Never invent student grades, quiz scores, test results,
  weak areas, or assessment results.
- If student information is unavailable, say so clearly.
- If a question is ambiguous, ask a short clarifying question.
- Be friendly and helpful.
`;

/* =========================================================
   GEMINI CLIENT
========================================================= */

let client = null;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "AI service is not configured. Missing GEMINI_API_KEY."
    );

    error.statusCode = 503;
    error.code = "AI_NOT_CONFIGURED";

    throw error;
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey,
    });
  }

  return client;
};

/* =========================================================
   SANITIZE CONVERSATION
========================================================= */

const sanitizeConversation = (conversation) => {
  if (!Array.isArray(conversation)) {
    return [];
  }

  const allowedRoles = ["user", "assistant"];

  const cleaned = conversation
    .filter(
      (entry) =>
        entry &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0 &&
        allowedRoles.includes(entry.role)
    )
    .map((entry) => ({
      role:
        entry.role === "assistant"
          ? "model"
          : "user",

      parts: [
        {
          text: entry.content
            .trim()
            .slice(0, 4000),
        },
      ],
    }));

  return cleaned.slice(-MAX_HISTORY_MESSAGES);
};

/* =========================================================
   CHECK WHETHER ERROR IS TEMPORARY
========================================================= */

const isTemporaryModelError = (error) => {
  const message = String(
    error?.message || ""
  ).toLowerCase();

  const status =
    error?.status ||
    error?.statusCode;

  return (
    status === 503 ||
    message.includes("high demand") ||
    message.includes("temporarily unavailable") ||
    message.includes("unavailable") ||
    message.includes("overloaded")
  );
};

/* =========================================================
   GENERATE RESPONSE WITH MODEL
========================================================= */

const generateWithModel = async ({
  ai,
  model,
  contents,
}) => {
  console.log("---------------------------------");
  console.log("Trying Gemini model:", model);
  console.log("---------------------------------");

  const response =
    await ai.models.generateContent({
      model,

      contents,

      config: {
        systemInstruction:
          SYSTEM_PROMPT,

        temperature: 0.5,

        maxOutputTokens: 700,
      },
    });

  const reply =
    response?.text?.trim();

  if (!reply) {
    const error = new Error(
      "Gemini returned an empty response."
    );

    error.statusCode = 502;
    error.code = "AI_EMPTY_RESPONSE";

    throw error;
  }

  return reply;
};

/* =========================================================
   GET CHAT RESPONSE
========================================================= */

export const getChatResponse = async ({
  message,
  conversation = [],
}) => {
  const ai = getClient();

  const history =
    sanitizeConversation(conversation);

  const contents = [
    ...history,

    {
      role: "user",

      parts: [
        {
          text: message,
        },
      ],
    },
  ];

  console.log("=================================");
  console.log("GEMINI AI REQUEST");
  console.log("Primary Model:", PRIMARY_MODEL);
  console.log("Fallback Model:", FALLBACK_MODEL);
  console.log("Message:", message);
  console.log("History:", history.length);
  console.log("=================================");

  /* =======================================================
     TRY PRIMARY MODEL
  ======================================================= */

  try {
    const reply =
      await generateWithModel({
        ai,
        model: PRIMARY_MODEL,
        contents,
      });

    console.log("=================================");
    console.log(
      "PRIMARY GEMINI MODEL SUCCESS"
    );
    console.log("Model:", PRIMARY_MODEL);
    console.log("=================================");

    return reply;
  } catch (primaryError) {
    console.error("=================================");
    console.error(
      "PRIMARY GEMINI MODEL FAILED"
    );
    console.error(
      "Model:",
      PRIMARY_MODEL
    );
    console.error(
      "Message:",
      primaryError?.message
    );
    console.error(
      "Status:",
      primaryError?.status
    );
    console.error("=================================");

    /* =====================================================
       FALLBACK ONLY FOR TEMPORARY AVAILABILITY
    ===================================================== */

    if (
      PRIMARY_MODEL !== FALLBACK_MODEL &&
      isTemporaryModelError(primaryError)
    ) {
      console.log("=================================");
      console.log(
        "PRIMARY MODEL UNAVAILABLE"
      );
      console.log(
        "Switching to fallback model..."
      );
      console.log(
        "Fallback:",
        FALLBACK_MODEL
      );
      console.log("=================================");

      try {
        const fallbackReply =
          await generateWithModel({
            ai,
            model: FALLBACK_MODEL,
            contents,
          });

        console.log("=================================");
        console.log(
          "FALLBACK GEMINI MODEL SUCCESS"
        );
        console.log(
          "Model:",
          FALLBACK_MODEL
        );
        console.log("=================================");

        return fallbackReply;
      } catch (fallbackError) {
        console.error("=================================");
        console.error(
          "FALLBACK GEMINI MODEL FAILED"
        );
        console.error(
          "Model:",
          FALLBACK_MODEL
        );
        console.error(
          "Message:",
          fallbackError?.message
        );
        console.error(
          "Status:",
          fallbackError?.status
        );
        console.error("=================================");

        throw mapGeminiError(
          fallbackError,
          FALLBACK_MODEL
        );
      }
    }

    /* =====================================================
       PRIMARY ERROR
    ===================================================== */

    throw mapGeminiError(
      primaryError,
      PRIMARY_MODEL
    );
  }
};

/* =========================================================
   ERROR MAPPER
========================================================= */

const mapGeminiError = (
  error,
  model
) => {
  const status =
    error?.status ||
    error?.statusCode;

  const message = String(
    error?.message || ""
  );

  const lowerMessage =
    message.toLowerCase();

  /* =======================================================
     EMPTY RESPONSE
  ======================================================= */

  if (
    error?.code ===
    "AI_EMPTY_RESPONSE"
  ) {
    return error;
  }

  /* =======================================================
     AUTHENTICATION
  ======================================================= */

  if (
    status === 401 ||
    status === 403 ||
    lowerMessage.includes(
      "api key not valid"
    ) ||
    lowerMessage.includes(
      "invalid api key"
    ) ||
    lowerMessage.includes(
      "permission denied"
    )
  ) {
    const mappedError =
      new Error(
        "Gemini API authentication failed. Please check your GEMINI_API_KEY."
      );

    mappedError.statusCode = 503;
    mappedError.code =
      "AI_AUTH_FAILED";

    return mappedError;
  }

  /* =======================================================
     QUOTA / RATE LIMIT
  ======================================================= */

  if (
    status === 429 ||
    lowerMessage.includes(
      "quota"
    ) ||
    lowerMessage.includes(
      "resource exhausted"
    ) ||
    lowerMessage.includes(
      "rate limit"
    ) ||
    lowerMessage.includes(
      "too many requests"
    )
  ) {
    const mappedError =
      new Error(
        "Gemini AI quota or rate limit has been reached. Please try again later."
      );

    mappedError.statusCode = 429;
    mappedError.code =
      "AI_QUOTA_EXCEEDED";

    return mappedError;
  }

  /* =======================================================
     MODEL NOT FOUND
  ======================================================= */

  if (
    lowerMessage.includes(
      "model"
    ) &&
    (
      lowerMessage.includes(
        "not found"
      ) ||
      lowerMessage.includes(
        "does not exist"
      ) ||
      lowerMessage.includes(
        "not supported"
      )
    )
  ) {
    const mappedError =
      new Error(
        `Gemini model "${model}" is unavailable or not supported.`
      );

    mappedError.statusCode = 503;
    mappedError.code =
      "AI_MODEL_ERROR";

    return mappedError;
  }

  /* =======================================================
     TEMPORARY UNAVAILABLE
  ======================================================= */

  if (
    status === 503 ||
    lowerMessage.includes(
      "high demand"
    ) ||
    lowerMessage.includes(
      "temporarily unavailable"
    ) ||
    lowerMessage.includes(
      "overloaded"
    )
  ) {
    const mappedError =
      new Error(
        "Gemini AI is temporarily experiencing high demand. Please try again shortly."
      );

    mappedError.statusCode = 503;
    mappedError.code =
      "AI_TEMPORARILY_UNAVAILABLE";

    return mappedError;
  }

  /* =======================================================
     TIMEOUT
  ======================================================= */

  if (
    error?.code === "ETIMEDOUT" ||
    error?.code === "ECONNABORTED" ||
    error?.name === "TimeoutError"
  ) {
    const mappedError =
      new Error(
        "Gemini AI took too long to respond. Please try again."
      );

    mappedError.statusCode = 504;
    mappedError.code =
      "AI_TIMEOUT";

    return mappedError;
  }

  /* =======================================================
     SERVER ERROR
  ======================================================= */

  if (status >= 500) {
    const mappedError =
      new Error(
        "The Gemini AI service is temporarily unavailable. Please try again."
      );

    mappedError.statusCode = 502;
    mappedError.code =
      "AI_UPSTREAM_ERROR";

    return mappedError;
  }

  /* =======================================================
     UNKNOWN ERROR
  ======================================================= */

  const mappedError =
    new Error(
      "Unable to get AI response. Please try again."
    );

  mappedError.statusCode = 502;
  mappedError.code =
    "AI_UNKNOWN_ERROR";

  return mappedError;
};
import { getChatResponse } from "../service/Aiservice.js";

/* =========================================================
   CONFIG
========================================================= */

const MAX_MESSAGE_LENGTH = 2000;

/* =========================================================
   CHAT CONTROLLER
========================================================= */

export const chatWithAI = async (req, res) => {
  try {
    const { message, conversation } = req.body || {};

    /* =====================================================
       Validate message
    ===================================================== */

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A message is required.",
        code: "MESSAGE_REQUIRED",
      });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
        code: "MESSAGE_TOO_LONG",
      });
    }

    /* =====================================================
       Validate conversation
    ===================================================== */

    if (
      conversation !== undefined &&
      !Array.isArray(conversation)
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversation history must be an array.",
        code: "INVALID_CONVERSATION",
      });
    }

    /* =====================================================
       Get AI response
    ===================================================== */

    const reply = await getChatResponse({
      message: trimmedMessage,
      conversation: conversation || [],
    });

    /* =====================================================
       Success
    ===================================================== */

    return res.status(200).json({
      success: true,
      message: reply,
    });
  } catch (error) {
    console.error("=================================");
    console.error("AI CHAT CONTROLLER ERROR");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Status:", error?.statusCode);
    console.error("=================================");

    const statusCode = error?.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error?.message ||
        "Unable to get AI response. Please try again.",
      code: error?.code || "AI_ERROR",
    });
  }
};
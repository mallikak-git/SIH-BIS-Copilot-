const express = require("express");

const router = express.Router();

const {
  answerQuestion,
} = require("../knowledge/knowledgeEngine");

/* =========================================
   POST /api/chat
========================================= */

router.post("/", (req, res) => {
  try {
    const { message } = req.body;

    if (
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message.",
      });
    }

    const result = answerQuestion(
      message.trim()
    );

    res.json({
      success: true,

      userMessage: message.trim(),

      ...result,

      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process chat request.",
    });
  }
});

module.exports = router;
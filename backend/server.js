const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoutes = require("./routes/chat");
const analyzerRoutes = require("./routes/analyzer");
const readinessRoutes = require("./routes/readiness");
const knowledgeRoutes = require("./routes/knowledge");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "BIS-Copilot",
    message: "Backend is running successfully",
    status: "online",
  });
});

/* =========================
   API ROUTES
========================= */

app.use("/api/chat", chatRoutes);

app.use("/api/analyze", analyzerRoutes);

app.use("/api/readiness", readinessRoutes);

app.use("/api/knowledge", knowledgeRoutes);

/* =========================
   API STATUS
========================= */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    application: "BIS-Copilot API",

    endpoints: {
      chat: "POST /api/chat",
      analyze: "POST /api/analyze",
      readiness: "POST /api/readiness",
      products: "GET /api/knowledge/products",
      search: "GET /api/knowledge/search?q=...",
      standard: "GET /api/knowledge/standards/:id",
    },
  });
});

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("====================================");
  console.error("SERVER ERROR");
  console.error("====================================");
  console.error(err);
  console.error("====================================");

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* =========================
   START SERVER
========================= */
// ===============================
// EVIDENCE API
// ===============================

const evidenceStore = {};

// Get evidence for a product
app.get("/api/evidence/:product", (req, res) => {
  const product = decodeURIComponent(req.params.product);

  if (!evidenceStore[product]) {
    evidenceStore[product] = [
      {
        id: 1,
        name: "Product Specification Sheet",
        type: "Document",
        required: true,
        completed: false,
      },
      {
        id: 2,
        name: "Product Test Report",
        type: "Test Report",
        required: true,
        completed: false,
      },
      {
        id: 3,
        name: "Technical Documentation",
        type: "Document",
        required: true,
        completed: false,
      },
      {
        id: 4,
        name: "BIS Standard Reference",
        type: "Standard",
        required: true,
        completed: false,
      },
      {
        id: 5,
        name: "Declaration / Supporting Evidence",
        type: "Evidence",
        required: false,
        completed: false,
      },
    ];
  }

  res.json({
    product,
    evidence: evidenceStore[product],
  });
});


// Update evidence status
app.patch("/api/evidence/:product/:id", (req, res) => {
  const product = decodeURIComponent(req.params.product);
  const id = Number(req.params.id);

  if (!evidenceStore[product]) {
    return res.status(404).json({
      message: "Product evidence not found",
    });
  }

  const item = evidenceStore[product].find(
    (evidence) => evidence.id === id
  );

  if (!item) {
    return res.status(404).json({
      message: "Evidence item not found",
    });
  }

  item.completed = Boolean(req.body.completed);

  res.json({
    message: "Evidence updated",
    evidence: item,
  });
});
// ===============================
// CHAT API
// ===============================

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a question.",
      });
    }

    const question = message.trim().toLowerCase();

    let reply =
      "I can help you understand BIS standards, product requirements, testing, documents, and compliance steps. Please provide more details about your product.";

    // Ceiling fan
    if (
      question.includes("ceiling fan") ||
      question.includes("fan")
    ) {
      reply =
        "For a domestic ceiling fan, BIS compliance generally involves identifying the applicable Indian Standard, checking the product specifications, and ensuring the required testing and documentation are available. Tell me the fan's operating voltage, power rating, and type so I can narrow down the requirements.";
    }

    // BIS standard
    else if (
      question.includes("standard") ||
      question.includes("is code") ||
      question.includes("bis code")
    ) {
      reply =
        "The applicable BIS standard depends on the exact product, its specifications, intended use, and applicable regulatory requirements. Please provide the product name, category, model/type, and key technical specifications.";
    }

    // Testing
    else if (
      question.includes("test") ||
      question.includes("testing")
    ) {
      reply =
        "Testing requirements depend on the applicable BIS standard. Typical compliance evaluation may involve product performance, safety, construction, electrical, mechanical, or other tests specified by the relevant standard.";
    }

    // Documents
    else if (
      question.includes("document") ||
      question.includes("documents") ||
      question.includes("paper")
    ) {
      reply =
        "Common compliance evidence can include product specifications, technical documentation, test reports, declarations, and applicable BIS standard references. The exact documents depend on the product and certification route.";
    }

    // Certification
    else if (
      question.includes("certificate") ||
      question.includes("certification")
    ) {
      reply =
        "BIS certification requirements depend on the product and the applicable conformity assessment scheme. First identify the applicable Indian Standard and then determine the certification or registration route that applies.";
    }

    // Hello
    else if (
      question.includes("hello") ||
      question.includes("hi") ||
      question.includes("hey")
    ) {
      reply =
        "Hello! 👋 I'm BIS-Copilot. Tell me about your product and I can help you understand possible BIS standards, evidence, testing, and compliance steps.";
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process your question.",
    });
  }
});
app.listen(PORT, () => {
  console.log("");
  console.log("====================================");
  console.log("          BIS-COPILOT");
  console.log("        BACKEND SERVER");
  console.log("====================================");
  console.log(`Server:  http://localhost:${PORT}`);
  console.log(`API:     http://localhost:${PORT}/api`);
  console.log("------------------------------------");
  console.log("Chat:       /api/chat");
  console.log("Analyzer:   /api/analyze");
  console.log("Readiness:  /api/readiness");
  console.log("Knowledge:  /api/knowledge");
  console.log("------------------------------------");
  console.log("Status: RUNNING");
  console.log("====================================");
  console.log("");
});
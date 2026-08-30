const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoutes = require("./routes/chat");
const analyzerRoutes = require("./routes/analyzer");
const readinessRoutes = require("./routes/readiness");
const knowledgeRoutes = require("./routes/knowledge");
const authRoutes = require("./routes/auth");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
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
   AUTHENTICATION ROUTES
========================= */

app.use("/api/auth", authRoutes);

/* =========================
   API STATUS
========================= */

app.get("/api", (req, res) => {
  res.json({
    success: true,
    application: "BIS-Copilot API",

    endpoints: {
      authRegister: "POST /api/auth/register",
      authLogin: "POST /api/auth/login",

      chat: "POST /api/chat",
      analyze: "POST /api/analyze",
      readiness: "POST /api/readiness",

      products: "GET /api/knowledge/products",
      search: "GET /api/knowledge/search?q=...",
      standard: "GET /api/knowledge/standards/:id",

      evidence: "GET /api/evidence/:product",
      updateEvidence: "PATCH /api/evidence/:product/:id",
    },
  });
});

/* =========================
   EVIDENCE API
========================= */

const evidenceStore = {};

/* Get evidence for a product */
app.get("/api/evidence/:product", (req, res) => {
  try {
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
      success: true,
      product,
      evidence: evidenceStore[product],
    });
  } catch (error) {
    console.error("Evidence GET error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load evidence.",
    });
  }
});

/* Update evidence status */
app.patch("/api/evidence/:product/:id", (req, res) => {
  try {
    const product = decodeURIComponent(req.params.product);
    const id = Number(req.params.id);

    if (!evidenceStore[product]) {
      return res.status(404).json({
        success: false,
        message: "Product evidence not found",
      });
    }

    const item = evidenceStore[product].find(
      (evidence) => evidence.id === id
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Evidence item not found",
      });
    }

    item.completed = Boolean(req.body.completed);

    res.json({
      success: true,
      message: "Evidence updated",
      evidence: item,
    });
  } catch (error) {
    console.error("Evidence PATCH error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update evidence.",
    });
  }
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

const server = app.listen(PORT, () => {
  console.log("");
  console.log("====================================");
  console.log("          BIS-COPILOT");
  console.log("        BACKEND SERVER");
  console.log("====================================");
  console.log(`Server:  http://localhost:${PORT}`);
  console.log(`API:     http://localhost:${PORT}/api`);
  console.log("------------------------------------");
  console.log("Auth:       /api/auth");
  console.log("Chat:       /api/chat");
  console.log("Analyzer:   /api/analyze");
  console.log("Readiness:  /api/readiness");
  console.log("Knowledge:  /api/knowledge");
  console.log("Evidence:   /api/evidence/:product");
  console.log("------------------------------------");
  console.log("Status: RUNNING");
  console.log("====================================");
  console.log("");
});

/* =========================
   PROCESS DIAGNOSTICS
========================= */

process.on("exit", (code) => {
  console.log("NODE PROCESS EXITED WITH CODE:", code);
});

process.on("uncaughtException", (error) => {
  console.error("====================================");
  console.error("UNCAUGHT EXCEPTION");
  console.error("====================================");
  console.error(error);
});

process.on("unhandledRejection", (error) => {
  console.error("====================================");
  console.error("UNHANDLED REJECTION");
  console.error(error);
});

/* =========================
   SERVER ERROR
========================= */

server.on("error", (error) => {
  console.error("====================================");
  console.error("SERVER LISTEN ERROR");
  console.error("====================================");
  console.error(error);
  console.error("====================================");
});
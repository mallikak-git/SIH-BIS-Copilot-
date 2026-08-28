const express = require("express");

const router = express.Router();

const {
  analyzeProduct,
} = require("../knowledge/knowledgeEngine");

/* =========================================
   POST /api/analyze
========================================= */

router.post("/", (req, res) => {
  try {
    const {
      productName,
      category,
      voltage,
      power,
      intendedUse,
    } = req.body;

    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (
      !productName ||
      !category ||
      !voltage
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Product name, category and operating voltage are required.",
      });
    }

    /* -----------------------------
       KNOWLEDGE ENGINE
    ----------------------------- */

    const result = analyzeProduct({
      productName: productName.trim(),
      category: category.trim(),
      voltage: voltage.trim(),
      power: power?.trim() || "",
      intendedUse:
        intendedUse?.trim() || "",
    });

    /* -----------------------------
       NO MATCH
    ----------------------------- */

    if (!result.matched) {
      return res.json({
        success: true,

        product: result.product,

        analysis: {
          productType: category,

          standardStatus:
            "Product-specific verification required",

          description:
            result.message,

          requirements: [
            "Classify the product",
            "Identify the applicable BIS standard",
            "Verify regulatory applicability",
            "Identify testing requirements",
            "Prepare supporting documentation",
          ],

          evidence: [
            "Product specifications",
            "Technical documentation",
            "Applicable test reports",
          ],

          confidence:
            result.confidence,
        },

        standards: [],

        note:
          "The product was not matched against the current demonstration knowledge base. Verify the applicable requirements using authoritative BIS information.",
      });
    }

    /* -----------------------------
       MATCH FOUND
    ----------------------------- */

    const standard =
      result.standards[0];

    res.json({
      success: true,

      product: result.product,

      analysis: {
        productType:
          result.matchedProduct.name,

        standardStatus:
          standard
            ? standard.status
            : "VERIFY",

        description:
          standard
            ? standard.applicability
            : "Potential product match found, but a standard record is not available.",

        requirements:
          standard
            ? standard.requirements
            : [],

        evidence:
          standard
            ? standard.evidence
            : [],

        confidence:
          result.confidence,
      },

      standards: result.standards,

      note:
        "This is a preliminary compliance assessment. Verify the exact applicable BIS standard and current regulatory requirements before relying on the result.",

      timestamp:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Product analyzer error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to analyze product.",
    });
  }
});

module.exports = router;
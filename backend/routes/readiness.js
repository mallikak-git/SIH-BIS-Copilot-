const express = require("express");
const router = express.Router();

/* =========================
   POST /api/readiness
========================= */

router.post("/", (req, res) => {
  try {
    const {
      productName,
      category,
      voltage,
      power,
      standardConfirmed = false,
      testReports = false,
      technicalDocuments = false,
      markingVerified = false,
    } = req.body;

    if (!productName || !category || !voltage) {
      return res.status(400).json({
        success: false,
        message:
          "Product name, category and operating voltage are required.",
      });
    }

    const checklist = [
      {
        title: "Product Information",
        status: "Complete",
        completed: true,
      },

      {
        title: "Technical Specifications",
        status: power ? "Complete" : "Review",
        completed: Boolean(power),
      },

      {
        title: "Applicable BIS Standard",
        status: standardConfirmed
          ? "Complete"
          : "Review",
        completed: Boolean(standardConfirmed),
      },

      {
        title: "Test Reports",
        status: testReports
          ? "Complete"
          : "Pending",
        completed: Boolean(testReports),
      },

      {
        title: "Technical Documents",
        status: technicalDocuments
          ? "Complete"
          : "Pending",
        completed: Boolean(technicalDocuments),
      },

      {
        title: "Marking & Labelling",
        status: markingVerified
          ? "Complete"
          : "Review",
        completed: Boolean(markingVerified),
      },
    ];

    const completed = checklist.filter(
      (item) => item.completed
    ).length;

    const percentage = Math.round(
      (completed / checklist.length) * 100
    );

    let readinessLevel = "Needs Attention";

    if (percentage >= 80) {
      readinessLevel = "Good";
    } else if (percentage >= 50) {
      readinessLevel = "In Progress";
    }

    res.json({
      success: true,

      product: {
        productName,
        category,
        voltage,
        power: power || null,
      },

      readiness: {
        percentage,
        level: readinessLevel,
        completed,
        total: checklist.length,
      },

      checklist,

      nextActions: [
        "Confirm the applicable BIS standard",
        "Complete required testing",
        "Prepare technical documentation",
        "Verify marking and labelling",
        "Review all supporting evidence",
      ],

      note:
        "This is a preliminary readiness assessment and does not replace verification of applicable BIS requirements.",

      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Readiness error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to calculate readiness.",
    });
  }
});

module.exports = router;
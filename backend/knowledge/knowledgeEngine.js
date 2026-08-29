const products = require("./products");
const standards = require("./standards");
const bisProducts = require("./csvKnowledge");

/* =========================================
   NORMALIZE TEXT
========================================= */

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s:.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================
   GET SEARCH WORDS
========================================= */

function getSearchWords(text) {
  const stopWords = new Set([
    "what",
    "is",
    "the",
    "a",
    "an",
    "for",
    "of",
    "to",
    "and",
    "or",
    "in",
    "on",
    "with",
    "can",
    "you",
    "tell",
    "me",
    "about",
    "give",
    "show",
    "please",
    "does",
    "do",
    "which",
    "are",
    "be",
    "my",
    "how",
    "where",
    "when",
    "from",
    "this",
    "that",
    "applicable",
    "standard",
    "bis",
    "requirements",
  ]);

  return normalize(text)
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 3 &&
        !stopWords.has(word)
    );
}

/* =========================================
   CSV PRODUCT SEARCH
========================================= */

function searchCSVKnowledge(query) {
  const text = normalize(query);
  const words = getSearchWords(query);

  if (!text || words.length === 0) {
    return [];
  }

  const scoredProducts = bisProducts.map((product) => {
    const productName = normalize(
      product["Product Name"]
    );

    const category = normalize(
      product["Product Category"]
    );

    const standardNumber = normalize(
      product["BIS Standard Number"]
    );

    const standardTitle = normalize(
      product["Standard Title"]
    );

    const requirements = normalize(
      product["Key Requirements"]
    );

    const testing = normalize(
      product["Testing Requirements"]
    );

    const certification = normalize(
      product["Certification Information"]
    );

    const combinedText = [
      productName,
      category,
      standardNumber,
      standardTitle,
      requirements,
      testing,
      certification,
    ].join(" ");

    let score = 0;

    /* -----------------------------
       Exact phrase matches
    ----------------------------- */

    if (
      productName &&
      text.includes(productName)
    ) {
      score += 30;
    }

    if (
      standardNumber &&
      text.includes(standardNumber)
    ) {
      score += 30;
    }

    if (
      standardTitle &&
      text.includes(standardTitle)
    ) {
      score += 20;
    }

    /* -----------------------------
       Individual word matches
    ----------------------------- */

    for (const word of words) {
      if (productName.includes(word)) {
        score += 10;
      }

      if (category.includes(word)) {
        score += 5;
      }

      if (standardNumber.includes(word)) {
        score += 10;
      }

      if (standardTitle.includes(word)) {
        score += 7;
      }

      if (requirements.includes(word)) {
        score += 2;
      }

      if (testing.includes(word)) {
        score += 2;
      }

      if (certification.includes(word)) {
        score += 2;
      }
    }

    /* -----------------------------
       General combined-text match
    ----------------------------- */

    const matchedWords = words.filter(
      (word) => combinedText.includes(word)
    );

    if (matchedWords.length >= 2) {
      score += matchedWords.length * 3;
    }

    return {
      product,
      score,
    };
  });

  return scoredProducts
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}

/* =========================================
   FIND PRODUCT — EXISTING KNOWLEDGE
========================================= */

function findProduct(query) {
  const text = normalize(query);

  if (!text) {
    return null;
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const product of products) {
    let score = 0;

    if (
      text.includes(
        normalize(product.name)
      )
    ) {
      score += 10;
    }

    if (
      text.includes(
        normalize(product.category)
      )
    ) {
      score += 5;
    }

    for (const keyword of product.keywords) {
      if (
        text.includes(
          normalize(keyword)
        )
      ) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = product;
    }
  }

  return bestMatch;
}

/* =========================================
   GET PRODUCT STANDARDS
========================================= */

function getStandardsForProduct(productId) {
  return standards.filter(
    (standard) =>
      standard.productId === productId
  );
}

/* =========================================
   ANALYZE PRODUCT
========================================= */

function analyzeProduct({
  productName,
  category,
  voltage,
  power,
  intendedUse,
}) {
  const searchText = `
    ${productName}
    ${category}
    ${voltage}
    ${power || ""}
    ${intendedUse || ""}
  `;

  const product = findProduct(searchText);

  if (!product) {
    return {
      matched: false,

      product: {
        productName,
        category,
        voltage,
        power: power || null,
        intendedUse: intendedUse || null,
      },

      standards: [],

      confidence: "Needs further review",

      message:
        "No matching product was found in the current BIS knowledge base.",
    };
  }

  const productStandards =
    getStandardsForProduct(product.id);

  return {
    matched: true,

    product: {
      id: product.id,
      productName,
      category,
      voltage,
      power: power || null,
      intendedUse: intendedUse || null,
    },

    matchedProduct: product,

    standards: productStandards,

    confidence: "Preliminary",

    message:
      "A potentially relevant product category was identified. Verify the applicable BIS standard and regulatory requirements before making a compliance decision.",
  };
}

/* =========================================
   SEARCH KNOWLEDGE
========================================= */

function searchKnowledge(query) {
  const text = normalize(query);

  const csvMatches =
    searchCSVKnowledge(query);

  const productMatches =
    products.filter((product) => {
      return (
        normalize(product.name).includes(text) ||
        normalize(product.category).includes(text) ||
        product.keywords.some((keyword) =>
          normalize(keyword).includes(text)
        )
      );
    });

  const standardMatches =
    standards.filter((standard) => {
      return (
        normalize(standard.title).includes(text) ||
        normalize(
          standard.applicability
        ).includes(text) ||
        standard.requirements.some(
          (requirement) =>
            normalize(requirement).includes(text)
        )
      );
    });

  return {
    products: productMatches,
    standards: standardMatches,
    bisProducts: csvMatches,
  };
}

/* =========================================
   CHAT KNOWLEDGE
========================================= */

function answerQuestion(question) {
  const text = normalize(question);

  /* =====================================
     SEARCH REAL BIS CSV DATA FIRST
  ===================================== */

  const csvMatches =
    searchCSVKnowledge(question);

  if (csvMatches.length > 0) {
    const product = csvMatches[0];

    const requirements =
      product["Key Requirements"]
        ? product["Key Requirements"]
            .split(";")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const testingRequirements =
      product["Testing Requirements"]
        ? product["Testing Requirements"]
            .split(";")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    return {
      answer:
        `I found a potentially relevant BIS record for "${product["Product Name"]}". ` +
        `The associated BIS standard is ${product["BIS Standard Number"]}. ` +
        `${product["Standard Title"]}. ` +
        `Please verify the latest official BIS requirements before making a compliance decision.`,

      product:
        product["Product Name"],

      category:
        product["Product Category"],

      standard:
        product["BIS Standard Number"],

      standardTitle:
        product["Standard Title"],

      requirements,

      testingRequirements,

      certificationInformation:
        product["Certification Information"],

      source:
        product["Source"],

      confidence: "Preliminary",

      matchesFound:
        csvMatches.length,
    };
  }

  /* =====================================
     EXISTING PRODUCT KNOWLEDGE
  ===================================== */

  const analysis =
    analyzeProduct({
      productName: question,
      category: "",
      voltage: "",
    });

  if (analysis.matched) {
    const standard =
      analysis.standards[0];

    if (standard) {
      return {
        answer:
          `${standard.applicability} ` +
          `The current knowledge record is marked "${standard.status}", ` +
          `so the exact applicable standard must be verified.`,

        product:
          analysis.matchedProduct.name,

        standardStatus:
          standard.status,

        requirements:
          standard.requirements,

        evidence:
          standard.evidence,

        source:
          standard.source,

        confidence:
          analysis.confidence,
      };
    }
  }

  /* =====================================
     TESTING QUESTION
  ===================================== */

  if (
    text.includes("test") ||
    text.includes("testing")
  ) {
    return {
      answer:
        "Testing requirements depend on the exact product and applicable BIS standard. First identify the product category and verify the applicable standard. The relevant standard should then be used to determine the required tests.",

      requirements: [
        "Identify the product",
        "Identify the applicable BIS standard",
        "Determine required tests",
        "Complete applicable testing",
        "Maintain test reports",
      ],

      evidence: [
        "Applicable product standard",
        "Test methods",
        "Laboratory test reports",
      ],

      confidence: "Preliminary",
    };
  }

  /* =====================================
     DOCUMENTATION QUESTION
  ===================================== */

  if (
    text.includes("document") ||
    text.includes("documents")
  ) {
    return {
      answer:
        "Typical compliance documentation can include product specifications, technical drawings, test reports, product information and other supporting evidence. The exact documentation depends on the applicable product standard and conformity assessment requirements.",

      requirements: [
        "Product specifications",
        "Technical drawings",
        "Applicable test reports",
        "Supporting compliance documentation",
      ],

      evidence: [
        "Technical specification",
        "Technical drawings",
        "Test reports",
        "Product documentation",
      ],

      confidence: "Preliminary",
    };
  }

  /* =====================================
     CERTIFICATION QUESTION
  ===================================== */

  if (
    text.includes("certification") ||
    text.includes("certificate")
  ) {
    return {
      answer:
        "The applicable BIS certification or registration route depends on the product and the requirements applicable to that product. The first step is to identify the correct product category and applicable standard.",

      requirements: [
        "Identify product",
        "Identify applicable BIS standard",
        "Determine conformity assessment route",
        "Complete applicable testing",
        "Prepare required documentation",
      ],

      evidence: [
        "Product classification",
        "Applicable standard",
        "Test reports",
        "Technical documentation",
      ],

      confidence: "Preliminary",
    };
  }

  /* =====================================
     GENERAL QUESTION
  ===================================== */

  return {
    answer:
      "I can help with BIS compliance. Please provide your product name, category, operating voltage, intended use, and technical specifications so I can identify potentially relevant compliance requirements.",

    requirements: [
      "Product identification",
      "Product classification",
      "Applicable standard identification",
      "Testing requirements",
      "Supporting evidence",
    ],

    evidence: [
      "Product specifications",
      "Technical documentation",
      "Applicable standards",
    ],

    confidence: "Needs further review",
  };
}

/* =========================================
   EXPORT
========================================= */

module.exports = {
  findProduct,
  getStandardsForProduct,
  analyzeProduct,
  searchKnowledge,
  searchCSVKnowledge,
  answerQuestion,
};
const bisProducts = require("./csvKnowledge");

/* =========================================================
   TEXT NORMALIZATION
========================================================= */

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s:.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   STOP WORDS
========================================================= */

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
  "standards",
  "bis",
  "requirements",
  "requirement",
  "product",
  "products",
  "need",
  "needed",
  "use",
  "using",
  "domestic",
  "type",
  "model",
]);

/* =========================================================
   GET MEANINGFUL WORDS
========================================================= */

function getSearchWords(text) {
  return normalize(text)
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 3 &&
        !stopWords.has(word)
    );
}

/* =========================================================
   CSV FIELD HELPERS
========================================================= */

function getProductName(product) {
  return normalize(product["Product Name"]);
}

function getCategory(product) {
  return normalize(product["Product Category"]);
}

function getStandardNumber(product) {
  return normalize(product["BIS Standard Number"]);
}

function getStandardTitle(product) {
  return normalize(product["Standard Title"]);
}

function getRequirements(product) {
  return normalize(product["Key Requirements"]);
}

function getTesting(product) {
  return normalize(product["Testing Requirements"]);
}

function getCertification(product) {
  return normalize(
    product["Certification Information"]
  );
}

/* =========================================================
   TOKENIZE
========================================================= */

function tokenize(text) {
  return new Set(getSearchWords(text));
}

/* =========================================================
   TOKEN MATCH COUNT
========================================================= */

function countMatches(queryWords, targetText) {
  let count = 0;

  for (const word of queryWords) {
    if (targetText.includes(word)) {
      count++;
    }
  }

  return count;
}

/* =========================================================
   PRODUCT SCORING
========================================================= */

function scoreProduct(query, product) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return 0;
  }

  const queryWords = tokenize(query);

  if (queryWords.size === 0) {
    return 0;
  }

  const productName = getProductName(product);
  const category = getCategory(product);
  const standardNumber = getStandardNumber(product);
  const standardTitle = getStandardTitle(product);

  let score = 0;

  /* =======================================================
     1. EXACT PRODUCT NAME
  ======================================================= */

  if (
    productName &&
    normalizedQuery.includes(productName)
  ) {
    score += 300;
  }

  /* =======================================================
     2. EXACT STANDARD NUMBER
  ======================================================= */

  if (
    standardNumber &&
    normalizedQuery.includes(standardNumber)
  ) {
    score += 300;
  }

  /* =======================================================
     3. PRODUCT NAME WORD MATCHING
  ======================================================= */

  const productWords = tokenize(productName);

  let productNameMatches = 0;

  for (const word of queryWords) {
    if (productWords.has(word)) {
      productNameMatches++;
    }
  }

  if (productNameMatches > 0) {
    score += productNameMatches * 60;
  }

  /* =======================================================
     4. CATEGORY MATCHING
  ======================================================= */

  const categoryWords = tokenize(category);

  let categoryMatches = 0;

  for (const word of queryWords) {
    if (categoryWords.has(word)) {
      categoryMatches++;
    }
  }

  if (categoryMatches > 0) {
    score += categoryMatches * 50;
  }

  /* =======================================================
     5. STANDARD TITLE MATCHING
  ======================================================= */

  const titleWords = tokenize(standardTitle);

  let titleMatches = 0;

  for (const word of queryWords) {
    if (titleWords.has(word)) {
      titleMatches++;
    }
  }

  if (titleMatches > 0) {
    score += titleMatches * 15;
  }

  /* =======================================================
     6. STANDARD NUMBER TOKEN MATCH
  ======================================================= */

  if (
    standardNumber &&
    normalizedQuery.includes(standardNumber)
  ) {
    score += 100;
  }

  /* =======================================================
     7. STRONG PRODUCT MATCH BONUS
  ======================================================= */

  if (productWords.size > 0) {
    const productCoverage =
      productNameMatches /
      productWords.size;

    if (productCoverage >= 0.75) {
      score += 150;
    } else if (productCoverage >= 0.5) {
      score += 75;
    }
  }

  /* =======================================================
     8. CATEGORY CONFLICT PENALTY
  ======================================================= */

  /*
     If the query contains an obvious category word
     and the product belongs to a different category,
     reduce the score heavily.

     Example:

     Query:
       Domestic Ceiling Fan + Electrical

     Product:
       Domestic Pressure Cooker + Pressure cooker

     This prevents the cooker from winning merely
     because both contain "domestic".
  */

  const queryCategoryWords = new Set(
    [...queryWords].filter((word) => {
      return (
        word === "electrical" ||
        word === "steel" ||
        word === "cement" ||
        word === "helmets" ||
        word === "helmet" ||
        word === "footwear" ||
        word === "lamps" ||
        word === "lamp" ||
        word === "cables" ||
        word === "cable" ||
        word === "wires" ||
        word === "wire" ||
        word === "water" ||
        word === "pressure" ||
        word === "cooker" ||
        word === "gold" ||
        word === "silver"
      );
    })
  );

  if (queryCategoryWords.size > 0) {
    let categoryConflict = true;

    for (const word of queryCategoryWords) {
      if (
        category.includes(word) ||
        productName.includes(word) ||
        standardTitle.includes(word)
      ) {
        categoryConflict = false;
        break;
      }
    }

    if (categoryConflict) {
      score -= 150;
    }
  }

  /* =======================================================
     9. IMPORTANT:
        GENERIC WORDS ALONE CANNOT PRODUCE A MATCH
  ======================================================= */

  if (productNameMatches === 0) {
    score -= 100;
  }

  return score;
}

/* =========================================================
   SEARCH CSV KNOWLEDGE
========================================================= */

function searchCSVKnowledge(query) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  const scored = bisProducts
    .map((product) => ({
      product,
      score: scoreProduct(
        normalizedQuery,
        product
      ),
    }))
    .filter(
      (item) => item.score >= 120
    )
    .sort(
      (a, b) => b.score - a.score
    );

  return scored.map(
    (item) => item.product
  );
}

/* =========================================================
   FIND BEST CSV PRODUCT
========================================================= */

function findBestCSVProduct(query) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return null;
  }

  const scored = bisProducts
    .map((product) => ({
      product,
      score: scoreProduct(
        normalizedQuery,
        product
      ),
    }))
    .sort(
      (a, b) => b.score - a.score
    );

  if (scored.length === 0) {
    return null;
  }

  const best = scored[0];

  /*
     IMPORTANT:
     If the best result is not strong enough,
     return NO MATCH instead of guessing.
  */

  if (best.score < 120) {
    return null;
  }

  return best;
}

/* =========================================================
   CSV LIST FIELD → ARRAY
========================================================= */

function toArray(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* =========================================================
   ANALYZE PRODUCT
========================================================= */

function analyzeProduct({
  productName,
  category,
  voltage,
  power,
  intendedUse,
}) {
  const searchText = [
    productName,
    category,
    voltage,
    power,
    intendedUse,
  ]
    .filter(Boolean)
    .join(" ");

  const best =
    findBestCSVProduct(searchText);

  /* =======================================================
     NO MATCH
  ======================================================= */

  if (!best) {
    return {
      matched: false,

      product: {
        productName,
        category,
        voltage,
        power: power || null,
        intendedUse:
          intendedUse || null,
      },

      matchedProduct: null,

      standards: [],

      confidence:
        "Needs further review",

      message:
        "No reliable matching product was found in the current BIS knowledge base. The system will not assume an unrelated BIS product. Please add or verify the product against authoritative BIS information.",
    };
  }

  /* =======================================================
     MATCH FOUND
  ======================================================= */

  const product = best.product;

  const requirements =
    toArray(
      product["Key Requirements"]
    );

  const testingRequirements =
    toArray(
      product["Testing Requirements"]
    );

  const standard = {
    status: "VERIFY",

    standardNumber:
      product["BIS Standard Number"],

    title:
      product["Standard Title"],

    applicability:
      `Potentially applicable BIS information found for ${product["Product Name"]}.`,

    requirements,

    evidence: [
      "Product specifications",
      "Technical documentation",
      "Applicable test reports",
      "BIS standard reference",
    ],

    testingRequirements,

    certificationInformation:
      product[
        "Certification Information"
      ],

    source:
      product["Source"],
  };

  let confidence =
    "Preliminary";

  if (best.score >= 300) {
    confidence = "High";
  } else if (best.score >= 180) {
    confidence = "Moderate";
  }

  return {
    matched: true,

    product: {
      productName,
      category,
      voltage,
      power: power || null,
      intendedUse:
        intendedUse || null,
    },

    matchedProduct: {
      name:
        product["Product Name"],

      category:
        product["Product Category"],

      standard:
        product["BIS Standard Number"],

      source:
        product["Source"],
    },

    standards: [standard],

    confidence,

    score: best.score,

    message:
      "A potentially relevant BIS product record was identified. Verify the exact applicable standard and current regulatory requirements before making a compliance decision.",
  };
}

/* =========================================================
   SEARCH KNOWLEDGE
========================================================= */

function searchKnowledge(query) {
  const matches =
    searchCSVKnowledge(query);

  return {
    products: matches,

    standards: [],

    bisProducts: matches,
  };
}

/* =========================================================
   BUILD CSV ANSWER
========================================================= */

function buildCSVAnswer(product) {
  const requirements =
    toArray(
      product["Key Requirements"]
    );

  const testingRequirements =
    toArray(
      product["Testing Requirements"]
    );

  return {
    answer:
      `I found a potentially relevant BIS record for "${product["Product Name"]}". ` +
      `The associated BIS standard is ${product["BIS Standard Number"]}: ` +
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
      product[
        "Certification Information"
      ],

    source:
      product["Source"],

    confidence:
      "Preliminary",

    matchesFound: 1,
  };
}

/* =========================================================
   ANSWER COPILOT QUESTION
========================================================= */

function answerQuestion(question) {
  const text = normalize(question);

  /* =======================================================
     PRODUCT SEARCH
  ======================================================= */

  const csvMatches =
    searchCSVKnowledge(question);

  if (csvMatches.length > 0) {
    return buildCSVAnswer(
      csvMatches[0]
    );
  }

  /* =======================================================
     TESTING
  ======================================================= */

  if (
    text.includes("test") ||
    text.includes("testing")
  ) {
    return {
      answer:
        "Testing requirements depend on the exact product and applicable BIS standard. First identify the product and applicable standard, then determine the tests specified by that standard.",

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

      confidence:
        "Needs further review",

      matchesFound: 0,
    };
  }

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  if (
    text.includes("document") ||
    text.includes("documents")
  ) {
    return {
      answer:
        "Typical BIS compliance documentation can include product specifications, technical documentation, test reports and other supporting evidence. The exact documents depend on the applicable product standard and conformity assessment requirements.",

      requirements: [
        "Product specifications",
        "Technical documentation",
        "Applicable test reports",
        "Supporting compliance documentation",
      ],

      evidence: [
        "Product specifications",
        "Technical documentation",
        "Test reports",
        "Applicable standards",
      ],

      confidence:
        "Needs further review",

      matchesFound: 0,
    };
  }

  /* =======================================================
     CERTIFICATION
  ======================================================= */

  if (
    text.includes("certification") ||
    text.includes("certificate")
  ) {
    return {
      answer:
        "The applicable BIS certification or registration route depends on the product and the requirements applicable to that product. First identify the correct product category and applicable BIS standard.",

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

      confidence:
        "Needs further review",

      matchesFound: 0,
    };
  }

  /* =======================================================
     GENERAL
  ======================================================= */

  return {
    answer:
      "I could not find a sufficiently reliable product match in the current BIS knowledge base. Please provide the exact product name, category, intended use and key technical specifications.",

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

    confidence:
      "Needs further review",

    matchesFound: 0,
  };
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  findBestCSVProduct,
  analyzeProduct,
  searchKnowledge,
  searchCSVKnowledge,
  answerQuestion,
};
const standards = [
  {
    id: "fan",
    keywords: [
      "ceiling fan",
      "electric fan",
      "domestic fan",
      "fan",
    ],
    category: "Electrical Equipment",
    productType: "Domestic Ceiling Fan",

    standardStatus: "Requires verification",

    description:
      "Domestic ceiling fans may be subject to applicable BIS standards and conformity assessment requirements depending on product characteristics and regulatory scope.",

    requirements: [
      "Product specifications",
      "Electrical safety requirements",
      "Performance requirements",
      "Construction requirements",
      "Marking and labelling",
      "Applicable testing",
      "Technical documentation",
    ],

    evidence: [
      "Product specification sheet",
      "Technical drawings",
      "Test reports",
      "Product photographs",
      "Marking details",
    ],
  },

  {
    id: "electrical",
    keywords: [
      "electrical equipment",
      "electrical product",
      "electronic product",
    ],
    category: "Electrical Equipment",

    standardStatus: "Requires product-specific verification",

    description:
      "Electrical and electronic products may have different applicable BIS requirements depending on their exact product category and technical characteristics.",

    requirements: [
      "Product classification",
      "Applicable standard identification",
      "Safety testing",
      "Performance testing where applicable",
      "Technical documentation",
      "Marking and labelling",
    ],

    evidence: [
      "Technical specification",
      "Test reports",
      "Drawings",
      "Product documentation",
    ],
  },
];

module.exports = standards;
const standards = [
  {
    id: "standard-placeholder-fan",

    productId: "domestic-ceiling-fan",

    title: "Applicable BIS standard — verification required",

    status: "VERIFY",

    applicability:
      "A product-specific BIS standard must be identified and verified for the exact ceiling fan product and its applicable regulatory requirements.",

    requirements: [
      "Identify the exact product classification",
      "Verify the applicable BIS standard",
      "Verify the applicable conformity assessment route",
      "Identify required tests",
      "Prepare technical documentation",
      "Verify product marking and labelling",
    ],

    evidence: [
      {
        type: "Product Information",
        description:
          "Product name, category and intended use",
      },

      {
        type: "Technical Specification",
        description:
          "Operating voltage, power rating and relevant technical characteristics",
      },

      {
        type: "Technical Documentation",
        description:
          "Drawings, specifications and product documentation",
      },

      {
        type: "Test Evidence",
        description:
          "Applicable laboratory test reports",
      },
    ],

    source: {
      authority: "Bureau of Indian Standards",
      url: "https://www.bis.gov.in/",
      verified: false,
    },
  },
];

module.exports = standards;
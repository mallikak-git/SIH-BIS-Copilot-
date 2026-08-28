const express = require("express");

const router = express.Router();

const products = require("../knowledge/products");
const standards = require("../knowledge/standards");

/* =========================
   GET ALL PRODUCTS
========================= */

router.get("/products", (req, res) => {
  res.json({
    success: true,
    count: products.length,
    products,
  });
});

/* =========================
   SEARCH PRODUCTS
========================= */

router.get("/search", (req, res) => {
  const query = String(req.query.q || "")
    .trim()
    .toLowerCase();

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Search query is required.",
    });
  }

  const matches = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.keywords.some((keyword) =>
        keyword.toLowerCase().includes(query)
      )
    );
  });

  const results = matches.map((product) => {
    const productStandards = standards.filter(
      (standard) =>
        standard.productId === product.id
    );

    return {
      product,
      standards: productStandards,
    };
  });

  res.json({
    success: true,
    query,
    count: results.length,
    results,
  });
});

/* =========================
   GET STANDARD BY ID
========================= */

router.get("/standards/:id", (req, res) => {
  const standard = standards.find(
    (item) => item.id === req.params.id
  );

  if (!standard) {
    return res.status(404).json({
      success: false,
      message: "Standard record not found.",
    });
  }

  res.json({
    success: true,
    standard,
  });
});

module.exports = router;
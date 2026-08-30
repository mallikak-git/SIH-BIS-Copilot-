const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// ==========================================
// BIS CSV DATASET PATH
// ==========================================
//
// Project structure:
//
// SIH-BIS-Copilot-/
// ├── data/
// │   └── bis_products.csv
// │
// └── backend/
//     └── knowledge/
//         └── csvKnowledge.js
//
// From backend/knowledge/:
// ../../data/bis_products.csv
//
// ==========================================

const csvPath = path.join(
  __dirname,
  "..",
  "..",
  "data",
  "bis_products.csv"
);

// ==========================================
// LOAD BIS PRODUCTS
// ==========================================

function loadBISProducts() {
  try {
    console.log("====================================");
    console.log("Loading BIS CSV dataset...");
    console.log("CSV path:");
    console.log(csvPath);
    console.log("====================================");

    // Check whether CSV exists
    if (!fs.existsSync(csvPath)) {
      console.error("ERROR: BIS CSV file not found!");
      console.error("Expected location:");
      console.error(csvPath);

      return [];
    }

    // Read CSV
    const csvData = fs.readFileSync(
      csvPath,
      "utf8"
    );

    // Parse CSV
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_column_count: true,
      trim: true,
    });

    console.log(
      `BIS CSV products loaded: ${records.length}`
    );

    return records;

  } catch (error) {
    console.error(
      "ERROR loading BIS CSV:",
      error.message
    );

    return [];
  }
}

// ==========================================
// LOAD DATASET ON STARTUP
// ==========================================

const bisProducts = loadBISProducts();

// ==========================================
// EXPORT
// ==========================================

module.exports = bisProducts;
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// ==========================================
// BIS CSV DATASET PATH
// ==========================================
//
// Current structure:
//
// SIH-BIS-Copilot-/
// ├── data/
// │   └── bis_products.csv
// └── backend/
//     └── knowledge/
//         └── csvKnowledge.js
//
// From backend/knowledge/:
// ../../data/bis_products.csv
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
    const csvData = fs.readFileSync(csvPath, "utf8");

    // Parse CSV
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(
      `SUCCESS: Loaded ${records.length} BIS products from CSV`
    );

    return records;
  } catch (error) {
    console.error("ERROR loading BIS CSV:");
    console.error(error.message);

    return [];
  }
}

// ==========================================
// LOAD PRODUCTS
// ==========================================

const bisProducts = loadBISProducts();

console.log(
  "BIS CSV products loaded:",
  bisProducts.length
);

// ==========================================
// EXPORT
// ==========================================

module.exports = bisProducts;
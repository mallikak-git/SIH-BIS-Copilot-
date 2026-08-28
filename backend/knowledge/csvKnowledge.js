const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Path to the SIH BIS CSV dataset
const csvPath = path.join(
  __dirname,
  "../../SIH-BIS-Copilot-/data/bis_products.csv"
);

function loadBISProducts() {
  try {
    const csvData = fs.readFileSync(csvPath, "utf8");

    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records;
  } catch (error) {
    console.error("Error loading BIS CSV:", error.message);
    return [];
  }
}

const bisProducts = loadBISProducts();
console.log("BIS CSV products loaded:", bisProducts.length);
module.exports = bisProducts;
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// bisData.js is inside:
// SIH-BIS-Copilot-/backend/
//
// CSV is inside:
// SIH-BIS-Copilot-/data/bis_products.csv

const csvPath = path.join(
  __dirname,
  "..",
  "data",
  "bis_products.csv"
);

let products = [];

/**
 * Load BIS product data from CSV
 */
function loadProducts() {
  return new Promise((resolve, reject) => {
    products = [];

    console.log("Looking for BIS CSV at:");
    console.log(csvPath);

    if (!fs.existsSync(csvPath)) {
      return reject(
        new Error(`BIS CSV file not found at: ${csvPath}`)
      );
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        products.push(row);
      })
      .on("end", () => {
        console.log(
          `Loaded ${products.length} BIS products from CSV`
        );

        resolve(products);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Get all products
 */
function getProducts() {
  return products;
}

/**
 * Search BIS products
 */
function searchProducts(query) {
  if (!query || !query.trim()) {
    return [];
  }

  const searchText = query.toLowerCase().trim();

  const words = searchText
    .split(/\s+/)
    .filter((word) => word.length > 2);

  return products
    .map((product) => {
      const searchableText = Object.values(product)
        .join(" ")
        .toLowerCase();

      let score = 0;

      // Exact phrase match
      if (searchableText.includes(searchText)) {
        score += 10;
      }

      // Individual word matches
      words.forEach((word) => {
        if (searchableText.includes(word)) {
          score += 1;
        }
      });

      // Product name
      const productName = (
        product["Product Name"] || ""
      ).toLowerCase();

      // Product category
      const category = (
        product["Product Category"] || ""
      ).toLowerCase();

      if (productName.includes(searchText)) {
        score += 10;
      }

      if (category.includes(searchText)) {
        score += 8;
      }

      return {
        product,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}

/**
 * Find best matching product
 */
function findBestProduct(query) {
  const results = searchProducts(query);

  if (results.length === 0) {
    return null;
  }

  return results[0];
}

module.exports = {
  loadProducts,
  getProducts,
  searchProducts,
  findBestProduct,
};
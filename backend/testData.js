const {
  loadProducts,
  getProducts,
  searchProducts,
} = require("./bisData");

async function test() {
  try {
    await loadProducts();

    console.log("\nTOTAL PRODUCTS:");
    console.log(getProducts().length);

    console.log("\nSEARCH: pressure cooker");

    const results = searchProducts(
      "pressure cooker"
    );

    console.log(results);

  } catch (error) {
    console.error("DATA ERROR:");
    console.error(error);
  }
}

test();
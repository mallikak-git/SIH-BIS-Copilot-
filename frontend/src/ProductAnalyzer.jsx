import { useState } from "react";

function ProductAnalyzer({
  onProductAnalyzed,
  onGoToReadiness,
}) {
  const [form, setForm] = useState({
    productName: "",
    category: "",
    voltage: "",
    power: "",
    intendedUse: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // HANDLE FORM INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // ANALYZE PRODUCT
  // =========================================================

  const analyzeProduct = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    // Product name and category are required.
    // Voltage can be N/A for non-electrical products.
    if (
      !form.productName.trim() ||
      !form.category.trim() ||
      !form.voltage.trim()
    ) {
      setError(
        "Please fill in product name, category and operating voltage."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            productName: form.productName.trim(),
            category: form.category.trim(),
            voltage: form.voltage.trim(),
            power: form.power.trim(),
            intendedUse: form.intendedUse.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Product analysis failed."
        );
      }

      setResult(data);

      // Send complete result to App.jsx
      if (onProductAnalyzed) {
        onProductAnalyzed({
          ...data,

          product: {
            productName: form.productName.trim(),
            category: form.category.trim(),
            voltage: form.voltage.trim(),
            power: form.power.trim(),
            intendedUse: form.intendedUse.trim(),

            ...(data.product || {}),
          },
        });
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to connect to the BIS-Copilot backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLEAR FORM
  // =========================================================

  const clearForm = () => {
    setForm({
      productName: "",
      category: "",
      voltage: "",
      power: "",
      intendedUse: "",
    });

    setResult(null);
    setError("");
  };

  // =========================================================
  // EXTRACT BACKEND RESULT
  // =========================================================

  const analysis = result?.analysis || {};
  const standards = result?.standards || [];

  const standard = standards.length > 0
    ? standards[0]
    : null;

  const requirements =
    analysis.requirements ||
    standard?.requirements ||
    [];

  const testingRequirements =
    analysis.testingRequirements ||
    standard?.testingRequirements ||
    [];

  const evidence =
    analysis.evidence ||
    standard?.evidence ||
    [];

  const isMatched =
    standards.length > 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              BIS-Copilot
            </h1>

            <p className="text-xs text-slate-500">
              Product Analyzer
            </p>
          </div>

          <div className="flex gap-4">

            <button className="text-sm font-medium text-blue-700">
              English
            </button>

            <button className="text-sm text-slate-600">
              Telugu
            </button>

          </div>

        </div>

      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-8">

          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            BIS Product Analysis
          </div>

          <h2 className="text-4xl font-bold text-slate-900">
            Analyze Your Product
          </h2>

          <p className="mt-3 max-w-2xl text-lg text-slate-500">
            Enter your product details to identify applicable
            BIS requirements and compliance actions.
          </p>

        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="font-semibold text-red-800">
              ⚠️ Analysis Error
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

          </div>

        )}

        {/* ===================================================
            TWO COLUMN LAYOUT
        =================================================== */}

        <div className="grid gap-8 md:grid-cols-2">

          {/* =================================================
              FORM
          ================================================= */}

          <div className="rounded-3xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-bold">
              Product Details
            </h3>

            <form
              onSubmit={analyzeProduct}
              className="mt-6 space-y-5"
            >

              {/* PRODUCT NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Product Name
                </label>

                <input
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="e.g. Domestic Ceiling Fan"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Electrical"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* VOLTAGE */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Operating Voltage
                </label>

                <input
                  type="text"
                  name="voltage"
                  value={form.voltage}
                  onChange={handleChange}
                  placeholder="e.g. 230 V or N/A"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* POWER */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Power
                </label>

                <input
                  type="text"
                  name="power"
                  value={form.power}
                  onChange={handleChange}
                  placeholder="e.g. 60 W or N/A"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* INTENDED USE */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Intended Use
                </label>

                <textarea
                  name="intendedUse"
                  value={form.intendedUse}
                  onChange={handleChange}
                  placeholder="e.g. Domestic use, construction, industrial use"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading
                    ? "Analyzing..."
                    : "Analyze Product"}
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
                >
                  Clear
                </button>

              </div>

            </form>

          </div>

          {/* =================================================
              RESULT
          ================================================= */}

          <div>

            {/* =================================================
                NO RESULT
            ================================================= */}

            {!result && (

              <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8">

                <div className="text-center">

                  <div className="mx-auto text-5xl">
                    🔍
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    Ready to analyze
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your product details and click
                    "Analyze Product".
                  </p>

                </div>

              </div>

            )}

            {/* =================================================
                RESULT AVAILABLE
            ================================================= */}

            {result && (

              <div className="space-y-5">

                {/* =================================================
                    RESULT HEADER
                ================================================= */}

                <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">

                  <p className="text-sm text-blue-100">
                    Analysis Complete
                  </p>

                  <h3 className="mt-2 text-2xl font-bold">
                    {form.productName}
                  </h3>

                  <p className="mt-2 text-sm text-blue-100">
                    {form.category} · {form.voltage}
                  </p>

                  {/* POWER + INTENDED USE */}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl bg-white/10 p-3">

                      <p className="text-xs text-blue-100">
                        Power
                      </p>

                      <p className="mt-1 font-semibold">
                        {form.power || "N/A"}
                      </p>

                    </div>

                    <div className="rounded-xl bg-white/10 p-3">

                      <p className="text-xs text-blue-100">
                        Intended Use
                      </p>

                      <p className="mt-1 font-semibold">
                        {form.intendedUse || "N/A"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    MATCH STATUS
                ================================================= */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <p className="text-sm font-medium text-slate-500">
                    Product Match
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">

                    {isMatched
                      ? "BIS product record identified"
                      : "No reliable BIS product match"}

                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">

                    {analysis.description ||
                      result.note ||
                      "Verify the applicable BIS requirements using authoritative BIS information."}

                  </p>

                  {analysis.confidence && (

                    <div className="mt-4">

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Confidence: {analysis.confidence}
                      </span>

                    </div>

                  )}

                </div>

                {/* =================================================
                    STANDARD
                ================================================= */}

                {isMatched && (

                  <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <p className="text-sm font-medium text-slate-500">
                      Applicable Standard
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {standard?.standardNumber ||
                        "Standard number unavailable"}
                    </h3>

                    {standard?.title && (

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {standard.title}
                      </p>

                    )}

                    {standard?.applicability && (

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {standard.applicability}
                      </p>

                    )}

                    {standard?.source && (

                      <p className="mt-4 text-xs text-slate-400">
                        Source: {standard.source}
                      </p>

                    )}

                  </div>

                )}

                {/* =================================================
                    KEY REQUIREMENTS
                ================================================= */}

                {isMatched && (

                  <div className="rounded-2xl border bg-white p-6 shadow-sm">

                    <h3 className="text-lg font-bold">
                      Key Requirements
                    </h3>

                    <div className="mt-4 space-y-3">

                      {requirements.length > 0 ? (

                        requirements.map((item, index) => (

                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                          >

                            <span className="font-bold text-blue-600">
                              ✓
                            </span>

                            <p className="text-sm leading-6 text-slate-700">
                              {typeof item === "string"
                                ? item
                                : item.title ||
                                  item.description ||
                                  JSON.stringify(item)}
                            </p>

                          </div>

                        ))

                      ) : (

                        <div className="rounded-xl bg-slate-50 p-4">

                          <p className="text-sm text-slate-600">
                            Verify the applicable BIS standard
                            and product-specific requirements.
                          </p>

                        </div>

                      )}

                    </div>

                  </div>

                )}

                {/* =================================================
                    TESTING REQUIREMENTS
                ================================================= */}

                {isMatched &&
                  testingRequirements.length > 0 && (

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">

                      <h3 className="text-lg font-bold">
                        Testing Requirements
                      </h3>

                      <div className="mt-4 space-y-3">

                        {testingRequirements.map(
                          (item, index) => (

                            <div
                              key={index}
                              className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                            >

                              <span className="font-bold text-blue-600">
                                ✓
                              </span>

                              <p className="text-sm leading-6 text-slate-700">
                                {typeof item === "string"
                                  ? item
                                  : item.title ||
                                    item.description ||
                                    JSON.stringify(item)}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* =================================================
                    EVIDENCE
                ================================================= */}

                {isMatched &&
                  evidence.length > 0 && (

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">

                      <h3 className="text-lg font-bold">
                        Supporting Evidence
                      </h3>

                      <div className="mt-4 space-y-3">

                        {evidence.map(
                          (item, index) => (

                            <div
                              key={index}
                              className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                            >

                              <span className="font-bold text-blue-600">
                                ✓
                              </span>

                              <p className="text-sm text-slate-700">
                                {typeof item === "string"
                                  ? item
                                  : item.title ||
                                    item.description ||
                                    JSON.stringify(item)}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* =================================================
                    CERTIFICATION
                ================================================= */}

                {isMatched &&
                  standard?.certificationInformation && (

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">

                      <p className="text-sm font-medium text-slate-500">
                        Certification Information
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {standard.certificationInformation}
                      </p>

                    </div>

                  )}

                {/* =================================================
                    VERIFY NOTE
                ================================================= */}

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                  <p className="font-semibold text-amber-900">
                    ⚠️ Verification Required
                  </p>

                  <p className="mt-2 text-sm leading-6 text-amber-800">
                    This is a preliminary compliance assessment.
                    Verify the exact applicable BIS standard and
                    current regulatory requirements before relying
                    on the result.
                  </p>

                </div>

                {/* =================================================
                    READINESS BUTTON
                ================================================= */}

                {onGoToReadiness && (

                  <button
                    onClick={onGoToReadiness}
                    className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-md transition hover:bg-blue-700"
                  >
                    Check Compliance Readiness →
                  </button>

                )}

              </div>

            )}

          </div>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t bg-white">

        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-slate-400">
          BIS-Copilot · Intelligent BIS Compliance Assistant
        </div>

      </footer>

    </div>
  );
}

export default ProductAnalyzer;
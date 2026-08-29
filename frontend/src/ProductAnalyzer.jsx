import { useState } from "react";

function ProductAnalyzer({
  onProductAnalyzed,
  onGoToReadiness,
}) {
  const [form, setForm] = useState({
    productName: "",
    category: "",
    voltage: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const analyzeProduct = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

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

      // Send result to App.jsx
      if (onProductAnalyzed) {
        onProductAnalyzed({
          ...data,
          product: {
            productName: form.productName.trim(),
            category: form.category.trim(),
            voltage: form.voltage.trim(),
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

  const clearForm = () => {
    setForm({
      productName: "",
      category: "",
      voltage: "",
    });

    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

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
              తెలుగు
            </button>

          </div>

        </div>

      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* HEADER */}

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

        {/* ERROR */}

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

        <div className="grid gap-8 md:grid-cols-2">

          {/* FORM */}

          <div className="rounded-3xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-bold">
              Product Details
            </h3>

            <form
              onSubmit={analyzeProduct}
              className="mt-6 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Product Name
                </label>

                <input
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="e.g. Domestic Ceiling Fan"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>

                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Electrical Equipment"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Operating Voltage
                </label>

                <input
                  name="voltage"
                  value={form.voltage}
                  onChange={handleChange}
                  placeholder="e.g. 230 V"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div className="flex gap-3">

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {loading
                    ? "Analyzing..."
                    : "Analyze Product"}
                </button>

                <button
                  type="button"
                  onClick={clearForm}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:border-blue-500"
                >
                  Clear
                </button>

              </div>

            </form>

          </div>

          {/* RESULT */}

          <div>

            {!result && (

              <div className="flex min-h-[430px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8">

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

            {result && (

              <div className="space-y-5">

                {/* RESULT HEADER */}

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

                </div>

                {/* STANDARD */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <p className="text-sm font-medium text-slate-500">
                    Applicable Standard
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">

                    {result.standard ||
                      result.standardName ||
                      result.bisStandard ||
                      "BIS standard identified"}

                  </h3>

                  {result.description && (

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {result.description}
                    </p>

                  )}

                </div>

                {/* REQUIREMENTS */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <h3 className="text-lg font-bold">
                    Key Requirements
                  </h3>

                  <div className="mt-4 space-y-3">

                    {(
                      result.requirements ||
                      result.keyRequirements ||
                      [
                        "Verify applicable BIS standard",
                        "Complete required product testing",
                        "Maintain technical documentation",
                        "Collect supporting evidence",
                      ]
                    ).map((item, index) => (

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

                    ))}

                  </div>

                </div>

                {/* READINESS BUTTON */}

                {onGoToReadiness && (

                  <button
                    onClick={onGoToReadiness}
                    className="w-full rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-md hover:bg-blue-700"
                  >
                    Check Compliance Readiness →
                  </button>

                )}

              </div>

            )}

          </div>

        </div>

      </main>

      <footer className="border-t bg-white">

        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-slate-400">
          BIS-Copilot · Intelligent BIS Compliance Assistant
        </div>

      </footer>

    </div>
  );
}

export default ProductAnalyzer;
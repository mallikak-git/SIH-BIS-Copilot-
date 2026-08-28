import { useState } from "react";

function Readiness({ productData }) {
  const [form, setForm] = useState({
    productName: productData?.product?.productName || "",
    category: productData?.product?.category || "",
    voltage: productData?.product?.voltage || "",
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

  const checkReadiness = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (
      !form.productName.trim() ||
      !form.category.trim() ||
      !form.voltage.trim()
    ) {
      setError(
        "Please enter product name, category and operating voltage."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/readiness",
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
          data.message || "Readiness check failed."
        );
      }

      setResult(data);

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const score =
    typeof result?.score === "number"
      ? result.score
      : typeof result?.readinessScore === "number"
      ? result.readinessScore
      : 0;

  const nextActions =
    result?.nextActions ||
    [
      "Verify the applicable BIS standard.",
      "Complete required product testing.",
      "Collect test reports and supporting evidence.",
      "Prepare technical documentation.",
      "Complete final compliance verification.",
    ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}

      <nav className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-2xl font-bold text-blue-700">
              BIS-Copilot
            </h1>

            <p className="text-xs text-slate-500">
              Compliance Readiness
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

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Compliance Readiness
          </div>

          <h2 className="text-4xl font-bold">
            Check Your Readiness
          </h2>

          <p className="mt-3 max-w-2xl text-lg text-slate-500">
            Review your preliminary BIS compliance readiness
            and identify the actions that still need attention.
          </p>

        </div>

        {error && (

          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

            <p className="font-semibold text-red-800">
              ⚠️ Readiness Error
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

          </div>

        )}

        <div className="grid gap-8 lg:grid-cols-5">

          {/* FORM */}

          <section className="lg:col-span-2">

            <div className="rounded-3xl border bg-white p-6 shadow-sm">

              <h3 className="text-xl font-bold">
                Product Information
              </h3>

              <form
                onSubmit={checkReadiness}
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
                    placeholder="Domestic Ceiling Fan"
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
                    placeholder="Electrical Equipment"
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
                    placeholder="230 V"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {loading
                    ? "Checking..."
                    : "Check Readiness"}
                </button>

              </form>

            </div>

          </section>

          {/* RESULT */}

          <section className="lg:col-span-3">

            {!result && !loading && (

              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8">

                <div className="text-center">

                  <div className="text-5xl">
                    📊
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    Readiness Dashboard
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Enter your product details to check
                    compliance readiness.
                  </p>

                </div>

              </div>

            )}

            {loading && (

              <div className="flex min-h-[500px] items-center justify-center rounded-3xl border bg-white">

                <div className="text-center">

                  <div className="text-5xl">
                    📊
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    Checking readiness...
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Reviewing compliance information.
                  </p>

                </div>

              </div>

            )}

            {result && !loading && (

              <div className="space-y-5">

                {/* SCORE */}

                <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white shadow-lg">

                  <div className="flex items-center justify-between gap-6">

                    <div>

                      <p className="text-sm text-blue-100">
                        Overall Compliance Readiness
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        {form.productName}
                      </h3>

                      <p className="mt-2 text-sm text-blue-100">
                        Preliminary assessment
                      </p>

                    </div>

                    <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-white/30 bg-white/10">

                      <span className="text-3xl font-bold">
                        {score}%
                      </span>

                      <span className="text-xs text-blue-100">
                        readiness
                      </span>

                    </div>

                  </div>

                  <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/20">

                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          Math.max(score, 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

                {/* PRODUCT */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <h3 className="text-lg font-bold">
                    Product
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">

                    <Info
                      label="Product"
                      value={form.productName}
                    />

                    <Info
                      label="Category"
                      value={form.category}
                    />

                    <Info
                      label="Voltage"
                      value={form.voltage}
                    />

                  </div>

                </div>

                {/* CHECKLIST */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <h3 className="text-lg font-bold">
                    Compliance Checklist
                  </h3>

                  <div className="mt-5 space-y-3">

                    <Checklist
                      title="Product identified"
                      complete={true}
                    />

                    <Checklist
                      title="Product category identified"
                      complete={true}
                    />

                    <Checklist
                      title="Applicable BIS standard verified"
                      complete={
                        result.standardIdentified === true
                      }
                    />

                    <Checklist
                      title="Required testing completed"
                      complete={
                        result.testingComplete === true
                      }
                    />

                    <Checklist
                      title="Supporting evidence collected"
                      complete={
                        result.evidenceComplete === true
                      }
                    />

                  </div>

                </div>

                {/* NEXT ACTIONS */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">

                  <h3 className="text-lg font-bold">
                    🚀 Next Actions
                  </h3>

                  <div className="mt-5 space-y-3">

                    {nextActions.map((action, index) => (

                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                      >

                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-6 text-slate-700">
                          {typeof action === "string"
                            ? action
                            : action.title ||
                              action.description ||
                              JSON.stringify(action)}
                        </p>

                      </div>

                    ))}

                  </div>

                </div>

                {/* DISCLAIMER */}

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                  <p className="font-semibold text-amber-900">
                    ⚠️ Verification Required
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    This is a preliminary assessment. Always
                    verify the final requirements against the
                    applicable authoritative BIS information.
                  </p>

                </div>

              </div>

            )}

          </section>

        </div>

      </main>

      <footer className="mt-10 border-t bg-white">

        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-400">
          BIS-Copilot · Intelligent BIS Compliance Assistant
        </div>

      </footer>

    </div>
  );
}


/* ================= INFO ================= */

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value || "Not provided"}
      </p>

    </div>
  );
}


/* ================= CHECKLIST ================= */

function Checklist({ title, complete }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">

      <div
        className={
          complete
            ? "flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-bold text-green-700"
            : "flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700"
        }
      >
        {complete ? "✓" : "!"}
      </div>

      <p className="flex-1 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <span
        className={
          complete
            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
            : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
        }
      >
        {complete ? "Complete" : "Pending"}
      </span>

    </div>
  );
}

export default Readiness;
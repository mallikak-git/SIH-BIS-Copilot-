import { useEffect, useState } from "react";

function Evidence({ productData }) {
  const productName =
    productData?.product?.productName ||
    "Your Product";

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvidence();
  }, [productName]);

  const loadEvidence = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/evidence/${encodeURIComponent(
          productName
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load evidence."
        );
      }

      setDocuments(data.evidence || []);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
        "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = async (document) => {
    const newStatus = !document.completed;

    // Optimistic UI update
    setDocuments((previous) =>
      previous.map((item) =>
        item.id === document.id
          ? {
              ...item,
              completed: newStatus,
            }
          : item
      )
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/evidence/${encodeURIComponent(
          productName
        )}/${document.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            completed: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update evidence.");
      }
    } catch (err) {
      console.error(err);

      // Rollback if backend fails
      setDocuments((previous) =>
        previous.map((item) =>
          item.id === document.id
            ? {
                ...item,
                completed: document.completed,
              }
            : item
        )
      );

      setError("Could not save the evidence status.");
    }
  };

  const completedCount = documents.filter(
    (document) => document.completed
  ).length;

  const progress =
    documents.length > 0
      ? Math.round(
          (completedCount / documents.length) * 100
        )
      : 0;

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
              Evidence & Documents
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
            Compliance Evidence
          </div>

          <h2 className="text-4xl font-bold text-slate-900">
            Evidence & Documents
          </h2>

          <p className="mt-3 max-w-2xl text-lg text-slate-500">
            Track the documents, reports and supporting
            evidence required for your compliance journey.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="font-semibold text-red-800">
              ⚠️ {error}
            </p>

          </div>
        )}

        {/* PRODUCT */}

        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white shadow-lg">

          <p className="text-sm text-blue-100">
            Current Product
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            {productName}
          </h3>

          {productData?.product?.category && (
            <p className="mt-2 text-blue-100">
              {productData.product.category}
            </p>
          )}

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="mt-8 rounded-3xl border bg-white p-12 text-center">

            <div className="text-5xl">
              📄
            </div>

            <h3 className="mt-4 text-xl font-bold">
              Loading evidence...
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Fetching your compliance checklist.
            </p>

          </div>

        ) : (

          <>

            {/* PROGRESS */}

            <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="text-xl font-bold">
                    Evidence Progress
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {completedCount} of {documents.length} completed
                  </p>

                </div>

                <div className="text-3xl font-bold text-blue-700">
                  {progress}%
                </div>

              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

            </div>

            {/* DOCUMENTS */}

            <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">

              <h3 className="text-xl font-bold">
                Required Evidence
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Click an item to mark it complete.
              </p>

              <div className="mt-6 space-y-4">

                {documents.map((document) => (

                  <button
                    key={document.id}
                    onClick={() =>
                      toggleDocument(document)
                    }
                    className={
                      document.completed
                        ? "w-full rounded-2xl border border-green-200 bg-green-50 p-5 text-left"
                        : "w-full rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left hover:border-blue-300"
                    }
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className={
                          document.completed
                            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 font-bold text-white"
                            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white"
                        }
                      >
                        {document.completed ? "✓" : ""}
                      </div>

                      <div className="flex-1">

                        <h4 className="font-bold text-slate-900">
                          {document.name}
                        </h4>

                        <div className="mt-2 flex flex-wrap gap-2">

                          <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                            {document.type}
                          </span>

                          {document.required && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Required
                            </span>
                          )}

                        </div>

                      </div>

                      <span
                        className={
                          document.completed
                            ? "rounded-full bg-green-100 px-3 py-2 text-xs font-semibold text-green-700"
                            : "rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700"
                        }
                      >
                        {document.completed
                          ? "Completed"
                          : "Pending"}
                      </span>

                    </div>

                  </button>

                ))}

              </div>

            </div>

            {/* STATUS */}

            <div className="mt-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">

              <h3 className="text-lg font-bold text-blue-900">
                {progress === 100
                  ? "🎉 Evidence Complete"
                  : "🚀 Next Step"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-800">

                {progress === 100
                  ? "All evidence items have been marked complete. Review everything before final submission."
                  : "Complete the remaining evidence items to improve your compliance readiness."}

              </p>

            </div>

            {/* DISCLAIMER */}

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

              <p className="font-semibold text-amber-900">
                ⚠️ Important
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                This checklist is a preliminary project
                implementation. Final requirements should be
                verified against authoritative BIS information.
              </p>

            </div>

          </>

        )}

      </main>

      <footer className="mt-10 border-t bg-white">

        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-slate-400">
          BIS-Copilot · Intelligent BIS Compliance Assistant
        </div>

      </footer>

    </div>
  );
}

export default Evidence;
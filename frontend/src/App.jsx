import { useState } from "react";
import Chat from "./Chat";
import Analyzer from "./ProductAnalyzer";
import Readiness from "./Readiness";
import Evidence from "./Evidence";

function App() {
  const [page, setPage] = useState("home");
  const [productData, setProductData] = useState(null);

  const goHome = () => setPage("home");
  const openChat = () => setPage("chat");
  const openAnalyzer = () => setPage("analyzer");
  const openReadiness = () => setPage("readiness");
  const openEvidence = () => setPage("evidence");

  const handleProductAnalyzed = (data) => {
    setProductData(data);
  };

  /* ================= HOME ================= */

  if (page === "home") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">

        {/* NAVBAR */}
        <nav className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            <button onClick={goHome} className="text-left">
              <h1 className="text-2xl font-bold text-blue-700">
                BIS-Copilot
              </h1>

              <p className="text-xs text-slate-500">
                Compliance made simple
              </p>
            </button>

            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-blue-700">
                English
              </button>

              <button className="text-sm text-slate-600 hover:text-blue-700">
                తెలుగు
              </button>
            </div>

          </div>
        </nav>

        {/* HERO */}

        <main>

          <section className="mx-auto max-w-7xl px-6 py-20">

            <div className="grid items-center gap-12 md:grid-cols-2">

              <div>

                <div className="mb-6 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                  BIS Compliance Assistant
                </div>

                <h2 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                  From Product
                  <span className="text-blue-700">
                    {" "}to Compliance.
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                  Understand which BIS standards apply to your
                  product, discover the required evidence, and
                  follow the right compliance steps.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">

                  <button
                    onClick={openChat}
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-700"
                  >
                    Ask BIS Copilot
                  </button>

                  <button
                    onClick={openAnalyzer}
                    className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-700"
                  >
                    Analyze Product
                  </button>

                </div>

              </div>

              {/* JOURNEY */}

              <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl">

                <p className="text-sm font-medium text-blue-100">
                  Your compliance journey
                </p>

                <h3 className="mt-3 text-3xl font-bold">
                  Product → Standard → Evidence → Action
                </h3>

                <div className="mt-8 space-y-4">

                  <JourneyStep
                    number="01"
                    title="Identify"
                    text="Understand your product and requirements."
                  />

                  <JourneyStep
                    number="02"
                    title="Match"
                    text="Find the relevant BIS standard."
                  />

                  <JourneyStep
                    number="03"
                    title="Verify"
                    text="Inspect supporting evidence and clauses."
                  />

                  <JourneyStep
                    number="04"
                    title="Act"
                    text="Follow the next compliance steps."
                  />

                </div>

              </div>

            </div>

          </section>

          {/* QUICK ACTIONS */}

          <section className="border-t bg-white">

            <div className="mx-auto max-w-7xl px-6 py-16">

              <h3 className="text-2xl font-bold">
                What would you like to do?
              </h3>

              <p className="mt-2 text-slate-500">
                Choose a starting point for your compliance journey.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-4">

                <ActionCard
                  icon="💬"
                  title="Ask BIS Copilot"
                  description="Ask questions about BIS standards and compliance."
                  buttonText="Start conversation →"
                  onClick={openChat}
                />

                <ActionCard
                  icon="🔍"
                  title="Analyze Product"
                  description="Enter your product details to identify relevant standards."
                  buttonText="Analyze product →"
                  onClick={openAnalyzer}
                />

                <ActionCard
                  icon="📊"
                  title="Check Readiness"
                  description="See your compliance progress and next actions."
                  buttonText="View readiness →"
                  onClick={openReadiness}
                />

                <ActionCard
                  icon="📄"
                  title="Evidence"
                  description="Track required documents, reports and supporting evidence."
                  buttonText="View evidence →"
                  onClick={openEvidence}
                />

              </div>

            </div>

          </section>

        </main>

        <footer className="border-t bg-slate-50">

          <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-slate-500">
            BIS-Copilot · Intelligent BIS Compliance Assistant
          </div>

        </footer>

      </div>
    );
  }

  /* ================= CHAT ================= */

  if (page === "chat") {
    return (
      <PageWrapper onHome={goHome}>
        <Chat />
      </PageWrapper>
    );
  }

  /* ================= ANALYZER ================= */

  if (page === "analyzer") {
    return (
      <PageWrapper onHome={goHome}>
        <Analyzer
          onProductAnalyzed={handleProductAnalyzed}
          onGoToReadiness={openReadiness}
        />
      </PageWrapper>
    );
  }

  /* ================= READINESS ================= */

  if (page === "readiness") {
    return (
      <PageWrapper onHome={goHome}>
        <Readiness
          productData={productData}
        />
      </PageWrapper>
    );
  }

  /* ================= EVIDENCE ================= */

  if (page === "evidence") {
    return (
      <PageWrapper onHome={goHome}>
        <Evidence
          productData={productData}
        />
      </PageWrapper>
    );
  }

  return null;
}


/* ================= JOURNEY STEP ================= */

function JourneyStep({ number, title, text }) {
  return (
    <div className="rounded-xl bg-white/10 p-4">

      <p className="font-semibold">
        {number} · {title}
      </p>

      <p className="mt-1 text-sm text-blue-100">
        {text}
      </p>

    </div>
  );
}


/* ================= ACTION CARD ================= */

function ActionCard({
  icon,
  title,
  description,
  buttonText,
  onClick,
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="text-3xl">
        {icon}
      </div>

      <h4 className="mt-4 text-xl font-bold">
        {title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <button
        onClick={onClick}
        className="mt-5 font-semibold text-blue-600 hover:text-blue-800"
      >
        {buttonText}
      </button>

    </div>
  );
}


/* ================= PAGE WRAPPER ================= */

function PageWrapper({ children, onHome }) {
  return (
    <div className="relative">

      <button
        onClick={onHome}
        className="fixed left-5 top-5 z-50 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-md hover:border-blue-500 hover:text-blue-700"
      >
        ← Home
      </button>

      {children}

    </div>
  );
}

export default App;
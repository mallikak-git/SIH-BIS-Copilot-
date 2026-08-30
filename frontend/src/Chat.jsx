import { useState } from "react";

function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! 👋 I'm BIS-Copilot. Tell me about your product and I can help you understand BIS standards, testing, evidence, and compliance steps.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (messageText = input) => {
    const text = String(messageText || "").trim();

    if (!text || loading) return;

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      console.log("FULL CHAT RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message || "Backend error"
        );
      }

      const answer =
        typeof data?.answer === "string"
          ? data.answer
          : typeof data?.reply === "string"
          ? data.reply
          : "I received a response, but there is no answer available.";

      const requirements = Array.isArray(data?.requirements)
        ? data.requirements
        : [];

      const evidence = Array.isArray(data?.evidence)
        ? data.evidence
        : [];

      const testingRequirements = Array.isArray(
        data?.testingRequirements
      )
        ? data.testingRequirements
        : [];

      const confidence =
        typeof data?.confidence === "string"
          ? data.confidence
          : "";

      const product =
        typeof data?.product === "string"
          ? data.product
          : "";

      const category =
        typeof data?.category === "string"
          ? data.category
          : "";

      const standard =
        typeof data?.standard === "string"
          ? data.standard
          : "";

      const standardTitle =
        typeof data?.standardTitle === "string"
          ? data.standardTitle
          : "";

      const certificationInformation =
        typeof data?.certificationInformation === "string"
          ? data.certificationInformation
          : "";

      const source =
        typeof data?.source === "string"
          ? data.source
          : "";

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: answer,
          requirements,
          evidence,
          testingRequirements,
          confidence,
          product,
          category,
          standard,
          standardTitle,
          certificationInformation,
          source,
        },
      ]);
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text:
            "⚠️ Something went wrong while processing your question. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const suggestions = [
    "Which BIS standard applies to a ceiling fan?",
    "What tests are required?",
    "What documents do I need?",
  ];

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
              Compliance Assistant
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

      {/* MAIN */}

      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* HEADER */}

        <div className="mb-8">

          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            BIS Compliance Assistant
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Ask BIS-Copilot
          </h2>

          <p className="mt-2 text-slate-500">
            Ask questions about BIS standards and compliance.
          </p>

        </div>

        {/* MESSAGES */}

        <div className="flex flex-col gap-5">

          {messages.map((message, index) => (

            <div
              key={index}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >

              <div
                className={
                  message.role === "user"
                    ? "max-w-2xl rounded-2xl rounded-tr-sm bg-blue-600 p-5 text-white shadow-sm"
                    : "max-w-2xl rounded-2xl rounded-tl-sm bg-white p-5 shadow-sm"
                }
              >

                {/* ASSISTANT NAME */}

                {message.role === "assistant" && (
                  <p className="font-semibold text-blue-700">
                    BIS-Copilot
                  </p>
                )}

                {/* MAIN ANSWER */}

                <p
                  className={
                    message.role === "assistant"
                      ? "mt-2 whitespace-pre-line leading-7 text-slate-700"
                      : "mt-2 whitespace-pre-line leading-7"
                  }
                >
                  {message.text}
                </p>

                {/* PRODUCT MATCH */}

                {message.role === "assistant" &&
                  message.product && (

                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

                      <p className="text-sm font-bold text-blue-800">
                        Product Match
                      </p>

                      <p className="mt-2 text-sm text-slate-700">
                        {message.product}
                      </p>

                      {message.category && (
                        <p className="mt-1 text-xs text-slate-500">
                          Category: {message.category}
                        </p>
                      )}

                    </div>

                  )}

                {/* BIS STANDARD */}

                {message.role === "assistant" &&
                  message.standard && (

                    <div className="mt-5 rounded-xl border bg-white p-4">

                      <p className="text-sm font-bold text-slate-500">
                        Applicable BIS Standard
                      </p>

                      <h3 className="mt-2 text-xl font-bold text-slate-900">
                        {message.standard}
                      </h3>

                      {message.standardTitle && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {message.standardTitle}
                        </p>
                      )}

                    </div>

                  )}

                {/* REQUIREMENTS */}

                {message.role === "assistant" &&
                  message.requirements?.length > 0 && (

                    <div className="mt-5">

                      <p className="text-sm font-bold text-slate-800">
                        📋 Key Requirements
                      </p>

                      <div className="mt-3 space-y-2">

                        {message.requirements.map(
                          (item, itemIndex) => (

                            <div
                              key={itemIndex}
                              className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                            >
                              <span className="font-bold text-blue-600">
                                ✓
                              </span>{" "}
                              {typeof item === "string"
                                ? item
                                : item?.title ||
                                  item?.description ||
                                  JSON.stringify(item)}
                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* TESTING REQUIREMENTS */}

                {message.role === "assistant" &&
                  message.testingRequirements?.length > 0 && (

                    <div className="mt-5">

                      <p className="text-sm font-bold text-slate-800">
                        🧪 Testing Requirements
                      </p>

                      <div className="mt-3 space-y-2">

                        {message.testingRequirements.map(
                          (item, itemIndex) => (

                            <div
                              key={itemIndex}
                              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
                            >
                              <span className="font-bold">
                                ✓
                              </span>{" "}
                              {typeof item === "string"
                                ? item
                                : item?.title ||
                                  item?.description ||
                                  JSON.stringify(item)}
                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* EVIDENCE */}

                {message.role === "assistant" &&
                  message.evidence?.length > 0 && (

                    <div className="mt-5">

                      <p className="text-sm font-bold text-slate-800">
                        📄 Supporting Evidence
                      </p>

                      <div className="mt-3 space-y-2">

                        {message.evidence.map(
                          (item, itemIndex) => (

                            <div
                              key={itemIndex}
                              className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800"
                            >
                              <span className="font-bold">
                                •
                              </span>{" "}
                              {typeof item === "string"
                                ? item
                                : item?.title ||
                                  item?.description ||
                                  JSON.stringify(item)}
                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* CERTIFICATION */}

                {message.role === "assistant" &&
                  message.certificationInformation && (

                    <div className="mt-5 rounded-xl border bg-slate-50 p-4">

                      <p className="text-sm font-bold text-slate-800">
                        Certification Information
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {message.certificationInformation}
                      </p>

                    </div>

                  )}

                {/* SOURCE */}

                {message.role === "assistant" &&
                  message.source && (

                    <div className="mt-4">

                      <p className="text-xs text-slate-500">
                        Source
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {message.source}
                      </p>

                    </div>

                  )}

                {/* CONFIDENCE */}

                {message.role === "assistant" &&
                  message.confidence && (

                    <div className="mt-5 border-t border-slate-200 pt-3">

                      <span className="text-xs text-slate-500">
                        Confidence:{" "}
                      </span>

                      <span className="text-xs font-semibold text-blue-700">
                        {message.confidence}
                      </span>

                    </div>

                  )}

              </div>

            </div>

          ))}

          {/* LOADING */}

          {loading && (

            <div className="flex justify-start">

              <div className="rounded-2xl rounded-tl-sm bg-white p-5 shadow-sm">

                <p className="font-semibold text-blue-700">
                  BIS-Copilot
                </p>

                <p className="mt-2 text-slate-500">
                  Thinking...
                </p>

              </div>

            </div>

          )}

        </div>

        {/* SUGGESTIONS */}

        <div className="mt-8">

          <p className="mb-3 text-sm font-medium text-slate-500">
            Suggested questions
          </p>

          <div className="flex flex-wrap gap-3">

            {suggestions.map((suggestion) => (

              <button
                key={suggestion}
                onClick={() => sendMessage(suggestion)}
                disabled={loading}
                className="rounded-full border bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {suggestion}
              </button>

            ))}

          </div>

        </div>

        {/* INPUT */}

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm"
        >

          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Ask your question..."
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-3 outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "..." : "Send"}
          </button>

        </form>

        {/* DISCLAIMER */}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">

          <p className="text-sm leading-6 text-amber-800">
            ⚠️ BIS-Copilot provides preliminary compliance
            guidance. Always verify final requirements against
            authoritative BIS information.
          </p>

        </div>

      </main>

      {/* FOOTER */}

      <footer className="border-t bg-white">

        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-slate-400">
          BIS-Copilot · Intelligent BIS Compliance Assistant
        </div>

      </footer>

    </div>
  );
}

export default Chat;
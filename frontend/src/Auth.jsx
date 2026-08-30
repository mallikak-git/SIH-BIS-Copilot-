import { useState } from "react";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/auth/register";

      const body =
        mode === "login"
          ? {
              email: email.trim(),
              password,
            }
          : {
              name: name.trim(),
              email: email.trim(),
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Authentication failed."
        );
      }

      localStorage.setItem("bisToken", data.token);
      localStorage.setItem(
        "bisUser",
        JSON.stringify(data.user)
      );

      if (onLogin) {
        onLogin(data.user);
      }
    } catch (error) {
      console.error("AUTH ERROR:", error);

      setError(
        error.message ||
          "Unable to connect to the BIS-Copilot backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md">

        {/* LOGO */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-blue-700">
            BIS-Copilot
          </h1>

          <p className="mt-2 text-slate-500">
            Intelligent BIS Compliance Assistant
          </p>

        </div>

        {/* CARD */}

        <div className="rounded-3xl border bg-white p-8 shadow-sm">

          {/* TABS */}

          <div className="mb-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={
                mode === "login"
                  ? "rounded-lg bg-white py-2.5 text-sm font-semibold text-blue-700 shadow-sm"
                  : "rounded-lg py-2.5 text-sm font-medium text-slate-500"
              }
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={
                mode === "register"
                  ? "rounded-lg bg-white py-2.5 text-sm font-semibold text-blue-700 shadow-sm"
                  : "rounded-lg py-2.5 text-sm font-medium text-slate-500"
              }
            >
              Create Account
            </button>

          </div>

          <h2 className="text-2xl font-bold text-slate-900">

            {mode === "login"
              ? "Welcome Back"
              : "Create Your Account"}

          </h2>

          <p className="mt-2 text-sm text-slate-500">

            {mode === "login"
              ? "Login to access your BIS-Copilot workspace."
              : "Create an account to save your compliance work."}

          </p>

          {/* ERROR */}

          {error && (

            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>

          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {mode === "register" && (

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />

              </div>

            )}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >

              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}

            </button>

          </form>

        </div>

        {/* FOOTER */}

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">

          BIS-Copilot provides preliminary compliance
          guidance. Always verify final requirements
          against authoritative BIS information.

        </p>

      </div>

    </div>
  );
}

export default Auth;

import { useState } from "react";
import authService from "../../services/auth.service";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await authService.requestPasswordReset({ email });
      setMessage(res.data.message || "If that email exists, a password reset token has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-950">Forgot Password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email to receive password reset instructions.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Email Address
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="name@company.com"
              type="email"
            />
          </label>

          <button
            className="rounded-2xl bg-blue-600 px-6 py-4 text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700"
            disabled={loading}
            type="submit"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

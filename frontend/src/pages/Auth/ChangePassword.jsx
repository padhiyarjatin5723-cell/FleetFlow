import { useState } from "react";
import { useAuth } from "../../context/useAuth";
import authService from "../../services/auth.service";

const ChangePassword = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!user) {
      setError("You must be logged in to change your password.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
      });

      setMessage(res.data.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-950">Change Password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Update your account password.
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
            Current Password
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Current password"
              type="password"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            New Password
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="New password"
              type="password"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Confirm Password
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Confirm new password"
              type="password"
            />
          </label>

          <button
            className="rounded-2xl bg-blue-600 px-6 py-4 text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700"
            disabled={loading}
            type="submit"
          >
            {loading ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

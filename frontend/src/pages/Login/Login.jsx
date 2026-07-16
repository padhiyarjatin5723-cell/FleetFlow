import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../../assets/hero.png";
import { useAuth } from "../../context/useAuth";

const roles = [
  { value: "fleet_manager", label: "Fleet Manager", icon: "assignment_ind" },
  { value: "dispatcher", label: "Dispatcher", icon: "near_me" },
  { value: "safety_officer", label: "Safety Officer", icon: "shield" },
  { value: "financial_analyst", label: "Financial", icon: "account_balance_wallet" },
];

const trustItems = [
  { label: "Secure Login", icon: "verified_user" },
  { label: "Enterprise Ready", icon: "corporate_fare" },
  { label: "Real-Time Tracking", icon: "monitoring" },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "fleet_manager",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-[#151c27]">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="hidden overflow-hidden bg-slate-50 px-8 py-8 lg:flex lg:flex-col xl:px-12">
          <div className="mb-12 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-blue-700">
              FleetFlow
            </span>
          </div>

          <div className="max-w-xl">
            <h1 className="mb-4 text-5xl font-bold tracking-normal text-slate-950">
              Welcome Back
            </h1>
            <p className="max-w-lg text-lg leading-7 text-slate-500">
              Manage your fleet, drivers, trips, maintenance, and logistics from one
              centralized platform. Designed for high-velocity operations and global reach.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-xl shadow-2xl shadow-slate-300/70">
            <img
              src={heroImage}
              alt="Modern fleet logistics dashboard illustration"
              className="h-[280px] w-full object-cover"
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-8">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm font-medium text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-600">
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </aside>

        <main className="flex items-center justify-center bg-[#f9f9ff] px-4 py-8 sm:px-8">
          <div className="absolute left-5 top-5 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <span className="text-xl font-extrabold text-blue-700">FleetFlow</span>
          </div>

          <section className="w-full max-w-[480px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 text-left">
              <h2 className="mb-1 text-2xl font-semibold tracking-normal text-slate-950">
                Sign In
              </h2>
              <p className="text-base text-slate-500">
                Access your logistics control center
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-6 text-left" onSubmit={handleSubmit}>
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Access Role
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => {
                    const checked = formData.role === role.value;

                    return (
                      <label
                        key={role.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                          checked
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          checked={checked}
                          className="sr-only"
                          name="role"
                          onChange={handleChange}
                          type="radio"
                          value={role.value}
                        />
                        <span className="material-symbols-outlined text-[20px]">
                          {role.icon}
                        </span>
                        <span>{role.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                    mail
                  </span>
                  <input
                    autoComplete="email"
                    className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-600" htmlFor="password">
                    Password
                  </label>
                  <button onClick={() => navigate("/forgot-password")} className="text-sm font-medium text-blue-700 hover:underline" type="button">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                    lock
                  </span>
                  <input
                    autoComplete="current-password"
                    className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-700"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-base text-slate-600">
                <input
                  checked={formData.remember}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                  name="remember"
                  onChange={handleChange}
                  type="checkbox"
                />
                Remember this device
              </label>

              <button
                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-xl font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={loading}
                type="submit"
              >
                <span>{loading ? "Authenticating..." : "Sign In"}</span>
                {!loading && (
                  <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
                )}
              </button>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Login;

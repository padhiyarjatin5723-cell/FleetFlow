import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, getRoles } from "../../services/auth.service";

const Register = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        const res = await getRoles();
        if (isMounted) {
          setRoles(res.data.data || []);
          setFormData((prev) => ({
            ...prev,
            roleId: (res.data.data && res.data.data[0]?.id) || "",
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-lg shadow-slate-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-950">Register</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create your FleetFlow account and choose a role.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Full Name
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="John Doe"
                type="text"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Phone
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="9876543210"
                type="tel"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email Address
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="name@company.com"
                type="email"
              />
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Password
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter a strong password"
                type="password"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            Role
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              {loading && <option>Loading roles...</option>}
              {!loading && roles.length === 0 && (
                <option value="">No roles available</option>
              )}
              {!loading && roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <button
            className="rounded-2xl bg-blue-600 px-6 py-4 text-white shadow-md shadow-blue-500/10 transition hover:bg-blue-700"
            disabled={submitting || loading}
            type="submit"
          >
            {submitting ? "Registering…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

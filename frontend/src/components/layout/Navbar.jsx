import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-slate-500">FleetFlow Enterprise</p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal text-slate-950">
          Logistics Operations
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:flex"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          Search
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {user?.fullName?.charAt(0) || "A"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user?.fullName || "Fleet Admin"}
            </p>
            <p className="text-xs text-slate-500">{user?.role?.name || "ADMIN"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;

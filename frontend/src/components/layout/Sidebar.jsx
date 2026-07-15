import { NavLink } from "react-router-dom";

const menus = [
  { name: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { name: "Vehicle Registry", path: "/vehicles", icon: "directions_car" },
  { name: "Driver Management", path: "/drivers", icon: "badge" },
  { name: "Trip Dispatcher", path: "/trips", icon: "near_me" },
  { name: "Maintenance", path: "/maintenance", icon: "build" },
  { name: "Fuel & Expenses", path: "/fuel", icon: "local_gas_station" },
  { name: "Analytics", path: "/analytics", icon: "analytics" },
  { name: "Reports", path: "/reports", icon: "description" },
  { name: "Documents", path: "/documents", icon: "folder" },
  { name: "Notifications", path: "/notifications", icon: "notifications" },
  { name: "Audit Logs", path: "/audit-logs", icon: "history" },
];

const Sidebar = () => {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 bg-[#111827] text-white lg:flex lg:flex-col">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
          <span className="material-symbols-outlined text-[24px]">local_shipping</span>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none tracking-normal text-white">
            FleetFlow
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Logistics Control
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950/30"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span className="material-symbols-outlined text-[21px]">{menu.icon}</span>
            <span>{menu.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">Enterprise Ready</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Live fleet operations, dispatching and compliance.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

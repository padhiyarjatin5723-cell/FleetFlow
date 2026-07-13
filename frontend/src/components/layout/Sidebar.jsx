import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menus = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Vehicles", path: "/vehicles" },
    { name: "Drivers", path: "/drivers" },
    { name: "Trips", path: "/trips" },
    { name: "Maintenance", path: "/maintenance" },
    { name: "Fuel", path: "/fuel" },
    { name: "Expenses", path: "/expenses" },
    { name: "Documents", path: "/documents" },
    { name: "Notifications", path: "/notifications" },
    { name: "Audit Logs", path: "/audit-logs" },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">

      <div className="text-2xl font-bold p-6 border-b border-slate-700">
        FleetFlow
      </div>

      <div className="flex flex-col p-4 gap-2">

        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) =>
              `px-4 py-3 rounded-lg ${
                isActive
                  ? "bg-blue-600"
                  : "hover:bg-slate-700"
              }`
            }
          >
            {menu.name}
          </NavLink>
        ))}

      </div>
    </div>
  );
};

export default Sidebar;
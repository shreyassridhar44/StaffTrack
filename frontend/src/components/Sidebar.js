import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Employee Management", path: "/employees" },
    { label: "Department Management", path: "/departments" },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-50 border-r border-slate-800 p-5 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">StaffTrack</h2>
        <p className="text-xs text-slate-400 mt-1">
          HR analytics & management
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={[
                "block px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;

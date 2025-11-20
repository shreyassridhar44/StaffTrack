import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem("username");
  const company = localStorage.getItem("company_name");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Employees", path: "/employees" },
    { label: "Departments", path: "/departments" },
  ];

  return (
    <div className="h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-slate-900 text-slate-50 border-r border-slate-800">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold shadow-lg">
              ST
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                StaffTrack
              </h1>
              <p className="text-xs text-slate-400">Smart staff analytics</p>
            </div>
          </div>

          {/* User info */}
          {username && (
            <div className="mt-4 rounded-lg bg-slate-800/70 px-3 py-2 text-xs text-slate-300">
              <p className="font-medium text-slate-100 truncate">{username}</p>
              {company && (
                <p className="text-[11px] text-slate-400 truncate">
                  {company}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  isActive
                    ? "bg-slate-800 text-slate-50 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
                ].join(" ")}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 text-sm font-medium text-white py-2.5 transition-colors"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar for mobile + page info */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-slate-50 shadow-sm">
          <div>
            <h1 className="text-base font-semibold">StaffTrack</h1>
            {company && (
              <p className="text-[11px] text-slate-400">{company}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs border border-slate-500 rounded-full px-3 py-1 hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;

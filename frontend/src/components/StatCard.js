import React from "react";

function StatCard({ title, value, subtitle }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-md border border-slate-200 p-5 hover:shadow-lg transition-all">
      
      {/* Accent gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />

      <div className="mt-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>

        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default StatCard;

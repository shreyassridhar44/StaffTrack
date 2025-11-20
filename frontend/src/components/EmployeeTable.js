import React from "react";

function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* Table Head */}
          <thead className="bg-slate-50/70 backdrop-blur-sm">
            <tr className="border-b border-slate-200">
              {["Name", "Email", "Job Title", "Department", "Salary", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-6 text-center text-slate-500 text-sm"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {employee.job_title}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {employee.department_name}
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">
                    ${employee.salary.toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 flex gap-3 text-xs font-medium">
                    <button
                      onClick={() => onEdit(employee)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(employee.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeTable;

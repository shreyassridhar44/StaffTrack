import React, { useState, useEffect } from "react";
import api from "../api/axios";

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/api/departments", { name: newDepartmentName });
      setNewDepartmentName("");
      fetchDepartments();
    } catch (err) {
      console.error("Error adding department:", err);
      alert("Could not add department.");
    }
  };

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Department Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize all departments in your company.
        </p>
        <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
      </div>

      {/* ADD NEW DEPARTMENT CARD */}
      <div className="rounded-2xl p-8 shadow-xl border 
                      bg-[#0F1B33]/80 border-[#1A2A4A] backdrop-blur-xl">

        <h2 className="text-xl font-semibold text-white mb-4">
          Add New Department
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            type="text"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            placeholder="Enter department name"
            className="flex-1 px-4 py-2 rounded-lg 
                       bg-[#0C162C] text-white placeholder-blue-300
                       border border-[#1A2A4A]
                       focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 shadow-md transition"
          >
            Add
          </button>
        </form>
      </div>

      {/* EXISTING DEPARTMENTS */}
      <div className="rounded-2xl overflow-hidden shadow-xl 
                      bg-[#0F1B33]/80 border border-[#1A2A4A] backdrop-blur-xl">

        <h2 className="text-xl font-semibold text-white p-6 border-b border-[#1A2A4A]">
          Existing Departments
        </h2>

        {loading ? (
          <p className="text-blue-200 p-6">Loading…</p>
        ) : error ? (
          <p className="text-red-400 p-6">{error}</p>
        ) : (
          <ul className="divide-y divide-[#1A2A4A]">
            {departments.length === 0 ? (
              <li className="p-4 text-blue-200">No departments found.</li>
            ) : (
              departments.map((dept) => (
                <li
                  key={dept.id}
                  className="p-4 flex justify-between text-blue-100"
                >
                  <span className="font-medium">
                    {dept.name}{" "}
                    <span className="text-blue-300">(ID: {dept.id})</span>
                  </span>

                  <span className="text-sm text-blue-300">
                    Company: {dept.company_name}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DepartmentPage;

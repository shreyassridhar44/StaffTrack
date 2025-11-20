import React, { useState, useEffect } from "react";
import api from "../api/axios";

function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api
        .get("/api/departments")
        .then((response) => setDepartments(response.data))
        .catch((error) => console.error("Error fetching departments:", error));
    }
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const newEmployee = {
      name,
      email,
      job_title: jobTitle,
      salary: parseFloat(salary),
      join_date: joinDate,
      department_id: parseInt(departmentId),
    };

    api
      .post("/api/employees", newEmployee)
      .then(() => {
        onSuccess();
        onClose();
      })
      .catch((error) => {
        alert(error.response?.data?.detail || "Error adding employee.");
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 animate-scaleIn border border-slate-200 relative">

        {/* Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 rounded-t-2xl"></div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Add New Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Job Title</label>
              <input
                className="input-field"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Salary</label>
              <input
                type="number"
                className="input-field"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Join Date</label>
              <input
                type="date"
                className="input-field"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Department</label>
              <select
                className="input-field"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="">Select a department</option>
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Employee
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddEmployeeModal;

import React, { useState, useEffect } from "react";
import api from "../api/axios";
import EmployeeTable from "../components/EmployeeTable";
import AddEmployeeModal from "../components/AddEmployeeModal";
import EditEmployeeModal from "../components/EditEmployeeModal";

const API_URL = "http://127.0.0.1:8000";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/api/employees`);
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddSuccess = () => fetchEmployees();

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => fetchEmployees();

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await api.delete(`/api/employees/${employeeId}`);
      alert("Employee deleted successfully!");
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
      alert("Error deleting employee.");
    }
  };

  return (
    <div className="space-y-10 p-6">

      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Employee Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add, edit, export and manage your employees.
        </p>
        <div className="h-1 w-28 bg-[#1A2A4A] rounded mt-2"></div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2 bg-[#1A2A4A] text-white rounded-lg shadow-md hover:bg-[#0F162D] transition"
        >
          + Add Employee
        </button>

        <a
          href={`${API_URL}/api/employees/export`}
          download="employees.csv"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 bg-[#0F1B33] text-white rounded-lg hover:bg-[#1A2A4A] transition shadow-md"
        >
          Export CSV
        </a>

      </div>

      {/* CONTENT CARD */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-4">

        {loading && (
          <p className="text-sm text-slate-500">Loading employees…</p>
        )}

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && employees.length === 0 && (
          <p className="text-sm text-slate-500">
            No employees found. Start by adding a new employee.
          </p>
        )}

        {!loading && employees.length > 0 && (
          <EmployeeTable
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* ADD EMPLOYEE MODAL */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* EDIT EMPLOYEE MODAL */}
      {selectedEmployee && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSuccess={handleEditSuccess}
          employee={selectedEmployee}
        />
      )}
    </div>
  );
}

export default EmployeePage;

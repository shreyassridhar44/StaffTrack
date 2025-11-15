import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmployeeTable from '../components/EmployeeTable';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';

const API_URL = 'http://127.0.0.1:8000'; // ✅ Fixed URL (no brackets!)

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // --- Fetch Employees ---
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/api/employees`);
      setEmployees(response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // --- Modal Handlers ---
  const handleAddSuccess = () => fetchEmployees();
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };
  const handleEditSuccess = () => fetchEmployees();

  // --- Delete Handler ---
  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await axios.delete(`${API_URL}/api/employees/${employeeId}`);
      alert('Employee deleted successfully!');
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Error deleting employee.');
    }
  };

  // --- Render ---
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <div className="flex gap-2">
          <a
            href={`${API_URL}/api/employees/export`}
            download="employees.csv"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export to CSV
          </a>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add New Employee
          </button>
        </div>
      </div>

      {/* --- Loading & Error States --- */}
      {loading && <p className="text-gray-600">Loading employees...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && employees.length === 0 && (
        <p className="text-gray-500">No employees found.</p>
      )}

      {/* --- Employee Table --- */}
      {!loading && employees.length > 0 && (
        <EmployeeTable
          employees={employees}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* --- Modals --- */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

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

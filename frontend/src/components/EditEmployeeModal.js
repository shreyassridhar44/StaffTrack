import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function EditEmployeeModal({ isOpen, onClose, onSuccess, employee }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${API_URL}/api/departments`)
        .then(response => {
          setDepartments(response.data);
        })
        .catch(error => {
          console.error('Error fetching departments:', error);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setJobTitle(employee.job_title);
      setSalary(employee.salary);
      setJoinDate(employee.join_date); 
      setDepartmentId(employee.department_id);
    }
  }, [employee]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const updatedEmployee = {
      name, email,
      job_title: jobTitle,
      salary: parseFloat(salary),
      join_date: joinDate,
      department_id: parseInt(departmentId),
    };

    axios.put(`${API_URL}/api/employees/${employee.id}`, updatedEmployee)
      .then(response => {
        alert('Employee updated successfully!');
        onSuccess();
        onClose();
      })
      .catch(error => {
        console.error('Error updating employee:', error.response?.data);
        alert('Error updating employee: ' + (error.response?.data?.detail || 'Check console'));
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                     className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                     className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary</label>
              <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
                     className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Join Date</label>
              <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)}
                     className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md" required>
                <option value="">Select a department</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="button" onClick={onClose}
                    className="mr-3 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600">
              Cancel
            </button>
            <button type="submit"
                    className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default EditEmployeeModal;
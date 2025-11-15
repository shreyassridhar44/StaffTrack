import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');

  const fetchDepartments = () => {
    axios.get(`${API_URL}/api/departments`)
      .then(response => {
        setDepartments(response.data);
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.post(`${API_URL}/api/departments`, { name: newDepartmentName })
      .then(response => {
        alert('Department added successfully!');
        setNewDepartmentName('');
        fetchDepartments();
      })
      .catch(error => {
        console.error('Error adding department:', error);
        alert('Error adding department. Check the console.');
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Department Management</h1>
      <div className="mb-6 p-4 bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold mb-3">Add New Department</h2>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            placeholder="Enter department name"
            className="flex-1 p-2 border rounded-l"
            required
          />
          <button type="submit" 
                  className="p-2 bg-blue-600 text-white rounded-r hover:bg-blue-700">
            Add
          </button>
        </form>
      </div>
      <div className="bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold p-4 border-b">Existing Departments</h2>
        <ul className="p-4">
          {departments.map(department => (
            <li key={department.id} className="p-2 border-b last:border-b-0">
              {department.name} (ID: {department.id})
            </li>
          ))}
          {departments.length === 0 && (
            <li className="p-2 text-gray-500">No departments found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
export default DepartmentPage;
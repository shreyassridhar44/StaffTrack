import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">HR Analyzer</h2>
      <nav>
        <ul>
          <li className="mb-3">
            <Link to="/" className="block p-2 rounded hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li className="mb-3">
            <Link to="/employees" className="block p-2 rounded hover:bg-gray-700">
              Employee Management
            </Link>
          </li>
          <li className="mb-3">
            <Link to="/departments" className="block p-2 rounded hover:bg-gray-700">
              Department Management
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
export default Sidebar;
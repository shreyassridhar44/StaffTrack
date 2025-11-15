import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import EmployeePage from './pages/EmployeePage';
import DepartmentPage from './pages/DepartmentPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/departments" element={<DepartmentPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';

const API_URL = 'http://127.0.0.1:8000';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [salaryChart, setSalaryChart] = useState('');
  const [deptChart, setDeptChart] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsRes, salaryChartRes, deptChartRes] = await Promise.all([
          axios.get(`${API_URL}/api/stats/summary`),
          axios.get(`${API_URL}/api/charts/salary_distribution`),
          axios.get(`${API_URL}/api/charts/department_pie`)
        ]);
        
        setStats(statsRes.data);
        setSalaryChart(salaryChartRes.data.image_base64);
        setDeptChart(deptChartRes.data.image_base64);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Ensure the backend is running and data exists.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6"><h1 className="text-3xl font-bold">Loading Dashboard...</h1></div>;
  }
  if (error) {
    return <div className="p-6"><h1 className="text-3xl font-bold text-red-600">{error}</h1></div>;
  }
  if (!stats) {
    return <div className="p-6"><h1 className="text-3xl font-bold">No data found.</h1></div>;
  }

  const formatCurrency = (value) => {
    if (typeof value !== 'number') { value = 0; }
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Employees" value={stats.total_employees} />
        <StatCard title="Average Salary" value={formatCurrency(stats.average_salary)} />
        <StatCard title="Median Salary" value={formatCurrency(stats.median_salary)} />
        <StatCard 
          title="Salary Range" 
          value={`${formatCurrency(stats.min_salary)} - ${formatCurrency(stats.max_salary)}`} 
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Salary Distribution</h2>
          <img src={salaryChart} alt="Salary Distribution" className="w-full" /> 
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Employees by Department</h2>
          <img src={deptChart} alt="Department Distribution" className="w-full" />
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;
import React, { useState, useEffect } from "react";
import api from "../api/axios";

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
          api.get("/api/stats/summary"),
          api.get("/api/charts/salary_distribution"),
          api.get("/api/charts/department_pie")
        ]);

        setStats(statsRes.data);
        setSalaryChart(salaryChartRes.data.image_base64);
        setDeptChart(deptChartRes.data.image_base64);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6"><h1 className="text-3xl font-bold">Loading Dashboard…</h1></div>;
  }

  if (error) {
    return <div className="p-6"><h1 className="text-3xl font-bold text-red-600">{error}</h1></div>;
  }

  if (!stats) {
    return <div className="p-6"><h1 className="text-3xl font-bold">No data found.</h1></div>;
  }

  const formatCurrency = (value) => {
    if (typeof value !== 'number') value = 0;
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="space-y-12 p-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Insight into your workforce and salary data.
        </p>
        <div className="h-1 w-24 bg-blue-600 rounded mt-2"></div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="stat-card">
          <h3 className="stat-title">Total Employees</h3>
          <p className="stat-value">{stats.total_employees}</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-title">Average Salary</h3>
          <p className="stat-value">{formatCurrency(stats.average_salary)}</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-title">Median Salary</h3>
          <p className="stat-value">{formatCurrency(stats.median_salary)}</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-title">Salary Range</h3>
          <p className="stat-value">
            {formatCurrency(stats.min_salary)} – {formatCurrency(stats.max_salary)}
          </p>
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="chart-card relative">
          <h2 className="chart-title">Salary Distribution</h2>
          <img src={salaryChart} alt="Salary Distribution" className="w-full rounded-md" />
        </div>

        <div className="chart-card relative">
          <h2 className="chart-title">Employees by Department</h2>
          <img src={deptChart} alt="Department Distribution" className="w-full rounded-md" />
        </div>

      </div>

    </div>
  );
}

export default DashboardPage;

import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className="stat-number">{value}</p>
    </div>
  </div>
);

const DepartmentStats = ({ departments }) => {
  const navigate = useNavigate();

  const handleDeptClick = (dept) => {
    navigate(`/students?department=${dept}`);
  };

  return (
    <div className="department-stats">
      <h2>Students by Department</h2>
      <div className="department-grid">
        {Object.entries(departments).map(([dept, count], index) => (
          <div key={dept} className="department-card" data-color-index={index % 6} onClick={() => handleDeptClick(dept)}>
            <h3>{dept}</h3>
            <p className="department-count">{count} Students</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardAPI.getStats();
        setStats(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const renderAdminDashboard = () => (
    <>
      <div className="dashboard-cards">
        {stats.total_students !== undefined && (
          <StatCard title="Total Student Details" value={stats.total_students} icon="🎓" color="blue" />
        )}
        {stats.total_rd_entries !== undefined && (
          <StatCard title="R&D Entries" value={stats.total_rd_entries} icon="🔬" color="purple" />
        )}
        {stats.total_ipr_entries !== undefined && (
          <StatCard title="IPR Entries" value={stats.total_ipr_entries} icon="⚖️" color="orange" />
        )}
        {stats.total_staff !== undefined && (
          <StatCard title="Total Staff" value={stats.total_staff} icon="👥" color="green" />
        )}
      </div>
      {stats.students_by_department && (
        <DepartmentStats departments={stats.students_by_department} />
      )}
    </>
  );

  const renderRdStaffDashboard = () => (
    <div className="dashboard-cards">
      {stats.my_rd_entries !== undefined && (
        <StatCard title="My R&D Entries" value={stats.my_rd_entries} icon="🔬" color="purple" />
      )}
      {stats.department_students !== undefined && (
        <StatCard title="Students in My Dept." value={stats.department_students} icon="🎓" color="blue" />
      )}
    </div>
  );

  const renderIprStaffDashboard = () => (
    <div className="dashboard-cards">
      {stats.my_ipr_entries !== undefined && (
        <StatCard title="My IPR Entries" value={stats.my_ipr_entries} icon="⚖️" color="orange" />
      )}
    </div>
  );

  const renderDashboardContent = () => {
    if (loading) {
      return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (!stats || Object.keys(stats).length === 0) {
      return <div className="empty-state"><p>No dashboard information available for your role.</p></div>;
    }

    if (user.role === 'admin') {
      return renderAdminDashboard();
    }
    if (user.role === 'staff' && user.management_group === 'rd') {
      return renderRdStaffDashboard();
    }
    if (user.role === 'staff' && user.management_group === 'ipr') {
      return renderIprStaffDashboard();
    }

    return <div className="empty-state"><p>Welcome to the dashboard.</p></div>;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}! Here's your overview.</p>
      </div>
      <div className="dashboard-content">
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default Dashboard;
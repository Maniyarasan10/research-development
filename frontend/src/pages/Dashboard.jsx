import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { staffDetailsAPI, studentAPI, iprAPI } from '../services/api';
import './Dashboard.css';

const StatCard = ({ title, value, icon, color, to }) => (
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560', '#775DD0', '#546E7A', '#26a69a'];

const CATEGORY_LABELS = {
  journal_publication: 'Journal Publication',
  conference_presentation: 'Conference Presentation',
  books_published: 'Books Published',
  book_chapters: 'Book Chapters',
  consultancy_project: 'Consultancy Project',
  awards_researches: 'Awards & Researches',
  research_funding_project: 'Research Funding',
  certification: 'Certification',
  seminar_workshop_fdp: 'Seminar/Workshop/FDP',
};

const Dashboard = () => {
  const [staffStats, setStaffStats] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [iprCount, setIprCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0); // Moved this line
  const [filterFromYearDate, setFilterFromYearDate] = useState(null);
  const [filterToYearDate, setFilterToYearDate] = useState(null);
  const [filterFromYear, setFilterFromYear] = useState('');
  const [filterToYear, setFilterToYear] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          from_year: filterFromYear,
           filterFromYearDate: filterFromYearDate,
        filterToYearDate: filterToYearDate,
          to_year: filterToYear,
        }

        const [staffResponse, studentResponse, iprResponse] = await Promise.all([
          staffDetailsAPI.getAll(params),
          studentAPI.getAll(params),
          iprAPI.getAll(params),
        ]);

        // Process staff data for pie chart
        const currentYear = new Date().getFullYear();
        const staffCounts = staffResponse.data.reduce((acc, item) => {
          const itemYear = parseInt(item.publication_year, 10);
          if (filterFromYear && itemYear < parseInt(filterFromYear, 10)) return acc;
          if (filterToYear && itemYear > parseInt(filterToYear, 10)) return acc;
          const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
          acc[categoryLabel] = (acc[categoryLabel] || 0) + 1;
          return acc;
        }, {});
        setStaffStats(Object.entries(staffCounts).map(([name, value]) => ({ name, value })));

        // Process student data for pie chart
        // Process student data for pie chart
        const studentCounts = studentResponse.data.reduce((acc, item) => {
          const itemYear = parseInt(item.year.match(/\d+/)?.[0], 10); // Extract year number from "I Year", "II Year"
          if (filterFromYear && itemYear < parseInt(filterFromYear, 10)) return acc;
          if (filterToYear && itemYear > parseInt(filterToYear, 10)) return acc;
          acc[item.department] = (acc[item.department] || 0) + 1;
          return acc;
        }, {});
        setStudentStats(Object.entries(studentCounts).map(([name, value]) => ({ name, value })));
        setTotalStudents(studentResponse.data.filter(item => {
          const itemYear = parseInt(item.year.match(/\d+/)?.[0], 10);
          if (filterFromYear && itemYear < parseInt(filterFromYear, 10)) return false;
          if (filterToYear && itemYear > parseInt(filterToYear, 10)) return false;
          return true;
        }).length);

        // Process IPR data for count
        const iprCounts = iprResponse.data.reduce((acc, item) => {
          const filedYear = parseInt(String(item.filed_date)?.split('-')[0], 10);
          if (filterFromYear && filedYear < parseInt(filterFromYear, 10)) return acc;
          if (filterToYear && filedYear > parseInt(filterToYear, 10)) return acc;
          return acc + 1;
        }, 0);
        setIprCount(iprCounts);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filterFromYear, filterToYear]);

  if (loading) {
    return <div className="loading">Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-filters year-filter-group">
        <DatePicker
              selected={filterFromYearDate}
              onChange={(date) => {
                setFilterFromYearDate(date);
                setFilterFromYear(date ? date.getFullYear() : '');
              }}
              dateFormat="yyyy"
            placeholderText="From Year"
              showYearPicker
              yearItemNumber={9}
            />
            <DatePicker
              selected={filterToYearDate}
               onChange={(date) => {
                setFilterToYearDate(date);
                setFilterToYear(date ? date.getFullYear() : '');
              }}
              dateFormat="yyyy"
            className="filter-select"
              placeholderText="To Year" showYearPicker yearItemNumber={9} />
          {(filterFromYear || filterToYear) && (
            <button className="btn-clear-filter" onClick={() => {
              setFilterFromYear('');
              setFilterToYear('');
            }}>Clear Filter</button>
          )}
        </div>
      </div>
      <div className="stat-cards-grid">
        <div className="chart-card stat-card-blue">
          <h2><Link to="/staff-details">Faculty Details</Link></h2>
          <p>View and manage faculty R&D activities.</p>
          <p>Total Entries: {staffStats.reduce((sum, entry) => sum + entry.value, 0)}</p>
        </div>

        <div className="chart-card stat-card-green">

          <h2><Link to="/students">Student Details</Link></h2>

          <p>Manage student achievements and participation.</p>
          <p>Total Achievements: {totalStudents}</p>
        </div>

        <div className="chart-card stat-card-orange">
          <h2><Link to="/ipr">IPR Details</Link></h2>
          <p>Manage Intellectual Property Rights.</p>
          <p>Total IPR Entries: {iprCount}</p>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Faculty R&D Activities by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={staffStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {staffStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2>Student Achievements by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={studentStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#82ca9d" label>
                {studentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
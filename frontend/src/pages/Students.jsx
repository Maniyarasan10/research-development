// Students.jsx
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DEPARTMENTS } from '../constants';
import { studentAPI, fileAPI } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StudentForm from './StudentForm';
import './Students.css';

const EVENT_NAMES = [
  'Paper Presentation',
  'Project Expo',
  'Hackathon',
  'Coding Contest',
  'Workshop',
  'Seminar',
  'Symposium',
];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Students = () => {
  const query = useQuery();
  const initialDept = query.get('department') || '';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState(initialDept);
  const [showFilters, setShowFilters] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFromYearDate, setFilterFromYearDate] = useState(null);
  const [filterYear, setFilterYear] = useState('');
  const [filterToYearDate, setFilterToYearDate] = useState(null);
  const [filterFromYear, setFilterFromYear] = useState('');
  const [filterToYear, setFilterToYear] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [filterDept, filterEvent, filterStatus, filterFromYear, filterToYear, filterYear]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        department: filterDept,
        event_name: filterEvent,
        status: filterStatus,
        from_year: filterFromYear,
        to_year: filterToYear,
        year: filterYear,
         filterFromYearDate: filterFromYearDate,
        filterToYearDate: filterToYearDate,
      };
      const response = await studentAPI.getAll(params);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await studentAPI.delete(deleteConfirm._id);
      setStudents(students.filter((s) => s._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchStudents();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (e, filename) => {
    e.preventDefault();
    fileAPI.downloadFile(filename);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="students-container">
      <div className="page-header">
        <h1>Student Management</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button className="btn-secondary" onClick={handlePrint}>
            Print
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Student Data
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-section">
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>

          <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
            <option value="">All Events</option>
            {EVENT_NAMES.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Participated">Participated</option>
            <option value="Won">Won</option>
            <option value="Consolation Prize">Consolation Prize</option>
          </select>

          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="">All Years</option>
            <option value="I Year">I Year</option>
            <option value="II Year">II Year</option>
            <option value="III Year">III Year</option>
            <option value="IV Year">IV Year</option>
          </select>

          <div className="year-filter-group">
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
              placeholderText="To Year"
              showYearPicker
              yearItemNumber={9}
            />
          </div>

          {(filterDept || filterEvent || filterStatus || filterFromYear || filterToYear || filterYear) && (
            <button
              className="btn-clear"
              onClick={() => {
                setFilterDept('');
                setFilterEvent('');
                setFilterStatus('');
                setFilterFromYear('');
                setFilterToYear('');
                setFilterFromYearDate(null);
                setFilterToYearDate(null);
                setFilterYear('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      <div className="table-container">
        {students.length === 0 ? (
          <div className="empty-state">
            <p>No students found</p>
          </div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Student Name</th>
                <th>Event Name</th>
                <th>College</th>
                <th>Department</th>
                <th>Year</th>
                <th>Status</th>
                <th>Event Date(s)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student._id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.event_name}</td>
                  <td>{student.college_name}</td>
                  <td>{student.department}</td>
                  <td>{student.year}</td>
                  <td>{student.status}</td>
                  <td>{student.dates?.map(formatDate).join(', ') || 'N/A'}</td>
                  <td>
                    <div className="student-actions">
                      <button className="btn-view" onClick={() => setViewStudent(student)}>View</button>
                      <button className="btn-edit" onClick={() => handleEdit(student)}>Edit</button>
                      <button className="btn-delete" onClick={() => setDeleteConfirm(student)}>Delete</button>
                      {student.file_attachment && (
                        <button className="btn-download" onClick={(e) => handleDownload(e, student.file_attachment)}>
                          Download
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <StudentForm
          student={editingStudent}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title={viewStudent?.event_name || 'Achievement Details'}
        className="modal-lg"
      >
        {viewStudent && (
          <div className="detail-view">
            <table className="detail-view-table">
              <tbody>
                {Object.entries(viewStudent).map(([key, value]) => {
                  if (!['_id', 'created_at', 'updated_at', 'created_by', 'file_attachment', 'dates'].includes(key) && value) {
                    return (
                      <tr key={key}>
                        <td>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                        <td>{String(value)}</td>
                      </tr>
                    );
                  }
                  if (key === 'dates' && Array.isArray(value) && value.length > 0) {
                    return (
                      <tr key={key}>
                        <td>Dates</td>
                        <td>{value.map(formatDate).join(', ')}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>

            <div className="detail-meta" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
              <span>Created by: {viewStudent.created_by}</span>
              <span>Created on: {formatDate(viewStudent.created_at)}</span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
      />

      {/* --- Print-Only Section --- */}
      <div className="print-only">
        <div className="print-header">
          <img src="/logo.png" alt="College Logo" style={{ maxHeight: '50px', marginBottom: '1rem' }} />
          <h2>Student Achievements Report</h2>
          {(filterFromYear || filterToYear) && (
            <p className="print-filter-info">
              <strong>Year Range:</strong>
              {filterFromYear && ` From ${filterFromYear}`}
              {filterToYear && ` To ${filterToYear}`}
            </p>
          )}
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Event Name</th>
              <th>Event Type</th>
              <th>College Name</th>
              <th>Status</th>
              <th>Prize Details</th>
              <th>Event Date(s)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={`print-${student._id}`}>
                <td>{index + 1}</td>
                <td>{student.name || 'N/A'}</td>
                <td>{student.department || 'N/A'}</td>
                <td>{student.year || 'N/A'}</td>
                <td>{student.event_name || 'N/A'}</td>
                <td>{student.event_type || 'N/A'}</td>
                <td>{student.college_name || 'N/A'}</td>
                <td>{student.status || 'N/A'}</td>
                <td>{student.prize_details || 'N/A'}</td>
                <td>{student.dates?.map(formatDate).join(', ') || 'N/A'}</td>
             </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
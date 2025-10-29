// Students.jsx
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DEPARTMENTS } from '../constants';
import { studentAPI, fileAPI } from '../services/api';
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

  useEffect(() => {
    fetchStudents(initialDept);
  }, []);

  const fetchStudents = async (dept = filterDept, event = filterEvent, status = filterStatus) => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll({ department: dept, event_name: event, status: status });
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
    fetchStudents(filterDept, filterEvent, filterStatus);
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
          <select value={filterDept} onChange={(e) => {
            setFilterDept(e.target.value);
            fetchStudents(e.target.value, filterEvent, filterStatus);
          }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>

          <select value={filterEvent} onChange={(e) => {
            setFilterEvent(e.target.value);
            fetchStudents(filterDept, e.target.value, filterStatus);
          }}>
            <option value="">All Events</option>
            {EVENT_NAMES.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>

          <select value={filterStatus} onChange={(e) => {
            setFilterStatus(e.target.value);
            fetchStudents(filterDept, filterEvent, e.target.value);
          }}>
            <option value="">All Statuses</option>
            <option value="Participated">Participated</option>
            <option value="Won">Won</option>
            <option value="Consolation Prize">Consolation Prize</option>
          </select>

          {(filterDept || filterEvent || filterStatus) && (
            <button
              className="btn-clear"
              onClick={() => {
                setFilterDept('');
                setFilterEvent('');
                setFilterStatus('');
                fetchStudents('', '', '');
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
                <th>Student Name</th>
                <th>Event Name</th>
                <th>College</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.event_name}</td>
                  <td>{student.college_name}</td>
                  <td>{student.department}</td>
                  <td>{student.status}</td>
                  <td>
                    <div className="student-actions">
                      <button className="btn-view" onClick={() => setViewStudent(student)}>View</button>
                      <button className="btn-edit" onClick={() => handleEdit(student)}>Edit</button>
                      <button className="btn-delete" onClick={() => setDeleteConfirm(student)}>Delete</button>
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

            {viewStudent.file_attachment && (
              <div className="detail-view-attachment">
                <strong>Attachment:</strong>
                <div className="attachment-actions">
                  <a 
                    href="#" 
                    onClick={(e) => handleDownload(e, viewStudent.file_attachment)} 
                    className="btn-view"
                  >
                    View Document
                  </a>
                  <a 
                    href="#" 
                    onClick={(e) => handleDownload(e, viewStudent.file_attachment)} 
                    className="btn-download">Download Document</a>
                </div>
              </div>
            )}
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
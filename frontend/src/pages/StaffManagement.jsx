// StaffManagement.jsx
import { useState, useEffect } from 'react';
import { staffAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StaffForm from './StaffForm';
import './StaffManagement.css';

const StaffManagement = ({ group }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, [group]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await staffAPI.getAll({ group });
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await staffAPI.delete(deleteConfirm._id);
      setStaff(staff.filter((s) => s._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchStaff();
  };

  const pageTitle = group === 'rd' ? 'R&D Staff Management' : 'IPR Staff Management';

  if (loading) {
    return <div className="loading">Loading staff...</div>;
  }

  return (
    <div className="staff-management-container">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        <button className="btn-primary" onClick={handleAdd}>
          + Add Staff
        </button>
      </div>

      <div className="staff-grid">
        {staff.length === 0 ? (
          <div className="empty-state">
            <p>No staff members found</p>
          </div>
        ) : (
          staff.map((staffMember) => (
            <div key={staffMember._id} className="staff-card">
              <div className="staff-header">
                <h3>{staffMember.name}</h3>
                <span className="staff-badge">{staffMember.role}</span>
              </div>
              <div className="staff-details">
                <p>
                  <strong>Username:</strong> {staffMember.username}
                </p>
                <p>
                  <strong>Department:</strong> {staffMember.department || 'N/A'}
                </p>
              </div>
              <div className="staff-actions">
                <button className="btn-edit" onClick={() => handleEdit(staffMember)}>
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => setDeleteConfirm(staffMember)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
      >
        <StaffForm
          staff={editingStaff}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
          group={group}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This will remove their access to the system.`}
      />
    </div>
  );
};

export default StaffManagement;
import { useState, useEffect } from 'react';
import { achievementsAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import AchievementForm from './AchievementForm';
import './StaffDetails.css'; // Reuse styles

const Achievements = ({ student, isModal = false }) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewAchievement, setViewAchievement] = useState(null);

  useEffect(() => {
    if (student || !isModal) {
      fetchAchievements();
    }
  }, [student]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await achievementsAPI.getAll({ student_name: student?.name });
      setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAchievement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (achievement) => {
    setEditingAchievement(achievement);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await achievementsAPI.delete(deleteConfirm._id);
      setAchievements(achievements.filter((a) => a._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Failed to delete achievement');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchAchievements();
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
    return <div className="loading">Loading achievements...</div>;
  }

  return (
    <div className="staff-details-container">
      <div className="page-header">
        {isModal ? (
          <button className="btn-primary" onClick={handleAdd}>
            + Add Achievement
          </button>
        ) : (
          <h1>Achievements Management</h1>
        )}
      </div>

      <div className="details-list">
        {achievements.length === 0 ? (
          <div className="empty-state">
            <p>No achievements found</p>
          </div>
        ) : (
          achievements.map((achievement) => (
            <div key={achievement._id} className="detail-card">
              <div className="detail-card-body">
                <div className="detail-header">
                  <h3>{achievement.event_name}</h3>
                  <span className="detail-date">{formatDate(achievement.date)}</span>
                </div>
                <p className="detail-content">
                  <strong>Student:</strong> {achievement.student_name} ({achievement.class})
                </p>
                <div className="detail-meta">
                  <span>Created by: {achievement.created_by}</span>
                  {achievement.department && <span>Department: {achievement.department}</span>}
                </div>
                <div className="detail-actions">
                  <button className="btn-view" onClick={() => setViewAchievement(achievement)}>View</button>
                  <button className="btn-edit" onClick={() => handleEdit(achievement)}>Edit</button>
                  <button className="btn-delete" onClick={() => setDeleteConfirm(achievement)}>Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
        className="modal-lg"
      >
        <AchievementForm
          achievement={editingAchievement || { student_name: student?.name, class: student?.year }}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!viewAchievement} onClose={() => setViewAchievement(null)} title={viewAchievement?.event_name || ''}>
        {viewAchievement && (
          <div className="detail-view">
            {Object.entries(viewAchievement).map(([key, value]) =>
              !['_id', 'created_at', 'updated_at', 'file_attachment'].includes(key) && value && (
                <p key={key}>
                  <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}
                </p>
              )
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Achievement"
        message={`Are you sure you want to delete the achievement for "${deleteConfirm?.student_name}" in "${deleteConfirm?.event_name}"?`}
      />
    </div>
  );
};

export default Achievements;
import { useState, useEffect } from 'react';
import { achievementsAPI } from '../services/api';
import { DEPARTMENTS } from '../constants';
import './StaffDetailsForm.css'; // Reuse styles

const AchievementForm = ({ achievement, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    class: '',
    event_name: '',
    department: '',
    section: '',
    event_type: '',
    college_name: '',
    date: '',
    status: '',
    notes: '',
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (achievement) {
      setFormData({
        student_name: achievement.student_name || '',
        class: achievement.class || '',
        event_name: achievement.event_name || '',
        department: achievement.department || '',
        section: achievement.section || '',
        event_type: achievement.event_type || '',
        college_name: achievement.college_name || '',
        date: achievement.date || '',
        status: achievement.status || '',
        notes: achievement.notes || '',
        file: null,
      });
    } else {
      // Reset for new entry
      setFormData({
        student_name: '', class: '', event_name: '', department: '', section: '',
        event_type: '', college_name: '', date: '', status: '', notes: '', file: null,
      });
    }
  }, [achievement]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSubmit = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        dataToSubmit.append(key, formData[key]);
      }
    }

    try {
      if (achievement) {
        await achievementsAPI.update(achievement._id, dataToSubmit);
      } else {
        await achievementsAPI.create(dataToSubmit);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="staff-details-form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-row">
        <div className="form-group"><label>Student Name *</label><input type="text" name="student_name" value={formData.student_name} onChange={handleChange} required disabled={!!achievement?.student_name} /></div>
        <div className="form-group"><label>Class *</label><input type="text" name="class" value={formData.class} onChange={handleChange} required disabled={!!achievement?.class} /></div>
        <div className="form-group"><label>Event Name *</label><input type="text" name="event_name" value={formData.event_name} onChange={handleChange} required /></div>
        <div className="form-group"><label>Department</label>
          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="">Select Department</option>
            {DEPARTMENTS.map(dept => <option key={dept.value} value={dept.value}>{dept.label}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Section</label><input type="text" name="section" value={formData.section} onChange={handleChange} /></div>
        <div className="form-group"><label>Event Type</label><input type="text" name="event_type" value={formData.event_type} onChange={handleChange} placeholder="e.g., Technical, Cultural" /></div>
        <div className="form-group"><label>College Name</label><input type="text" name="college_name" value={formData.college_name} onChange={handleChange} /></div>
        <div className="form-group"><label>Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} /></div>
        <div className="form-group"><label>Status</label><input type="text" name="status" value={formData.status} onChange={handleChange} placeholder="e.g., Winner, Runner-up" /></div>
        <div className="form-group full-width"><label>Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" /></div>
        <div className="form-group full-width">
          <label htmlFor="file">File Attachment</label>
          <input type="file" id="file" name="file" onChange={handleFileChange} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving...' : achievement ? 'Update Achievement' : 'Create Achievement'}
        </button>
      </div>
    </form>
  );
};

export default AchievementForm;
import { useState, useEffect } from 'react';
import { staffAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../constants';
import './StaffForm.css';

const StaffForm = ({ staff, onSuccess, onCancel, group }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    department: '',
    password: '',
    management_group: group || '',
    role: 'staff', // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        username: staff.username || '',
        department: staff.department || '',
        password: '', // Password is not sent from backend, so it's always empty for edit
        management_group: staff.management_group || group,
        role: staff.role || 'staff',
      });
    } else {
      // Reset for new staff
      setFormData({
        name: '', username: '', department: '', password: '',
        management_group: group,
        role: 'staff',
      });
    }
  }, [staff, group]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (staff) {
        // For updates, don't send an empty password unless it's being changed
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await staffAPI.update(staff._id, updateData);
      } else {
        await staffAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="staff-form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <label>Department *</label>
        <select name="department" value={formData.department} onChange={handleChange} required>
          <option value="">Select Department</option>
          {DEPARTMENTS.map(dept => <option key={dept.value} value={dept.value}>{dept.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Username *</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!staff} autoComplete="new-password" />
        {staff && <small>Username cannot be changed.</small>}
      </div>
      <div className="form-group">
        <label>Password {staff ? '(Leave blank to keep current)' : '*'}</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required={!staff} autoComplete="new-password" />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving...' : staff ? 'Update Staff' : 'Create Staff'}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
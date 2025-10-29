// StudentForm.jsx
import { useState, useEffect } from 'react';
import { DEPARTMENTS } from '../constants';
import { studentAPI } from '../services/api';
import './StudentForm.css';

const EVENT_NAMES = [
  'Paper Presentation',
  'Project Expo',
  'Hackathon',
  'Coding Contest',
  'Workshop',
  'Seminar',
  'Symposium',
  'Conference',
  'Other',
];

const StudentForm = ({ student, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    department: '',
    section: '',
    event_name: '',
    event_type: '',
    college_name: '',
    dates: [''],
    status: '',
    notes: '',
    prize_details: '',
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (student) {
      // Only populate fields that are part of the form's state
      const initialData = {};
      for (const key in formData) {
        if (key === 'dates') {
          initialData[key] = Array.isArray(student.dates) && student.dates.length > 0 ? student.dates : (student.date ? [student.date] : ['']);
        } else {
          initialData[key] = student[key] || '';
        }
      }
      // Ensure file is reset since we don't get it from the backend
      initialData.file = null;
      setFormData(initialData);
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dataToSubmit = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        if (key === 'dates') {
          dataToSubmit.append('dates', JSON.stringify(formData.dates.filter(d => d))); // Filter out empty dates
        } else {
          dataToSubmit.append(key, formData[key]);
        }
      }
    }

    try {
      if (student) {
        await studentAPI.update(student._id, dataToSubmit);
      } else {
        await studentAPI.create(dataToSubmit);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'section' ? value.toUpperCase() : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleDateChange = (index, value) => {
    const newDates = [...formData.dates];
    newDates[index] = value;
    setFormData({ ...formData, dates: newDates });
  };

  const addDateField = () => {
    setFormData({ ...formData, dates: [...formData.dates, ''] });
  };

  const removeDateField = (index) => {
    const newDates = [...formData.dates];
    newDates.splice(index, 1);
    // Ensure at least one date field remains
    setFormData({ ...formData, dates: newDates.length > 0 ? newDates : [''] });
  };

  return (
    <form onSubmit={handleSubmit} className="student-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Student Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="department">Department *</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          >
             <option value="">Select Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
         </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="year">Year *</label>
          <select id="year" name="year" value={formData.year} onChange={handleChange} required>
            <option value="">Select Year</option>
            <option value="I Year">I Year</option>
            <option value="II Year">II Year</option>
            <option value="III Year">III Year</option>
            <option value="IV Year">IV Year</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="section">Section</label>
          <input
            type="text"
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="event_name">Event Name *</label>
          <select
            id="event_name"
            name="event_name"
            value={formData.event_name}
            onChange={handleChange}
            required
          >
            <option value="">Select Event</option>
            {EVENT_NAMES.map((event) => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="event_type">Event Type *</label>
          <select id="event_type" name="event_type" value={formData.event_type} onChange={handleChange} required>
            <option value="">Select Type</option>
            <option value="technical">Technical</option>
            <option value="non-technical">Non-technical</option>
          </select>
        </div>
      </div>

      <div className="form-row">
         <div className="form-group">
          <label htmlFor="college_name">College Name *</label>
          <input
            type="text"
            id="college_name"
            name="college_name"
            value={formData.college_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group full-width">
          <label>Event Date(s) *</label>
          {formData.dates.map((date, index) => (
            <div key={index} className="dynamic-field-group">
              <input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(index, e.target.value)}
                required
              />
              {formData.dates.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeDateField(index)}>-</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add" onClick={addDateField}>+ Add Date</button>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} required>
            <option value="">Select Status</option>
            <option value="Participated">Participated</option>
            <option value="Won">1st</option>
            <option value="Won">2nd</option>
            <option value="Won">3rd</option>
            <option value="Consolation Prize">Consolation Prize</option>
          </select>
        </div>
      </div>

      {formData.status === 'Won' && (
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="prize_details">Prize Amount or Products</label>
            <input
              type="text"
              id="prize_details"
              name="prize_details"
              value={formData.prize_details || ''}
              onChange={handleChange}
              placeholder="e.g., 5000 INR or a Memento"
            />
          </div>
        </div>
      )}

      
      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" />
      </div>

      <div className="form-group">
        <label htmlFor="file">File Attachment</label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleFileChange}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving...' : student ? 'Update Entry' : 'Create Entry'}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
import { useState, useEffect } from 'react';
import { iprAPI } from '../services/api';
import { DEPARTMENTS } from '../constants';
import './StaffDetailsForm.css'; // Reuse styles

const IPRForm = ({ ipr, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    application_number: '',
    application_type: '',
    applicants: [{ name: '' }],
    inventors: [{ title: 'Mr', name: '', department: '' }],
    title: '',
    status: '',
    filed_date: '',
    published_date: '',
    grant_date: '',
    file_receipt: null,
    file_published_proof: null,
    file_pattern_journal: null,
    file_certificate: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ipr) {
      setFormData({
        application_number: ipr.application_number || '',
        application_type: ipr.application_type || '',
        applicants: (Array.isArray(ipr.applicants) && ipr.applicants.length > 0)
          ? ipr.applicants
          : (typeof ipr.applicant_name === 'string' ? [{ name: ipr.applicant_name }] : [{ name: '' }]),
        inventors: (Array.isArray(ipr.inventors) && ipr.inventors.length > 0)
          ? ipr.inventors.map(inv => ({ title: 'Mr', ...inv })) // Ensure title exists for old data
          : [{ title: 'Mr', name: '', department: '' }],
        title: ipr.title || '',
        status: ipr.status || '',
        filed_date: ipr.filed_date || '',
        published_date: ipr.published_date || '',
        grant_date: ipr.grant_date || '',
        file_receipt: null,
        file_published_proof: null,
        file_pattern_journal: null,
        file_certificate: null,
      });
    } else {
      // Reset for new entry
      setFormData({
        application_number: '', application_type: '', applicants: [{ name: '' }], 
        inventors: [{ title: 'Mr', name: '', department: '' }], title: '', 
        status: '', filed_date: '', published_date: '', grant_date: '',
        file_receipt: null,
        file_published_proof: null,
        file_pattern_journal: null,
        file_certificate: null,
      });
    }
  }, [ipr]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInventorChange = (index, e) => {
    const newInventors = [...formData.inventors];
    newInventors[index][e.target.name] = e.target.value;
    setFormData({ ...formData, inventors: newInventors });
  };

  const handleApplicantChange = (index, e) => {
    const newApplicants = [...formData.applicants];
    newApplicants[index][e.target.name] = e.target.value;
    setFormData({ ...formData, applicants: newApplicants });
  };

  const handleFileChange = (e, fieldName) => {
    setFormData({ ...formData, [fieldName]: e.target.files[0] });
  };

  const addInventorField = () => {
    setFormData({
      ...formData,
      inventors: [...formData.inventors, { title: 'Mr', name: '', department: '' }],
    });
  };

  const removeInventorField = (index) => {
    const newInventors = [...formData.inventors];
    newInventors.splice(index, 1);
    setFormData({ ...formData, inventors: newInventors.length > 0 ? newInventors : [{ title: 'Mr', name: '', department: '' }] });
  };

  const addApplicantField = () => {
    setFormData({ ...formData, applicants: [...formData.applicants, { name: '' }] });
  };

  const removeApplicantField = (index) => {
    const newApplicants = [...formData.applicants];
    newApplicants.splice(index, 1);
    setFormData({ ...formData, applicants: newApplicants.length > 0 ? newApplicants : [{ name: '' }] });
  };

  const handleSameAsApplicant = () => {
    const validApplicants = formData.applicants.filter(app => app.name && app.name.trim());
    if (validApplicants.length > 0) {
      const newInventors = validApplicants.map(applicant => ({
        title: 'Mr', // Default title
        name: applicant.name,
        department: '', // Default department
      }));
      setFormData({ ...formData, inventors: newInventors });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSubmit = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        if (key === 'inventors') {
          // Serialize inventors array for the backend
          dataToSubmit.append('inventors', JSON.stringify(formData.inventors));
        } else if (key === 'applicants') {
          dataToSubmit.append('applicants', JSON.stringify(formData.applicants));
        } else {
          dataToSubmit.append(key, formData[key]);
        }
      }
    }

    try {
      if (ipr) {
        await iprAPI.update(ipr._id, dataToSubmit);// Update existing IPR
      } else {
        await iprAPI.create(dataToSubmit);
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
      <div className="form-grid">
        <div className="form-group span-2"><label>Patent Application No *</label><input type="text" name="application_number" value={formData.application_number || ''} onChange={handleChange} required /></div>
        <div className="form-group"><label>Application Type *</label>
          <select name="application_type" value={formData.application_type || ''} onChange={handleChange} required>
            <option value="" disabled>Select Type</option><option value="patent">Patent</option><option value="design">Design</option><option value="copyright">Copyright</option>
          </select>
        </div>
        <div className="form-group span-3">
          <label>Applicant(s) *</label>
          {formData.applicants.map((applicant, index) => (
            <div key={index} className="inventor-field-group">
              <input type="text" name="name" value={applicant.name} onChange={(e) => handleApplicantChange(index, e)} required placeholder="Applicant Name" />
              {formData.applicants.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeApplicantField(index)}>-</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add" onClick={addApplicantField}>+ Add Applicant</button>
        </div>
        <div className="form-group span-3">
          <div className="label-with-action">
            <label>Inventors *</label>
            <button type="button" className="btn-link" onClick={handleSameAsApplicant}>Same as applicant</button>
          </div>
          {formData.inventors.map((inventor, index) => (
            <div key={index} className="inventor-field-group">
              <select name="title" value={inventor.title} onChange={(e) => handleInventorChange(index, e)} className="inventor-title">
                <option value="Mr">Mr.</option>
                <option value="Mrs">Mrs.</option>
                <option value="Miss">Miss</option>
                <option value="Dr">Dr.</option>
              </select>
              <input type="text" name="name" value={inventor.name} onChange={(e) => handleInventorChange(index, e)} required placeholder="Inventor Name" />
              <select name="department" value={inventor.department} onChange={(e) => handleInventorChange(index, e)}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => <option key={dept.value} value={dept.value}>{dept.label}</option>)}
              </select>
              {formData.inventors.length > 1 && (
                <button type="button" className="btn-remove" onClick={() => removeInventorField(index)}>-</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-add" onClick={addInventorField}>+ Add Inventor</button>
        </div>
        <div className="form-group span-3"><label>Title *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
        <div className="form-group"><label>Status *</label><select name="status" value={formData.status || ''} onChange={handleChange} required><option value="" disabled>Select Status</option><option value="filed">Filed</option><option value="published">Published</option><option value="granted">Granted</option></select></div>
        <div className="form-group"><label>Filed Date</label><input type="date" name="filed_date" value={formData.filed_date || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Published Date</label><input type="date" name="published_date" value={formData.published_date || ''} onChange={handleChange} /></div>
        <div className="form-group"><label>Grant Date</label><input type="date" name="grant_date" value={formData.grant_date || ''} onChange={handleChange} /></div>
        <div className="form-group span-3 file-upload-group">
          <label htmlFor="file_receipt">PDF File Receipt *</label>
          <input type="file" id="file_receipt" name="file_receipt" onChange={(e) => handleFileChange(e, 'file_receipt')} required={!ipr} accept=".pdf" />
        </div>
        <div className="form-group span-3 file-upload-group">
          <label htmlFor="file_published_proof">Published Proof</label>
          <input type="file" id="file_published_proof" name="file_published_proof" onChange={(e) => handleFileChange(e, 'file_published_proof')} accept=".pdf" />
        </div>
        <div className="form-group span-3 file-upload-group">
          <label htmlFor="file_pattern_journal">Pattern Journal</label>
          <input type="file" id="file_pattern_journal" name="file_pattern_journal" onChange={(e) => handleFileChange(e, 'file_pattern_journal')} accept=".pdf" />
        </div>
        <div className="form-group span-3 file-upload-group">
          <label htmlFor="file_certificate">Certificate</label>
          <input type="file" id="file_certificate" name="file_certificate" onChange={(e) => handleFileChange(e, 'file_certificate')} accept=".pdf" />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Saving...' : ipr ? 'Update IPR' : 'Create IPR'}
        </button>
      </div>
    </form>
  );
};

export default IPRForm;
// src/pages/IPRPage.jsx
import { useState, useEffect } from 'react';
import { iprAPI, fileAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import IPRForm from './IPRForm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

const IPRPage = () => {
  const [iprList, setIprList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFromYearDate, setFilterFromYearDate] = useState(null);
  const [filterToYearDate, setFilterToYearDate] = useState(null);
  const [filterFromYear, setFilterFromYear] = useState('');
  const [filterToYear, setFilterToYear] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Moved this line
  const [editingIpr, setEditingIpr] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewIpr, setViewIpr] = useState(null);

  useEffect(() => {
    fetchIpr();
  }, [searchTerm, filterType, filterStatus, filterFromYear, filterToYear]); // Auto-fetch on filter change

  const fetchIpr = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        application_type: filterType,
        status: filterStatus,
        from_year: filterFromYear,
        to_year: filterToYear,
        filterFromYearDate: filterFromYearDate,
        filterToYearDate: filterToYearDate,
      };
      const response = await iprAPI.getAll(params);
      setIprList(response.data);
    } catch (error) {
      console.error('Error fetching IPR list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get the first available file attachment for display in the table
  const getFirstAttachment = (ipr) => {
    if (ipr.file_receipt) return ipr.file_receipt;
    if (ipr.file_published_proof) return ipr.file_published_proof;
    if (ipr.file_pattern_journal) return ipr.file_pattern_journal;
    if (ipr.file_certificate) return ipr.file_certificate;
    return null;
  };
  const handleAdd = () => {
    setEditingIpr(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ipr) => {
    setEditingIpr(ipr);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await iprAPI.delete(deleteConfirm._id);
      setIprList(iprList.filter((d) => d._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting IPR:', error);
      alert('Failed to delete IPR entry');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchIpr();
  };

  const handleSearch = () => {
    fetchIpr();
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
    return <div className="loading">Loading IPR entries...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="staff-details-container">
        <div className="page-header">
          <h1>IPR Management</h1>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button className="btn-secondary" onClick={handlePrint}>
              Print
            </button>
            <button className="btn-primary" onClick={handleAdd}>
              + Add IPR
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by title, applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="patent">Patent</option>
              <option value="design">Design</option>
              <option value="copyright">Copyright</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="filed">Filed</option>
              <option value="published">Published</option>
              <option value="granted">Granted</option>
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
              showYearPicker yearItemNumber={9} /></div>
            {(searchTerm || filterType || filterStatus || filterFromYear || filterToYear) && (
               <button
                className="btn-clear"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                  setFilterFromYearDate(null);
                  setFilterToYearDate(null);
                  setFilterFromYear('');
                  setFilterToYear('');
                }}
              >Clear Filters</button>
            )}
          </div>
        )}

      <div className="table-container">
        {iprList.length === 0 ? (
          <div className="empty-state">
            <p>No IPR entries found</p>
          </div>
        ) : (
          <table className="details-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Title</th>
                <th>Application No</th>
                <th>Applicants</th>
                <th>Inventors</th>
                <th>Type</th>
                <th>Status</th>
                <th>Filed Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {iprList.map((ipr, index) => (
                <tr key={ipr._id}>
                  <td>{index + 1}</td>
                  <td>{ipr.title}</td>
                  <td>{ipr.application_number || 'N/A'}</td>
                  <td className="cell-list">
                    {ipr.applicants?.map((app, index) => (
                      <div key={index}>{app.name}</div>
                    ))}
                  </td>
                  <td className="cell-list">
                    {ipr.inventors?.map((inv, index) => (
                      <div key={index}>{inv.name}</div>
                    ))}
                  </td>
                  <td>{ipr.application_type}</td>
                  <td>{ipr.status}</td>
                  <td>{formatDate(ipr.filed_date)}</td>
                  <td>
                    <div className="detail-actions">
                      <button className="btn-view" onClick={() => setViewIpr(ipr)}>
                        View
                      </button>
                      <button className="btn-edit" onClick={() => handleEdit(ipr)}>
                        Edit
                      </button>
                      <button className="btn-delete" onClick={() => setDeleteConfirm(ipr)}>
                        Delete
                      </button>
                      {getFirstAttachment(ipr) && (
                        <button className="btn-download" onClick={(e) => handleDownload(e, getFirstAttachment(ipr))}>
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
        title={editingIpr ? 'Edit IPR' : 'Add New IPR'}
        className="modal-lg"
      >
        <IPRForm
          ipr={editingIpr}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!viewIpr}
        onClose={() => setViewIpr(null)}
        title={viewIpr?.title || ''}
      >
        {viewIpr && (
          <div className="detail-view">
            <div className="detail-view-meta">
              <span className={`category-badge ipr`}>
                IPR
              </span>
              <span className="detail-date">
                {formatDate(viewIpr.created_at)}
              </span>
            </div>
            <div className="detail-view-content">
              {viewIpr.application_number && <p><strong>Application Number:</strong> {viewIpr.application_number}</p>}
              {viewIpr.application_type && <p><strong>Application Type:</strong> {viewIpr.application_type}</p>}
              {viewIpr.title && <p><strong>Title:</strong> {viewIpr.title}</p>}
              {viewIpr.applicants && Array.isArray(viewIpr.applicants) && viewIpr.applicants.length > 0 && (
                <div className="detail-list-group">
                  <strong>Applicants:</strong>
                  <ul>{viewIpr.applicants.map((app, idx) => <li key={idx}>{app.name}</li>)}</ul>
                </div>
              )}
              {viewIpr.inventors && Array.isArray(viewIpr.inventors) && viewIpr.inventors.length > 0 && (
                <div className="detail-list-group">
                  <strong>Inventors:</strong>
                  <ul>
                    {viewIpr.inventors.map((inv, idx) => (
                      <li key={idx}>{inv.title}. {inv.name}{inv.department && ` (${inv.department})`}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewIpr.department && <p><strong>Department:</strong> {viewIpr.department}</p>}
              {viewIpr.status && <p><strong>Status:</strong> {viewIpr.status}</p>}
              {viewIpr.filed_date && <p><strong>Filed Date:</strong> {formatDate(viewIpr.filed_date)}</p>}
              {viewIpr.published_date && <p><strong>Published Date:</strong> {formatDate(viewIpr.published_date)}</p>}
              {viewIpr.grant_date && <p><strong>Grant Date:</strong> {formatDate(viewIpr.grant_date)}</p>}
            </div>
            {viewIpr.file_attachment && (
              <div className="detail-view-attachment">
              <strong>Attachments:</strong>
              <div className="attachment-actions">
                {viewIpr.file_receipt && <a href="#" onClick={(e) => handleDownload(e, viewIpr.file_receipt)} className="btn-download">Receipt</a>}
                {viewIpr.file_published_proof && <a href="#" onClick={(e) => handleDownload(e, viewIpr.file_published_proof)} className="btn-download">Published Proof</a>}
                {viewIpr.file_pattern_journal && <a href="#" onClick={(e) => handleDownload(e, viewIpr.file_pattern_journal)} className="btn-download">Pattern Journal</a>}
                {viewIpr.file_certificate && <a href="#" onClick={(e) => handleDownload(e, viewIpr.file_certificate)} className="btn-download">Certificate</a>}
                {!viewIpr.file_receipt && !viewIpr.file_published_proof && !viewIpr.file_pattern_journal && !viewIpr.file_certificate && (
                  <p>No documents attached.</p>
                )}
                  {/* The view button can also use the same logic or be removed if download is sufficient */}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete IPR Entry"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
      />

      {/* --- Print-Only Section --- */}
      <div className="print-only">
        <div className="print-header">
          <img src="/logo.png" alt="College Logo" style={{ maxHeight: '50px', marginBottom: '1rem' }} />
          <h2>IPR Details Report</h2>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Title</th>
              <th>Application No</th>
              <th>Applicants</th>
              <th>Inventors</th>
              <th>Type</th>
              <th>Status</th>
              <th>Filed Date</th>
              <th>Published Date</th>
              <th>Grant Date</th>
            </tr>
          </thead>
          <tbody>
            {iprList.map((ipr, index) => (
              <tr key={`print-${ipr._id}`}>
                <td>{index + 1}</td>
                <td>{ipr.title || 'N/A'}</td>
                <td>{ipr.application_number || 'N/A'}</td>
                <td className="print-cell-list">
                  {ipr.applicants?.map((app, idx) => (
                    <div key={idx}>{app.name}</div>
                  )) || 'N/A'}
                </td>
                <td className="print-cell-list">
                  {ipr.inventors?.filter(inv => inv.name && inv.name.trim() !== '').map((inv, idx) => (
                    <div key={idx}>{inv.title}. {inv.name}</div>
                  )) || 'N/A'}
                </td>
                <td>{ipr.application_type || 'N/A'}</td>
                <td>{ipr.status || 'N/A'}</td>
                <td>{formatDate(ipr.filed_date)}</td>
                <td>{formatDate(ipr.published_date)}</td>
                <td>{formatDate(ipr.grant_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default IPRPage;
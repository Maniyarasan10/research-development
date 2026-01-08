// StaffDetails.jsx
import { useState, useEffect } from 'react';
import { useNavbarAction } from '../context/NavbarActionContext';
import { staffDetailsAPI, fileAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StaffDetailsForm from './StaffDetailsForm';
import './StaffDetails.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CATEGORIES = [
  { value: 'journal_publication', label: 'Journal Publication', icon: '🔬' },
  { value: 'conference_presentation', label: 'Conference Presentation', icon: '🎤' },
  { value: 'books_published', label: 'Books Published', icon: '📚' },
  { value: 'book_chapters', label: 'Book Chapters', icon: '📖' },
  { value: 'consultancy_project', label: 'Consultancy Project', icon: '💼' },
  { value: 'awards_researches', label: 'Awards & Researches', icon: '🏆' },
  { value: 'research_funding_project', label: 'Research Funding Project', icon: '💰' },
  { value: 'certification', label: 'Certification', icon: '📜' },
  { value: 'seminar_workshop_fdp', label: 'Seminar/Workshop/FDP', icon: '🧑‍🏫' },
];

const TABLE_CONFIG = {
  journal_publication: {
    columns: [
      { header: ' Title of the Paper', accessor: 'paper_title', wrap: true },
      { header: 'Journal Name', accessor: 'journal_name', wrap: true },
      { header: 'Journal Type', accessor: 'journal_type' },
      { header: 'Indexed In', accessor: 'indexed_in' },
      { header: 'ISSN', accessor: 'issn' },
      { header: 'Year', accessor: 'publication_year' },
    ],
  },
  conference_presentation: {
    columns: [
      { header: 'Title of Paper', accessor: 'paper_title', wrap: true },
      { header: 'Conference Name', accessor: 'conference_name', wrap: true },
      { header: 'Organizer', accessor: 'organizer' },
      { header: 'National/International', accessor: 'journal_type' },
      { header: 'Mode', accessor: 'mode' },
      { header: 'Date', accessor: 'publication_date', isDate: true },
      { header: 'Status', accessor: 'status' },
    ],
  },
  books_published: {
    columns: [
      { header: 'Book Title', accessor: 'book_title', wrap: true },
      { header: 'Author(s)', accessor: 'authors', wrap: true },
      { header: 'Publisher', accessor: 'publisher' },
      { header: 'Year', accessor: 'publication_year' },
      { header: 'ISBN', accessor: 'isbn' },
    ],
  },
  book_chapters: {
    columns: [
      { header: 'Chapter Title', accessor: 'title', wrap: true },
      { header: 'Book Title', accessor: 'book_title', wrap: true },
      { header: 'Publisher', accessor: 'publisher' },
      { header: 'Authors', accessor: 'authors', wrap: true },
      { header: 'Year', accessor: 'publication_year' },
      { header: 'ISBN', accessor: 'isbn' },
    ],
  },
  consultancy_project: {
    columns: [
      { header: 'Project Title', accessor: 'title', wrap: true },
      { header: 'Agency Name', accessor: 'client', wrap: true },
      { header: 'Consultancy Type', accessor: 'consultancy_type' },
      { header: 'Amount (INR)', accessor: 'amount' },
      { header: 'Duration', accessor: 'duration' },
      { header: 'Verification', accessor: 'verification' },
    ],
  },
  awards_researches: {
    columns: [
      { header: 'Award/Research Name', accessor: 'title', wrap: true },
      { header: 'Faculty Name', accessor: 'faculty_name', wrap: true }, // Moved this line
      { header: 'Awarding Body', accessor: 'awarding_body', wrap: true },
      { header: 'Year', accessor: 'publication_year' },
    ],
  },
  research_funding_project: {
    columns: [
      { header: 'Project Title', accessor: 'title', wrap: true },
      { header: 'Funding Agency', accessor: 'funding_agency', wrap: true },
      { header: 'Amount (INR)', accessor: 'amount' },
      { header: 'Duration', accessor: 'duration' },
      { header: 'Status', accessor: 'status' },
    ],
  },
  certification: {
    columns: [
      { header: 'Certification Name', accessor: 'title', wrap: true },
      { header: 'Issuing Organization', accessor: 'issuing_organization', wrap: true },
      { header: 'Date Obtained', accessor: 'date_obtained', isDate: true },
      { header: 'Credential ID', accessor: 'credential_id' },
    ],
  },
  seminar_workshop_fdp: {
    columns: [
      { header: 'Program Title', accessor: 'title', wrap: true },
      { header: 'Type', accessor: 'program_type' },
      { header: 'Organizer', accessor: 'organizer', wrap: true },
      { header: 'Start Date', accessor: 'start_date', isDate: true },
      { header: 'End Date', accessor: 'end_date', isDate: true },
    ],
  },
};

const StaffDetails = () => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFromYearDate, setFilterFromYearDate] = useState(null);
  const [filterToYearDate, setFilterToYearDate] = useState(null);
  const [filterFromYear, setFilterFromYear] = useState('');
  const [filterToYear, setFilterToYear] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);
  const { setAction } = useNavbarAction();

  useEffect(() => {
    if (selectedCategory) {
      fetchDetails();
    }
  }, [selectedCategory, searchTerm, filterFromYear, filterToYear, filterFromYearDate, filterToYearDate]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Effect to manage the navbar action button
  useEffect(() => {
    if (selectedCategory) {
      setAction(
        <button className="btn-back" onClick={() => setSelectedCategory(null)}>
          ← Back to Categories
        </button>
      );
    } else {
      setAction(null); // Clear the button when no category is selected
    }

    // Cleanup on unmount
    return () => {
      setAction(null);
    };
  }, [selectedCategory, setAction]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory,
        search: searchTerm,
        from_year: filterFromYear,
        filterFromYearDate: filterFromYearDate,
        filterToYearDate: filterToYearDate,
        to_year: filterToYear,
      };
      const response = await staffDetailsAPI.getAll(params);
      setDetails(response.data);
    } catch (error) {
      console.error('Error fetching staff details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDetail(null);
    setIsModalOpen(true);
  };

  const handleEdit = (detail) => {
    setEditingDetail(detail);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await staffDetailsAPI.delete(deleteConfirm._id);
      setDetails(details.filter((d) => d._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting detail:', error);
      alert('Failed to delete staff detail');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchDetails();
  };

  const handleCategorySelect = (categoryValue) => {
    setSelectedCategory(categoryValue);
  };

  const handleSearch = () => {
    fetchDetails();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (e, filename) => {
    e.preventDefault();
    fileAPI.downloadFile(filename);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderCategorySelection = () => (
    <>
      <div className="page-header"><h1>Faculty R&D Details</h1></div>
      <div className="category-grid">
        {CATEGORIES.map(cat => (
          <div key={cat.value} className="category-card" onClick={() => handleCategorySelect(cat.value)}>
            <div className="category-icon">{cat.icon}</div>
            <h3>{cat.label}</h3>
            <p>View and manage {cat.label.toLowerCase()} entries.</p>
          </div>
        ))}
      </div>
    </>
  );

  const renderCategoryDetails = () => {
    const categoryConfig = TABLE_CONFIG[selectedCategory];
    const categoryLabel = CATEGORIES.find(c => c.value === selectedCategory)?.label;

    if (loading) return <div className="loading">Loading {categoryLabel}...</div>;

    return (
      <>
        <div className="page-header">
          <div style={{ flexGrow: 1 }}>
            <h1>{categoryLabel}</h1>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button className="btn-secondary" onClick={handlePrint}>Print</button>
            <button className="btn-primary" onClick={handleAdd}>+ Add Entry</button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search within this category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
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
            {(searchTerm || filterFromYear || filterToYear) && (
              <button className="btn-clear" onClick={() => {
                setSearchTerm('');
                setFilterFromYear('');
                setFilterToYear('');
              }}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="table-container">
          {details.length === 0 ? (
            <div className="empty-state"><p>No entries found for this category.</p></div>
          ) : (
            <table className="details-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  {categoryConfig.columns.map(col => <th key={col.accessor}>{col.header}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail, index) => (
                  <tr key={detail._id}>
                    <td>{index + 1}</td>
                    {categoryConfig.columns.map((col) => (
                      <td key={col.accessor} className={col.wrap ? 'cell-wrap' : ''}>
                        {col.accessor === 'authors' && Array.isArray(detail.authors) ? (
                          // Render array of authors for book chapters
                          detail.authors.map((author, authorIndex) => (
                            <div key={authorIndex} className="author-item">
                              {author.name}
                            </div>
                          ))
                        ) : col.accessor === 'authors' && typeof detail.authors === 'string' ? (
                          // Render comma-separated string for other categories (e.g., books_published)
                          detail.authors.split(',').map((author, authorIndex) => (
                            <div key={authorIndex} className="author-item">
                              {author.trim()}
                            </div>
                          ))
                        ) : (
                          col.isDate ? formatDate(detail[col.accessor]) : (detail[col.accessor] || 'N/A')
                      )}
                      </td>
                    ))}
                    <td>
                      <div className="detail-actions">
                        <button className="btn-view" onClick={() => setViewingDetail(detail)}>
                          View 
                        </button>
                        <button className="btn-edit" onClick={() => handleEdit(detail)}>Edit</button>
                        <button className="btn-delete" onClick={() => setDeleteConfirm(detail)}>Delete</button>
                        {detail.file_attachment && (
                          <button className="btn-download" onClick={(e) => handleDownload(e, detail.file_attachment)}>
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

        {/* Print-only section for the detailed table */}

        <div className="print-only">
          <div className="print-header">
            <img src="/logo.png" alt="College Logo" style={{ maxHeight: '50px', marginBottom: '1rem' }} />
            <h2>{categoryLabel} Report</h2>
          </div>
          <table className="print-table">
            <thead>
              <tr>
                <th>S.No</th>
                {categoryConfig.columns.map(col => <th key={`print-h-${col.accessor}`}>{col.header}</th>)}
              </tr>

            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={`print-r-${detail._id}`}><td>{index + 1}</td>
                  {categoryConfig.columns.map(col => (
                    <td key={`print-c-${col.accessor}`}>
                      {col.accessor === 'authors' && Array.isArray(detail.authors) ? (
                        // Render array of authors for book chapters in print
                        detail.authors.map((author, authorIndex) => (
                          <div key={authorIndex}>{author.name}</div>
                        ))
                      ) : col.accessor === 'authors' && typeof detail.authors === 'string' ? (
                        // Render comma-separated string for other categories in print
                        detail.authors.split(',').map((author, authorIndex) => (
                          <div key={authorIndex}>{author.trim()}</div>
                        ))
                      ) : col.isDate ? (
                        formatDate(detail[col.accessor])
                      ) : (
                        (detail[col.accessor] || 'N/A')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="staff-details-container">
      {selectedCategory ? renderCategoryDetails() : renderCategorySelection()}
      
      <Modal
        isOpen={!!viewingDetail}
        onClose={() => setViewingDetail(null)}
        title={viewingDetail?.title || 'Details'}
        className="modal-lg"
      >
        {viewingDetail && (
          <div className="detail-view">
            <table className="detail-view-table">
              <tbody>
                {Object.entries(viewingDetail).map(([key, value]) => {
                  if (!['_id', 'created_at', 'updated_at', 'created_by', 'file_attachment', 'proofs'].includes(key) && value) {
                    return (
                      <tr key={key}>
                        <td>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                        <td>{String(value)}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>

            {viewingDetail.file_attachment && (
              <div className="detail-view-attachment">
                <strong>Attachment:</strong>
                <div className="attachment-actions">
                  <a 
                    href="#" 
                    onClick={(e) => handleDownload(e, viewingDetail.file_attachment)} 
                    className="btn-download">Download Document</a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}

        title={editingDetail ? `Edit ${CATEGORIES.find(c => c.value === selectedCategory)?.label}` : `Add New ${CATEGORIES.find(c => c.value === selectedCategory)?.label}`}
        className="modal-lg"
      >
        <StaffDetailsForm
          detail={editingDetail}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsModalOpen(false)}
          forceCategory={selectedCategory}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
          title="Delete Entry"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"?`}
      />
    </div>
  );
};

export default StaffDetails;
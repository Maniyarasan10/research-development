// StaffDetailsForm.jsx
import { useState, useEffect } from 'react';
import { DEPARTMENTS } from '../constants';
import { staffDetailsAPI } from '../services/api';
import './StaffDetailsForm.css';

const StaffDetailsForm = ({ detail, onSuccess, onCancel, forceCategory }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    
    // Specific fields
    authors: '',
    paper_title: '',
    journal_type: 'national', // national / international
    indexed_in: '', // scopus, wos, etc.
    issn: '',
    publication_year: '',
    publication_date: '',
    journal_name: '',
    conference_name: '',
    publisher: '',
    isbn: '',
    book_title: '',
    application_number: '',
    application_type: '',
    applicant_name: '',
    inventors: '',
    status: '',
    client: '',
    consultancy_type: '',
    amount: '',
    duration: '',
    awarding_body: '',
    description: '',
    organizer: '',
    mode: '',
    proof_type: '',
    proofs: {
      certificate_of_presentation: false,
      abstract_copy: false,
      conference_brochure: false,
      acceptance_mail: false,
      indexing_info: false,
      journal_published_copy: false,
      journal_acceptance_letter: false,
      journal_submission_proof: false,
      journal_front_page: false,
      journal_indexing_proof: false,
      book_front_cover: false,
      book_isbn_page: false,
      book_publisher_page: false,
      book_copyright_page: false,
      book_author_contribution: false,
      chapter_content: false,
      chapter_book_title_page: false,
      chapter_isbn_page: false,
      chapter_publisher_details: false,
      chapter_contribution_proof: false,
      consultancy_work_order: false,
      consultancy_invoice_receipt: false,
      consultancy_acknowledgement: false,
      consultancy_screenshots: false,
      award_certificate: false,
      award_recognition_letter: false,
      award_event_photo: false,
      award_media_clipping: false,
    },
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const category = formData.category;

  useEffect(() => {
    if (detail) {
      // When editing, populate all fields
      const newFormData = { ...formData };
      setFormData({
        ...newFormData, // Start with a clean slate of all possible fields
        ...detail, // Spread the detail object to overwrite
        proofs: { // Ensure proofs object is properly structured
          ...newFormData.proofs,
          ...(detail.proofs || {}),
        },
      });
    } else {
      // When creating, reset to a well-defined initial state
      setFormData({
        // Common fields,
        title: '', category: forceCategory || '', publication_year: '',
        // Category-specific fields
        paper_title: '', journal_name: '', journal_type: 'national', indexed_in: '', issn: '',
        conference_name: '', organizer: '', mode: '', publication_date: '', status: '',
        book_title: '', authors: '', publisher: '', isbn: '',
        application_number: '', application_type: '', applicant_name: '', inventors: '',
        client: '', consultancy_type: '', amount: '', duration: '',
        awarding_body: '', description: '',
        // Proofs and file
        proofs: {
          certificate_of_presentation: false, abstract_copy: false, conference_brochure: false,
          acceptance_mail: false, indexing_info: false,
          journal_published_copy: false,
          journal_acceptance_letter: false,
          journal_submission_proof: false,
          journal_front_page: false,
          journal_indexing_proof: false,
          book_front_cover: false,
          book_isbn_page: false,
          book_publisher_page: false,
          book_copyright_page: false,
          book_author_contribution: false,
          chapter_content: false,
          chapter_book_title_page: false,
          chapter_isbn_page: false,
          chapter_publisher_details: false,
          chapter_contribution_proof: false,
          consultancy_work_order: false,
          consultancy_invoice_receipt: false,
          consultancy_acknowledgement: false,
          consultancy_screenshots: false,
          award_certificate: false,
          award_recognition_letter: false,
          award_event_photo: false,
          award_media_clipping: false,
        },
        file: null,
      });
    }

    // If a category is forced from the parent, set it.
    if (forceCategory) {
      setFormData(prev => ({ ...prev, category: forceCategory }));
    }
  }, [detail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Create a FormData object to handle file uploads
    const dataToSubmit = new FormData();
    for (const key in formData) {
      if (key === 'proofs') {
        for (const proofKey in formData.proofs) {
          if (formData.proofs[proofKey]) {
            dataToSubmit.append(proofKey, 'on'); // 'on' is the default value for a checked checkbox
          }
        }
      } else if (formData[key] !== null) {
        dataToSubmit.append(key, formData[key]);
      }
    }
    // The title field is used for the paper title in this category
    if (formData.category === 'journal_publication' || formData.category === 'conference_presentation') {
      dataToSubmit.set('title', formData.paper_title);
    }

    try {
      if (detail) {
        await staffDetailsAPI.update(detail._id, dataToSubmit);
      } else {
        await staffDetailsAPI.create(dataToSubmit);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleProofChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      proofs: { ...prev.proofs, [name]: checked }
    }));
  };

  const proofKeysByCategory = {
    journal_publication: ['journal_published_copy', 'journal_acceptance_letter', 'journal_submission_proof', 'journal_front_page', 'journal_indexing_proof'],
    conference_presentation: ['certificate_of_presentation', 'abstract_copy', 'conference_brochure', 'acceptance_mail', 'indexing_info'],
    books_published: ['book_front_cover', 'book_isbn_page', 'book_publisher_page', 'book_copyright_page', 'book_author_contribution'],
    book_chapters: ['chapter_content', 'chapter_book_title_page', 'chapter_isbn_page', 'chapter_publisher_details', 'chapter_contribution_proof'],
    consultancy_project: ['consultancy_work_order', 'consultancy_invoice_receipt', 'consultancy_acknowledgement', 'consultancy_screenshots'],
    awards_researches: ['award_certificate', 'award_recognition_letter', 'award_event_photo', 'award_media_clipping'],
  };

  const handleSelectAllProofs = (category, isChecked) => {
    const categoryKeys = proofKeysByCategory[category];
    if (!categoryKeys) return;

    setFormData(prev => {
      const newProofs = { ...prev.proofs };
      categoryKeys.forEach(key => {
        newProofs[key] = isChecked;
      });
      return { ...prev, proofs: newProofs };
    });
  };

  const areAllProofsSelected = (category) => {
    const categoryKeys = proofKeysByCategory[category];
    if (!categoryKeys || categoryKeys.length === 0) return false;
    return categoryKeys.every(key => formData.proofs[key]);
  };

  const renderCategoryFields = () => {
    switch (category) {
      case 'journal_publication':
        return (
          <>
            <div className="form-group full-width"><label>Title of the Paper *</label><input type="text" name="paper_title" value={formData.paper_title || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Journal Name *</label><input type="text" name="journal_name" value={formData.journal_name || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Journal Type *</label><select name="journal_type" value={formData.journal_type || 'national'} onChange={handleChange} required><option value="national">National</option><option value="international">International</option></select></div>
            <div className="form-group"><label>Indexed In</label><select name="indexed_in" value={formData.indexed_in || ''} onChange={handleChange}><option value="">Select Index</option><option value="scopus">Scopus</option><option value="web_of_science">Web of Science</option><option value="ugc_care">UGC CARE</option><option value="other">Other</option></select></div>
            <div className="form-group"><label>ISSN No</label><input type="text" name="issn" value={formData.issn || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Year of Publication *</label><input type="number" name="publication_year" value={formData.publication_year || ''} onChange={handleChange} required placeholder="YYYY" min="1900" max="2100" /></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Submit the following proof for each journal paper (as applicable):</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAllProofs('journal_publication', e.target.checked)}
                    checked={areAllProofsSelected('journal_publication')}
                  /> Select All
                </label>
                <label><input type="checkbox" name="journal_published_copy" checked={formData.proofs.journal_published_copy} onChange={handleProofChange} /> Published copy of paper</label>
                <label><input type="checkbox" name="journal_acceptance_letter" checked={formData.proofs.journal_acceptance_letter} onChange={handleProofChange} /> Acceptance letter</label>
                <label><input type="checkbox" name="journal_submission_proof" checked={formData.proofs.journal_submission_proof} onChange={handleProofChange} /> Proof of submission</label>
                <label><input type="checkbox" name="journal_front_page" checked={formData.proofs.journal_front_page} onChange={handleProofChange} /> Journal front page with ISSN</label>
                <label><input type="checkbox" name="journal_indexing_proof" checked={formData.proofs.journal_indexing_proof} onChange={handleProofChange} /> Indexing proof</label>
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="file">File Attachment</label>
              <input type="file" id="file" name="file" onChange={handleFileChange}  />
            </div>
          </>
        );
      case 'conference_presentation':
        return (
          <>
            <div className="form-group full-width"><label>Title of the Paper *</label><input type="text" name="paper_title" value={formData.paper_title || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Conference Name *</label><input type="text" name="conference_name" value={formData.conference_name || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Organizer *</label><input type="text" name="organizer" value={formData.organizer || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>National/International *</label><select name="journal_type" value={formData.journal_type || 'national'} onChange={handleChange} required><option value="national">National</option><option value="international">International</option></select></div>
            <div className="form-group"><label>Mode *</label><select name="mode" value={formData.mode || ''} onChange={handleChange} required><option value="" disabled>Select Mode</option><option value="online">Online</option><option value="offline">Offline</option></select></div>
            <div className="form-group"><label>Date *</label><input type="date" name="publication_date" value={formData.publication_date || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Status *</label><input type="text" name="status" value={formData.status || ''} onChange={handleChange} required /></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Submit the following proof for each conference paper:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAllProofs('conference_presentation', e.target.checked)}
                    checked={areAllProofsSelected('conference_presentation')}
                  /> Select All
                </label>
                <label><input type="checkbox" name="certificate_of_presentation" checked={formData.proofs.certificate_of_presentation} onChange={handleProofChange} /> Certificate of presentation</label>
                <label><input type="checkbox" name="abstract_copy" checked={formData.proofs.abstract_copy} onChange={handleProofChange} /> Abstract/paper copy from proceedings</label>
                <label><input type="checkbox" name="conference_brochure" checked={formData.proofs.conference_brochure} onChange={handleProofChange} /> Conference brochure or schedule</label>
                <label><input type="checkbox" name="acceptance_mail" checked={formData.proofs.acceptance_mail} onChange={handleProofChange} /> Acceptance mail (for accepted/unpresented papers)</label>
                <label><input type="checkbox" name="indexing_info" checked={formData.proofs.indexing_info} onChange={handleProofChange} /> Indexing info if available (IEEE, Springer, etc...)</label>
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="file">File Attachment *</label>
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFileChange}
                required={!detail}
              />
              {detail && (
                <small>Optional, leave blank to keep existing file.</small>
              )}
            </div>
          </>
        );
      case 'books_published':
        return (
          <>
            <div className="form-group"><label>Book Title *</label><input type="text" name="book_title" value={formData.book_title || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Author / Co-author *</label><input type="text" name="authors" value={formData.authors || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Publisher *</label><input type="text" name="publisher" value={formData.publisher || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Year *</label><input type="number" name="publication_year" value={formData.publication_year || ''} onChange={handleChange} required placeholder="YYYY" min="1900" max="2100" /></div>
            <div className="form-group"><label>ISBN</label><input type="text" name="isbn" value={formData.isbn || ''} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="file">Proof (front cover/isbn)</label><input type="file" id="file" name="file" onChange={handleFileChange} /></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Submit the following proof for each published book:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAllProofs('books_published', e.target.checked)}
                    checked={areAllProofsSelected('books_published')}
                  /> Select All
                </label>
                <label><input type="checkbox" name="book_front_cover" checked={formData.proofs.book_front_cover} onChange={handleProofChange} /> Front cover of the book</label>
                <label><input type="checkbox" name="book_isbn_page" checked={formData.proofs.book_isbn_page} onChange={handleProofChange} /> ISBN page</label>
                <label><input type="checkbox" name="book_publisher_page" checked={formData.proofs.book_publisher_page} onChange={handleProofChange} /> Publisher details page</label>
                <label><input type="checkbox" name="book_copyright_page" checked={formData.proofs.book_copyright_page} onChange={handleProofChange} /> Copyright page (if available)</label>
                <label><input type="checkbox" name="book_author_contribution" checked={formData.proofs.book_author_contribution} onChange={handleProofChange} /> Author contribution declaration (if co-authored)</label>
              </div>
            </div>
          </>
        );
      case 'book_chapters':
        return (
          <>
            <div className="form-group"><label>Book Title and Publisher *</label><input type="text" name="book_title" value={formData.book_title || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Publisher *</label><input type="text" name="publisher" value={formData.publisher || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Authors *</label><input type="text" name="authors" value={formData.authors || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Year *</label><input type="number" name="publication_year" value={formData.publication_year || ''} onChange={handleChange} required placeholder="YYYY" min="1900" max="2100" /></div>
            <div className="form-group"><label>ISBN</label><input type="text" name="isbn" value={formData.isbn || ''} onChange={handleChange} /></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Submit the following for each book chapter:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAllProofs('book_chapters', e.target.checked)}
                    checked={areAllProofsSelected('book_chapters')}
                  /> Select All
                </label>
                <label><input type="checkbox" name="chapter_content" checked={formData.proofs.chapter_content} onChange={handleProofChange} /> Chapter content (PDF or image)</label>
                <label><input type="checkbox" name="chapter_book_title_page" checked={formData.proofs.chapter_book_title_page} onChange={handleProofChange} /> Title page of the book</label>
                <label><input type="checkbox" name="chapter_isbn_page" checked={formData.proofs.chapter_isbn_page} onChange={handleProofChange} /> ISBN page</label>
                <label><input type="checkbox" name="chapter_publisher_details" checked={formData.proofs.chapter_publisher_details} onChange={handleProofChange} /> Publisher details</label>
                <label><input type="checkbox" name="chapter_contribution_proof" checked={formData.proofs.chapter_contribution_proof} onChange={handleProofChange} /> Certificate or mail confirmation of chapter contribution</label>
              </div>
            </div>
            <div className="form-group full-width"><label htmlFor="file">Proof (Chapter copy/Certificate)</label><input type="file" id="file" name="file" onChange={handleFileChange} /></div>
          </>
        );
      case 'consultancy_project':
        return (
          <>
            <div className="form-group"><label>Agency Name *</label><input type="text" name="client" value={formData.client || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Consultancy Type</label><input type="text" name="consultancy_type" value={formData.consultancy_type || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Amount (INR)</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Duration</label><input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} placeholder="e.g., 6 months" /></div>
            <div className="form-group"><label>Verification</label><input type="text" name="verification" value={formData.verification || ''} onChange={handleChange} /></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Submit the following proof for each consultancy project:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAllProofs('consultancy_project', e.target.checked)}
                    checked={areAllProofsSelected('consultancy_project')}
                  /> Select All
                </label>
                <label><input type="checkbox" name="consultancy_work_order" checked={formData.proofs.consultancy_work_order} onChange={handleProofChange} /> Work order/MOU/Agreement with client</label>
                <label><input type="checkbox" name="consultancy_invoice_receipt" checked={formData.proofs.consultancy_invoice_receipt} onChange={handleProofChange} /> Invoice and payment receipt/Completion report (if applicable)</label>
                <label><input type="checkbox" name="consultancy_acknowledgement" checked={formData.proofs.consultancy_acknowledgement} onChange={handleProofChange} /> Acknowledgement letter from client</label>
                <label><input type="checkbox" name="consultancy_screenshots" checked={formData.proofs.consultancy_screenshots} onChange={handleProofChange} /> Screenshots/Mail proofs (if soft only)</label>
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="file">Proof (Invoice/Agreement/Receipt)</label>
              <input type="file" id="file" name="file" onChange={handleFileChange} />
            </div>
          </>
        );
      case 'awards_researches':
        return (
          <>
            <div className="form-group"><label>Award Name *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Issuing Body *</label><input type="text" name="awarding_body" value={formData.awarding_body || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Year *</label><input type="number" name="publication_year" value={formData.publication_year || ''} onChange={handleChange} required placeholder="YYYY" min="1900" max="2100" /></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Submit the following proof for each award:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    onChange={(e) => handleSelectAllProofs('awards_researches', e.target.checked)}
                    checked={areAllProofsSelected('awards_researches')}
                  /> Select All
                </label>
                <label><input type="checkbox" name="award_certificate" checked={formData.proofs.award_certificate} onChange={handleProofChange} /> Certificate of award</label>
                <label><input type="checkbox" name="award_recognition_letter" checked={formData.proofs.award_recognition_letter} onChange={handleProofChange} /> Letter of recognition (if issued separately)</label>
                <label><input type="checkbox" name="award_event_photo" checked={formData.proofs.award_event_photo} onChange={handleProofChange} /> Event photo (optional but recommended)</label>
                <label><input type="checkbox" name="award_media_clipping" checked={formData.proofs.award_media_clipping} onChange={handleProofChange} /> Newspaper/Website clipping (if public announcement)</label>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="file">Proof (Certification/Notification)</label>
              <input type="file" id="file" name="file" onChange={handleFileChange} />
              </div>
          </>
        );
      default:
        return (
          <>
            <div className="form-group full-width">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                required
                placeholder="Enter a descriptive title"
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="content">Content *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content || ''}
                onChange={handleChange}
                required rows="8" placeholder="Enter detailed content..." />
            </div>
          </>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="staff-details-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={!!forceCategory}
          >
            <option value="" disabled>-- Select a Category --</option>
            <option value="journal_publication">Journal Publication</option>
            <option value="conference_presentation">Conference Presentation</option>
            <option value="books_published">Books Published</option>
            <option value="book_chapters">Book Chapters</option>
            <option value="consultancy_project">Consultancy Project</option>
            <option value="awards_researches">Awards & Researches</option>
          </select>
        </div>
      </div>

      {/* --- Fields shown after category is selected --- */}
      {category && (
        <>
          <div className="form-row">{renderCategoryFields()}</div>
        </>
      )}

      {category && (
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : detail ? 'Update' : 'Create'}
          </button>
        </div>
      )}
    </form>
  );
};

export default StaffDetailsForm;
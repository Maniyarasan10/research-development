// StaffDetailsForm.jsx
import { useState, useEffect } from 'react';
import { DEPARTMENTS } from '../constants';
import { staffDetailsAPI } from '../services/api';
import './StaffDetailsForm.css';

const StaffDetailsForm = ({ detail, onSuccess, onCancel, forceCategory }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    
    // Specific fields - authors is now for dynamic authors in books/chapters
    authors: '',
    chapter_authors: [{ name: '' }], // New field for book chapters
    faculty_names_certification: [{ name: '', designation: '', department: '', email_id: '', mobile_number: '' }], // Updated structure for multiple investigators
    investigator_names: [{ name: '', designation: '', department: '', email_id: '', mobile_number: '' }], // Updated structure for multiple investigators
    faculty_names: [{ name: '' }], // Now holds all faculty names for awards
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
    status: '', // Used for various statuses, including research funding status
    client: '',
    consultancy_type: '',
    amount: '', // Amount Proposed
    duration: '',
    awarding_body: '',
    description: '',
    organizer: '',
    funding_agency: '',
    proposal_type: '', // New field for Research Funding
    issuing_organization: '',
    date_obtained: '',
    credential_id: '',
    program_type: '',
    start_date: '',
    mode: '',
    collaboration: '', // New field for Seminar/Workshop/FDP
    level: '', // New field for Seminar/Workshop/FDP
    alignment: '', // New field for Seminar/Workshop/FDP
    venue: '',
    assessment_status: '',
    proof_type: '',
    relevance_to_domain: '',
    proofs: {
      certificate_of_presentation: false,
      abstract_copy: false,
      conference_brochure: false,
      acceptance_mail: false,
      indexing_info: false,
      // Existing proofs for Journal Publication
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
      funding_sanction_letter: false,
      project_proposal: false,
      utilization_certificate: false,
      project_completion_report: false,
      certification_copy: false,
      certification_verification_link: false,
      program_certificate: false,
      program_brochure: false,
      report_upload: false, // New for Seminar/Workshop/FDP
      screenshot_participation_proof: false, // New for Seminar/Workshop/FDP
      payment_receipt_upload: false,
      screenshot_course_completion: false,
      attendance_proof: false,
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
        // Special handling for array-based authors
        chapter_authors: (detail.category === 'book_chapters' && Array.isArray(detail.authors))
          ? (detail.authors.length > 0 ? detail.authors : [{ name: '' }])
          : [{ name: '' }],
           faculty_names_certification: (detail.category === 'certification' && Array.isArray(detail.faculty_names_certification)) ? (detail.faculty_names_certification.length > 0 ? detail.faculty_names_certification : [{ name: '', designation: '', department: '', email_id: '', mobile_number: '' }]) : [{ name: '', designation: '', department: '', email_id: '', mobile_number: '' }],
        investigator_names: (detail.category === 'research_funding_project' && Array.isArray(detail.investigator_names)) ? (detail.investigator_names.length > 0 ? detail.investigator_names : [{ name: '', designation: '', department: '', email_id: '', mobile_number: '' }]) : [{ name: '', designation: '', department: '', email_id: '', mobile_number: '' }],
        faculty_names: (detail.category === 'awards_researches' && Array.isArray(detail.faculty_names))
          ? (detail.faculty_names.length > 0 ? detail.faculty_names : [{ name: '' }])
          : [{ name: '' }],

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
        // Handle proofs checkboxes
        for (const proofKey in formData.proofs) {
          if (formData.proofs[proofKey]) {
            dataToSubmit.append(proofKey, 'on'); // 'on' is the default value for a checked checkbox
          }
        }
      } else if (key === 'chapter_authors' && ['book_chapters', 'books_published'].includes(formData.category)) {
        // Serialize chapter_authors array for book chapters
        const validAuthors = formData.chapter_authors?.filter(author => author.name && author.name.trim() !== '');
        if (validAuthors.length > 0) {
          dataToSubmit.append('authors', JSON.stringify(validAuthors)); // Send as 'authors' to backend
        }
      } else if (key === 'faculty_names' && formData.category === 'awards_researches') {
        const validNames = formData.faculty_names?.filter(faculty => faculty.name && faculty.name.trim() !== '');
        if (validNames.length > 0) {
          dataToSubmit.append('faculty_names', JSON.stringify(validNames));
        }
      } else if (key === 'investigator_names' && formData.category === 'research_funding_project') {
         const validNames = formData.investigator_names?.filter(investigator => investigator.name && investigator.name.trim() !== '');
        if (validNames.length > 0)
          dataToSubmit.append('investigator_names', JSON.stringify(validNames));
      } else if (key === 'faculty_names_certification' && formData.category === 'certification') {
        const validNames = formData.faculty_names_certification?.filter(faculty => faculty.name && faculty.name.trim() !== '');
        if (validNames.length > 0)
          dataToSubmit.append('faculty_names_certification', JSON.stringify(validNames));
      } else if (key === 'faculty_name' && formData.category === 'awards_researches') { // This was for the single faculty name field, now handled by faculty_names array
        // Skip the old single faculty_name field if it exists for awards_researches
        continue;
      } else if (key === 'file' && formData.file) {
        // Sanitize the title to create a valid filename
        const baseName = formData.application_number 
          || formData.title 
          || formData.paper_title 
          || formData.book_title || 'document';
        const sanitizedTitle = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Get the file extension
        const originalFileName = formData.file.name;
        const fileExtension = originalFileName.slice(((originalFileName.lastIndexOf(".") - 1) >>> 0) + 2);
        
        // Create the new filename
        const newFileName = `${sanitizedTitle}.${fileExtension}`;

        dataToSubmit.append('file', formData.file, newFileName);
      } else if (formData[key] !== null) {
        dataToSubmit.append(key, formData[key]); // Append other form data
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

  const handleChapterAuthorChange = (index, e) => {
    const newAuthors = [...formData.chapter_authors];
    newAuthors[index][e.target.name] = e.target.value;
    setFormData({ ...formData, chapter_authors: newAuthors });
  };

  const addChapterAuthorField = () => {
    setFormData({ ...formData, chapter_authors: [...formData.chapter_authors, { name: '' }] });
  };

  const removeChapterAuthorField = (index) => {
    const newAuthors = [...formData.chapter_authors];
    newAuthors.splice(index, 1);
    setFormData({ ...formData, chapter_authors: newAuthors.length > 0 ? newAuthors : [{ name: '' }] });
  };

  const handleFacultyNameCertificationChange = (index, e) => {
    const newInvestigators = [...formData.faculty_names_certification];
    newInvestigators[index][e.target.name] = e.target.value;
    setFormData({ ...formData, faculty_names_certification: newInvestigators });
  };

  const addFacultyNameCertificationField = () => {
    setFormData({ ...formData, faculty_names_certification: [...formData.faculty_names_certification, { name: '', designation: '', department: '', email_id: '', mobile_number: '' }] });
  };

  const removeFacultyNameCertificationField = (index) => {
    const newInvestigators = [...formData.faculty_names_certification];
    newInvestigators.splice(index, 1);
    setFormData({ ...formData, faculty_names_certification: newInvestigators.length > 0 ? newInvestigators : [{ name: '', designation: '', department: '', email_id: '', mobile_number: '' }] });
  };


  const handleInvestigatorNameChange = (index, e) => {
    const newInvestigators = [...formData.investigator_names];
    newInvestigators[index][e.target.name] = e.target.value;
    setFormData({ ...formData, investigator_names: newInvestigators });
  };

  const addInvestigatorNameField = () => {
    setFormData({ ...formData, investigator_names: [...formData.investigator_names, { name: '' }] });
  };
  
  const removeInvestigatorNameField = (index) => {
    const newInvestigators = [...formData.investigator_names];
    newInvestigators.splice(index, 1);
    setFormData({ ...formData, investigator_names: newInvestigators.length > 0 ? newInvestigators : [{ name: '' }] });
  };



  const handleFacultyNameChange = (index, e) => {
    const newFaculty = [...formData.faculty_names];
    newFaculty[index][e.target.name] = e.target.value;
    setFormData({ ...formData, faculty_names: newFaculty });
  };

  const addFacultyNameField = () => {
    setFormData({ ...formData, faculty_names: [...formData.faculty_names, { name: '' }] });
  };

  const removeFacultyNameField = (index) => {
    const newFaculty = [...formData.faculty_names];
    newFaculty.splice(index, 1);
    setFormData({ ...formData, faculty_names: newFaculty.length > 0 ? newFaculty : [{ name: '' }] });
  };





  const proofKeysByCategory = {
    journal_publication: ['journal_published_copy', 'journal_acceptance_letter', 'journal_submission_proof', 'journal_front_page', 'journal_indexing_proof'],
    conference_presentation: ['certificate_of_presentation', 'abstract_copy', 'conference_brochure', 'acceptance_mail', 'indexing_info'],
    books_published: ['book_front_cover', 'book_isbn_page', 'book_publisher_page', 'book_copyright_page', 'book_author_contribution'],
    book_chapters: ['chapter_content', 'chapter_book_title_page', 'chapter_isbn_page', 'chapter_publisher_details', 'chapter_contribution_proof'],
    consultancy_project: ['consultancy_work_order', 'consultancy_invoice_receipt', 'consultancy_acknowledgement', 'consultancy_screenshots'],
    awards_researches: ['award_certificate', 'award_recognition_letter', 'award_event_photo', 'award_media_clipping'],
    research_funding_project: ['funding_sanction_letter', 'project_proposal', 'utilization_certificate', 'project_completion_report'],

    certification: ['certification_copy', 'payment_receipt_upload', 'screenshot_course_completion'],
    seminar_workshop_fdp: ['program_certificate', 'program_brochure', 'attendance_proof', 'report_upload', 'screenshot_participation_proof'],
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
            <div className="form-group"><label>Status *</label>
              <select name="status" value={formData.status || ''} onChange={handleChange} required>
                <option value="">Select Status</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Presented">Presented</option>
                <option value="Published">Published</option>
              </select></div>
            {formData.status === 'Published' && (
              <>
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
                  {detail && <small>Optional, leave blank to keep existing file.</small>}
                </div>
              </>
            )}
          </>
        );
      case 'books_published':
        return (
          <>
            <div className="form-group"><label>Name *</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Book Title *</label><input type="text" name="book_title" value={formData.book_title || ''} onChange={handleChange} required /></div>
            <div className="form-group full-width">
              <label>Author(s) *</label>
              {formData.chapter_authors.map((author, index) => (
                <div key={index} className="dynamic-field-group">
                  <input
                    type="text"
                    name="name"
                    value={author.name}
                    onChange={(e) => handleChapterAuthorChange(index, e)}
                    required
                    placeholder="Author Name"
                  />
                  {formData.chapter_authors.length > 1 && (<button type="button" className="btn-remove" onClick={() => removeChapterAuthorField(index)}>-</button>)}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addChapterAuthorField}>+ Add Author</button>
            </div>
            <div className="form-group"><label>Publisher *</label><input type="text" name="publisher" value={formData.publisher || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Year *</label><input type="number" name="publication_year" value={formData.publication_year || ''} onChange={handleChange} required placeholder="YYYY" min="1900" max="2100" /></div>
            <div className="form-group"><label>ISBN *</label><input type="text" name="isbn" value={formData.isbn || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Edition</label><input type="text" name="edition" value={formData.edition || ''} onChange={handleChange} /></div>
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
            <div className="form-group"><label htmlFor="file">Proof (front cover/isbn)</label><input type="file" id="file" name="file" onChange={handleFileChange} /></div>
          </>
        );
      case 'book_chapters':
        return (
          <>
            <div className="form-group"><label>Book Title *</label><input type="text" name="book_title" value={formData.book_title || ''} onChange={handleChange} required /></div>
            <div className="form-group full-width">
              <label>Authors *</label>
              {formData.chapter_authors.map((author, index) => (
                <div key={index} className="dynamic-field-group">
                  <input
                    type="text"
                    name="name"
                    value={author.name}
                    onChange={(e) => handleChapterAuthorChange(index, e)}
                    required
                    placeholder="Author Name"
                  />
                  {formData.chapter_authors.length > 1 && (<button type="button" className="btn-remove" onClick={() => removeChapterAuthorField(index)}>-</button>)}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addChapterAuthorField}>+ Add Author</button>
            </div>
            <div className="form-group"><label>Publisher *</label><input type="text" name="publisher" value={formData.publisher || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Year *</label><input type="number" name="publication_year" value={formData.publication_year || ''} onChange={handleChange} required placeholder="YYYY" min="1900" max="2100" /></div>
            <div className="form-group"><label>ISBN *</label><input type="text" name="isbn" value={formData.isbn || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Edition</label><input type="text" name="edition" value={formData.edition || ''} onChange={handleChange} /></div>
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
            <div className="form-group"><label>Verification</label>
              <select name="verification" value={formData.verification || ''} onChange={handleChange}>
                <option value="">Select Status</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Sanctioned">Sanctioned</option>
                <option value="Completed">Completed</option>
              </select></div>
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
            <div className="form-group full-width">
              <label>Faculty Name(s) *</label>
              {formData.faculty_names.map((faculty, index) => (
                <div key={index} className="dynamic-field-group">
                  <input
                    type="text"
                    name="name"
                    value={faculty.name}
                    onChange={(e) => handleFacultyNameChange(index, e)}
                    required // All faculty names are now required
                    placeholder="Faculty Name"
                  />
                  {formData.faculty_names.length > 0 && ( // Allow removing if there's at least one
                    <button type="button" className="btn-remove" onClick={() => removeFacultyNameField(index)}>-</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addFacultyNameField}>+ Add Name</button>
            </div>
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
      case 'research_funding_project':
        return (
          <>
            <div className="form-group full-width">
              <label>Principal Investigator(s) / Co-Investigator(s) *</label>
              {formData.investigator_names.map((investigator, index) => (
                <div key={index} className="dynamic-field-group investigator-group">
                  <input
                    type="text"
                    name="name"
                    value={investigator.name}
                    onChange={(e) => handleInvestigatorNameChange(index, e)}
                    required
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    name="designation"
                    value={investigator.designation}
                    onChange={(e) => handleInvestigatorNameChange(index, e)}
                    placeholder="Designation"
                  />
                  <select
                    name="department"
                    value={investigator.department}
                    onChange={(e) => handleInvestigatorNameChange(index, e)}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="email"
                    name="email_id"
                    value={investigator.email_id}
                    onChange={(e) => handleInvestigatorNameChange(index, e)}
                    placeholder="Email ID"
                  />
                  <input
                    type="tel"
                    name="mobile_number"
                    value={investigator.mobile_number}
                    onChange={(e) => handleInvestigatorNameChange(index, e)}
                    placeholder="Mobile Number"
                  />
                  {formData.investigator_names.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => removeInvestigatorNameField(index)}>-</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addInvestigatorNameField}>+ Add Investigator</button>
            </div>
            <div className="form-group full-width"><label>Project Title *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
            <div className="form-group">
              <label>Proposal Type *</label>
              <select name="proposal_type" value={formData.proposal_type || ''} onChange={handleChange} required>
                <option value="" disabled>Select Proposal Type</option>
                <option value="Research Project">Research Project</option>
                <option value="Innovation/Prototype">Innovation/Prototype</option>
                <option value="Consultancy">Consultancy</option>
                <option value="Student Funded Project">Student Funded Project</option>
                <option value="Collaborative Project (Industry/Institute)">Collaborative Project (Industry/Institute)</option>
              </select>
            </div>
            <div className="form-group"><label>Funding Agency *</label><input type="text" name="funding_agency" value={formData.funding_agency || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Scheme Name / Call for Proposal</label><input type="text" name="scheme_name" value={formData.scheme_name || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Project Duration</label><input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} placeholder="e.g., 6 months / 2 years" /></div>
            <div className="form-group"><label>Amount Proposed (₹ Lakhs)</label><input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Amount Sanctioned (₹ Lakhs)</label><input type="number" name="amount_sanctioned" value={formData.amount_sanctioned || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Duration</label><input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} placeholder="e.g., 2 years" /></div>
            <div className="form-group"><label>Status</label><select name="status" value={formData.status || ''} onChange={handleChange}>
              <option value="">Select Status</option><option value="Proposed">Proposed</option><option value="Submitted">Submitted</option><option value="Under Review">Under Review</option><option value="Sanctioned">Sanctioned</option><option value="Rejected">Rejected</option><option value="Completed">Completed</option>
            </select></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Submit the following proof for each funding project:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input type="checkbox" onChange={(e) => handleSelectAllProofs('research_funding_project', e.target.checked)} checked={areAllProofsSelected('research_funding_project')} /> Select All
                </label>
                <label><input type="checkbox" name="project_proposal" checked={formData.proofs.project_proposal} onChange={handleProofChange} /> Proposal Abstract / Detailed Project Proposal</label>
                <label><input type="checkbox" name="funding_sanction_letter" checked={formData.proofs.funding_sanction_letter} onChange={handleProofChange} /> Approval/Sanction Order Copy</label>
                <label><input type="checkbox" name="utilization_certificate" checked={formData.proofs.utilization_certificate} onChange={handleProofChange} /> Utilization certificate (if applicable)</label>
                <label><input type="checkbox" name="project_completion_report" checked={formData.proofs.project_completion_report} onChange={handleProofChange} /> Project completion report</label>
              </div>
            </div>
            <div className="form-group full-width"><label htmlFor="file">Proof (Sanction Letter/Report)</label><input type="file" id="file" name="file" onChange={handleFileChange} /></div>
          </>
        );
      case 'certification':
        return (
          <>
            <div className="form-group full-width">
              <label>Faculty Information *</label>
              {formData.faculty_names_certification.map((faculty, index) => (
                <div key={index} className="dynamic-field-group investigator-group">
                  <input
                    type="text"
                    name="name"
                    value={faculty.name}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    required
                    placeholder="Faculty Name"
                  />
                  <input
                    type="text"
                    name="designation"
                    value={faculty.designation}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    placeholder="Designation"
                  />
                  <select
                    name="department"
                    value={faculty.department}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="email"
                    name="email_id"
                    value={faculty.email_id}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    placeholder="Email ID"
                  />
                  <input
                    type="tel"
                    name="mobile_number"
                    value={faculty.mobile_number}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    placeholder="Mobile Number"
                  />
                  {formData.faculty_names_certification.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => removeFacultyNameCertificationField(index)}>-</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addFacultyNameCertificationField}>+ Add Faculty</button>
            </div>
            <div className="form-group"><label>Type of Certification *</label><input type="text" name="program_type" value={formData.program_type || ''} onChange={handleChange} required placeholder="Ex: NPTEL / MOOC / Coursera" /></div>
            <div className="form-group full-width"><label>Certification Title *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Course Platform / Organization *</label><input type="text" name="issuing_organization" value={formData.issuing_organization || ''} onChange={handleChange} required placeholder="Ex: NPTEL, IIT Madras, UDEMY" /></div>
            <div className="form-group"><label>Duration of Course</label><input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} placeholder="Ex: 8 Weeks / 60 Hours" /></div>
            <div className="form-group"><label>Start Date *</label><input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Completion Date</label><input type="date" name="date_obtained" value={formData.date_obtained || ''} onChange={handleChange} /></div>
            <div className="form-group">
              <label>Mode *</label>
              <select name="mode" value={formData.mode || ''} onChange={handleChange} required>
                <option value="" disabled>Select Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Blended">Blended</option>
              </select>
            </div>
            <div className="form-group"><label>Assessment Status</label><select name="assessment_status" value={formData.assessment_status || ''} onChange={handleChange}><option value="">Select Status</option><option value="Completed with Exam">Completed with Exam</option><option value="Completed without Exam">Completed without Exam</option></select></div>
            <div className="form-group"><label>Performance Grade / Score</label><input type="text" name="credential_id" value={formData.credential_id || ''} onChange={handleChange} placeholder="Ex: Elite + Silver, 95%, A Grade" /></div>
            <div className="form-group"><label>Relevance to Domain</label><select name="relevance_to_domain" value={formData.relevance_to_domain || ''} onChange={handleChange}><option value="">Select Relevance</option><option value="Core">Core</option><option value="Allied">Allied</option><option value="Multidisciplinary">Multidisciplinary</option></select></div>
            <div className="form-group full-width proof-notice">
              <p><strong>Documentation Uploads:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                  <input type="checkbox" onChange={(e) => handleSelectAllProofs('certification', e.target.checked)} checked={areAllProofsSelected('certification')} /> Select All
                </label>
                <label><input type="checkbox" name="certification_copy" checked={formData.proofs.certification_copy} onChange={handleProofChange} /> Certificate Upload (PDF/Image)</label>
                <label><input type="checkbox" name="payment_receipt_upload" checked={formData.proofs.payment_receipt_upload} onChange={handleProofChange} /> Payment Receipt Upload (if applicable)</label>
                <label><input type="checkbox" name="screenshot_course_completion" checked={formData.proofs.screenshot_course_completion} onChange={handleProofChange} /> Screenshot of Course Completion (Optional)</label>
              </div>
            </div>
            <div className="form-group full-width"><label htmlFor="file">Proof (Certificate Copy)</label><input type="file" id="file" name="file" onChange={handleFileChange} /></div>
          </>
        );
      case 'seminar_workshop_fdp':
        return (
          <>            
             <div className="form-group full-width">
              <label>Faculty Information *</label>
              {formData.faculty_names_certification.map((faculty, index) => (
                <div key={index} className="dynamic-field-group investigator-group">
                  <input
                    type="text"
                    name="name"
                    value={faculty.name}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    required
                    placeholder="Faculty Name"
                  />
                  <input
                    type="text"
                    name="designation"
                    value={faculty.designation}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    placeholder="Designation"
                  />
                  <select
                    name="department"
                    value={faculty.department}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="email"
                    name="email_id"
                    value={faculty.email_id}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    placeholder="Email ID"
                  />
                  <input
                    type="tel"
                    name="mobile_number"
                    value={faculty.mobile_number}
                    onChange={(e) => handleFacultyNameCertificationChange(index, e)}
                    placeholder="Mobile Number"
                  />

                  {formData.faculty_names_certification.length > 1 && (
                    <button type="button" className="btn-remove" onClick={() => removeFacultyNameCertificationField(index)}>-</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn-add" onClick={addFacultyNameCertificationField}>+ Add Faculty</button>
            </div>
            <div className="form-group">
              <label>Event Type *</label>
              <select name="program_type" value={formData.program_type || ''} onChange={handleChange} required>
                <option value="" disabled>Select Event Type</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="FDP">FDP</option>
                <option value="STTP">STTP</option>
                <option value="Webinar">Webinar</option>
                <option value="Training Program">Training Program</option>
                <option value="Certification Course">Certification Course</option>
                <option value="Other">Other (Specify)</option>
              </select>
            </div>
            <div className="form-group full-width"><label>Event Title *</label><input type="text" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Organizer / Conducting Agency *</label><input type="text" name="organizer" value={formData.organizer || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>Collaboration (If any – Industry/Institute Name)</label><input type="text" name="collaboration" value={formData.collaboration || ''} onChange={handleChange} /></div>
            <div className="form-group">
              <label>Mode *</label>
              <select name="mode" value={formData.mode || ''} onChange={handleChange} required>
                <option value="" disabled>Select Mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group"><label>Venue / Platform Name *</label><input type="text" name="venue" value={formData.venue || ''} onChange={handleChange} required placeholder="Ex: IIT Madras / NPTEL / Google Meet" /></div>
            <div className="form-group">
              <label>Level *</label>
              <select name="proof_type" value={formData.proof_type || ''} onChange={handleChange} required>
                <option value="" disabled>Select Level</option>
                <option value="National">National</option>
                <option value="International">International</option>
                <option value="State Level">State Level</option>
                <option value="Institutional Level">Institutional Level</option>
                </select>
              </div>
               <div className="form-group">
              <label>Alignment *</label>
              <select name="alignment" value={formData.alignment || ''} onChange={handleChange} required>
                <option value="" disabled>Select Alignment</option>
                <option value="NEP 2020">NEP 2020</option>
                <option value="IIC Activity">IIC Activity</option>
                <option value="NAAC / NBA Criteria">NAAC / NBA Criteria</option>
                <option value="Skill Development">Skill Development</option>
                <option value="R&D / Innovation">R&D / Innovation</option>
                <option value="Other">Other</option>
                </select>
              </div>
            <div className="form-group"><label>Start Date *</label><input type="date" name="start_date" value={formData.start_date || ''} onChange={handleChange} required /></div>
            <div className="form-group"><label>End Date</label><input type="date" name="end_date" value={formData.end_date || ''} onChange={handleChange} /></div>
            <div className="form-group"><label>Duration</label><input type="text" name="duration" value={formData.duration || ''} onChange={handleChange} placeholder="Ex: 3 Days / 15 Hours" /></div>
            <div className="form-group full-width"><label>Outcome / Skills Gained</label><textarea name="outcome_skills_gained" value={formData.outcome_skills_gained || ''} onChange={handleChange} rows="3" placeholder="Describe the outcome or skills gained (3-5 lines)"></textarea></div>

            <div className="form-group full-width proof-notice">
              <p><strong>Documentation Uploads:</strong></p>
              <div className="checkbox-group">
                <label className="select-all-label">
                
                  <input type="checkbox" onChange={(e) => handleSelectAllProofs('seminar_workshop_fdp', e.target.checked)} checked={areAllProofsSelected('seminar_workshop_fdp')} /> Select All
                </label>
                <label><input type="checkbox" name="program_certificate" checked={formData.proofs.program_certificate} onChange={handleProofChange} /> Certificate Upload (PDF / JPEG)</label>
                <label><input type="checkbox" name="report_upload" checked={formData.proofs.report_upload} onChange={handleProofChange} /> Report Upload (if available)</label>
                <label><input type="checkbox" name="screenshot_participation_proof" checked={formData.proofs.screenshot_participation_proof} onChange={handleProofChange} /> Screenshot / Participation Proof (Optional)</label>
              </div>
            </div>
            <div className="form-group full-width"><label htmlFor="file">Proof (Certificate/Brochure)</label><input type="file" id="file" name="file" onChange={handleFileChange} /></div>
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
            <option value="research_funding_project">Research Funding Project</option>
            <option value="certification">Certification</option>
            <option value="seminar_workshop_fdp">Seminar/Workshop/FDP</option>
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
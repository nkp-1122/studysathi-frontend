import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { isUploadedDocumentUrl, resolveAssetUrl } from '../services/api';
import BackIconLink from '../components/BackIconLink';
import {
  branchOptions as academicBranchOptions,
  semesterLabels,
  yearLabels,
  yearSemesterMap,
} from '../utils/academicStructure';
import { courseOptions, getCourseByKey } from '../utils/courseCatalog';

const currentYear = new Date().getFullYear();
const pyqYearOptions = Array.from(
  { length: Math.max(currentYear - 2010 + 1, 1) },
  (_, index) => String(currentYear - index)
);

const defaultBranch = academicBranchOptions.find((option) => option.value === 'CSE')?.value || academicBranchOptions[0]?.value || 'CSE';
const defaultCourse = 'btech';
const generalBranchOption = { label: 'General', value: 'GENERAL' };
const semesterOptions = [
  { label: '1st Sem', value: '1' },
  { label: '2nd Sem', value: '2' },
  { label: '3rd Sem', value: '3' },
  { label: '4th Sem', value: '4' },
  { label: '5th Sem', value: '5' },
  { label: '6th Sem', value: '6' },
  { label: '7th Sem', value: '7' },
  { label: '8th Sem', value: '8' },
];
const initialNoteFormState = {
  course: defaultCourse,
  title: '',
  topic: '',
  branch: defaultBranch,
  year: '1',
  semester: '1',
  url: '',
};

const initialPyqFormState = {
  year: String(currentYear),
  course: defaultCourse,
  branch: defaultBranch,
  semester: '1',
  title: '',
  url: '',
};

const adminEmails = ['studysathi@gmail.com', 'admin@studysathi.com'];
const documentSectionLabels = {
  notes: 'Notes',
  syllabus: 'Syllabus',
  quantum: 'Quantum',
};
const manageSectionOptions = [
  {
    value: 'notes',
    label: 'Notes',
    description: 'Search and delete uploaded notes files.',
    searchPlaceholder: 'Search notes by subject, topic, branch, year, semester, or file',
  },
  {
    value: 'pyq',
    label: 'PYQs',
    description: 'Search and delete uploaded previous years’ questions.',
    searchPlaceholder: 'Search PYQs by year, branch, semester, title, file name, or link',
  },
  {
    value: 'syllabus',
    label: 'Syllabus',
    description: 'Search and delete uploaded syllabus files.',
    searchPlaceholder: 'Search syllabus by subject, topic, branch, year, semester, or file',
  },
  {
    value: 'quantum',
    label: 'Quantum',
    description: 'Search and delete uploaded quantum files.',
    searchPlaceholder: 'Search quantum by subject, topic, branch, year, semester, or file',
  },
];

const getDocumentLabel = (contentType) => documentSectionLabels[contentType] || 'Document';
const getPyqDisplayTitle = (pyq, fallbackYear = currentYear) =>
  pyq?.title?.trim()
  || pyq?.originalFileName?.replace(/\.[^/.]+$/, '')
  || `${pyq?.branch || 'General'} Sem ${pyq?.semester || '1'} PYQ ${pyq?.year || fallbackYear}`;
const getNoteYearValue = (note) =>
  String(note?.year || '')
  || Object.entries(yearSemesterMap).find(([, semesters]) => semesters.includes(String(note?.semester || '')))?.[0]
  || '';
const getNoteYearLabel = (note) => yearLabels[getNoteYearValue(note)] || '';
const getCourseTitle = (courseKey) => getCourseByKey(courseKey)?.title || 'B.Tech';
const getCourseYearOptions = (courseKey) =>
  (getCourseByKey(courseKey)?.years || ['1']).map((value) => ({
    value,
    label: yearLabels[value] || `Year ${value}`,
  }));
const getCourseBranchOptions = (courseKey) =>
  getCourseByKey(courseKey)?.usesBranches ? academicBranchOptions : [generalBranchOption];

const sortPyqsByYear = (items) =>
  [...items].sort((first, second) => {
    const yearDiff = Number(second.year || 0) - Number(first.year || 0);
    if (yearDiff !== 0) return yearDiff;

    const semesterDiff = Number(second.semester || 0) - Number(first.semester || 0);
    if (semesterDiff !== 0) return semesterDiff;

    const branchCompare = String(first.branch || '').localeCompare(String(second.branch || ''));
    if (branchCompare !== 0) return branchCompare;

    return new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0);
  });
const sortDocumentsByRecent = (items) =>
  [...items].sort(
    (first, second) =>
      new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0)
  );
const matchesSearch = (values, query) =>
  values.some((value) => String(value || '').toLowerCase().includes(query));

function AdminPage({ user }) {
  const [contentType, setContentType] = useState('notes');
  const [noteFormData, setNoteFormData] = useState(initialNoteFormState);
  const [pyqFormData, setPyqFormData] = useState(initialPyqFormState);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [manageSection, setManageSection] = useState('notes');
  const [manageSearchTerm, setManageSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const navigate = useNavigate();

  const hasAdminEmail = useMemo(
    () => adminEmails.includes((user?.email || '').toLowerCase()),
    [user?.email]
  );
  const isAdmin = useMemo(() => Boolean(user?.isAdmin || hasAdminEmail), [user?.isAdmin, hasAdminEmail]);
  const canUpload = Boolean(user && isAdmin);
  const isDocumentMode = ['notes', 'syllabus', 'quantum'].includes(contentType);
  const isPyqMode = contentType === 'pyq';

  const totalDocuments = notes.length;
  const totalNotes = useMemo(
    () => notes.filter((note) => !note.section || note.section === 'notes').length,
    [notes]
  );
  const totalQuantum = useMemo(
    () => notes.filter((note) => note.section === 'quantum').length,
    [notes]
  );
  const totalSyllabus = useMemo(
    () => notes.filter((note) => note.section === 'syllabus').length,
    [notes]
  );
  const activeManageSection = useMemo(
    () => manageSectionOptions.find((option) => option.value === manageSection) || manageSectionOptions[0],
    [manageSection]
  );
  const noteYearOptions = useMemo(() => getCourseYearOptions(noteFormData.course), [noteFormData.course]);
  const noteBranchOptions = useMemo(() => getCourseBranchOptions(noteFormData.course), [noteFormData.course]);
  const pyqBranchOptions = useMemo(() => getCourseBranchOptions(pyqFormData.course), [pyqFormData.course]);
  const managedItems = useMemo(() => {
    const query = manageSearchTerm.trim().toLowerCase();

    if (manageSection === 'pyq') {
      const matchingPyqs = query
        ? pyqs.filter((pyq) =>
            matchesSearch(
              [pyq.year, pyq.course, pyq.branch, pyq.semester, pyq.title, pyq.originalFileName, pyq.url],
              query
            )
          )
        : pyqs;

      return sortPyqsByYear(matchingPyqs);
    }

    const matchingNotes = notes.filter((note) => {
      const noteSection = note.section || 'notes';
      if (noteSection !== manageSection) {
        return false;
      }

      if (!query) {
        return true;
      }

      return matchesSearch(
        [
          note.title,
          note.topic,
          note.course,
          note.branch,
          note.section || 'notes',
          note.year,
          note.semester,
          note.originalFileName,
        ],
        query
      );
    });

    return sortDocumentsByRecent(matchingNotes);
  }, [manageSearchTerm, manageSection, notes, pyqs]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersResponse, notesResponse, pyqsResponse] = await Promise.all([
          api.get('/auth/users'),
          api.get('/notes'),
          api.get('/pyqs'),
        ]);
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
        setNotes(Array.isArray(notesResponse.data) ? notesResponse.data : []);
        setPyqs(sortPyqsByYear(Array.isArray(pyqsResponse.data) ? pyqsResponse.data : []));
      } catch (error) {
        console.error('Failed to load admin data:', error.message);
      }
    };

    if (canUpload) {
      fetchAdminData();
    }
  }, [canUpload]);

  const handleNoteInputChange = (event) => {
    const { name, value } = event.target;

    setNoteFormData((prev) => {
      if (name === 'course') {
        const nextYearOptions = getCourseYearOptions(value);
        const nextBranchOptions = getCourseBranchOptions(value);
        const nextYear = nextYearOptions.some((item) => item.value === prev.year) ? prev.year : nextYearOptions[0]?.value || '1';
        const allowedSemesters = yearSemesterMap[nextYear] || [];
        const nextSemester = allowedSemesters.includes(prev.semester) ? prev.semester : allowedSemesters[0] || prev.semester;
        const nextBranch = nextBranchOptions.some((option) => option.value === prev.branch)
          ? prev.branch
          : nextBranchOptions[0]?.value || generalBranchOption.value;

        return {
          ...prev,
          course: value,
          branch: nextBranch,
          year: nextYear,
          semester: nextSemester,
        };
      }

      if (name === 'year') {
        const allowedSemesters = yearSemesterMap[value] || [];
        const nextSemester = allowedSemesters.includes(prev.semester) ? prev.semester : allowedSemesters[0] || prev.semester;

        return {
          ...prev,
          year: value,
          semester: nextSemester,
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handlePyqInputChange = (event) => {
    const { name, value } = event.target;

    setPyqFormData((prev) => {
      if (name === 'course') {
        const nextBranchOptions = getCourseBranchOptions(value);
        const nextBranch = nextBranchOptions.some((option) => option.value === prev.branch)
          ? prev.branch
          : nextBranchOptions[0]?.value || generalBranchOption.value;

        return {
          ...prev,
          course: value,
          branch: nextBranch,
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const resetSelectedFile = () => {
    setSelectedFile(null);
    setFileInputKey((prev) => prev + 1);
  };

  const clearAllForms = () => {
    setNoteFormData(initialNoteFormState);
    setPyqFormData(initialPyqFormState);
    resetSelectedFile();
    setUploadMessage({ type: '', text: '' });
  };

  const handleUnifiedUpload = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setUploadMessage({ type: '', text: '' });

    try {
      if (isDocumentMode) {
        const payload = {
          course: noteFormData.course,
          title: noteFormData.title.trim(),
          topic: noteFormData.topic.trim(),
          branch: noteFormData.branch,
          year: noteFormData.year,
          semester: noteFormData.semester,
          section: contentType,
          url: noteFormData.url.trim(),
        };

        if (!payload.title || !payload.topic) {
          setUploadMessage({
            type: 'danger',
            text: `Subject and topic are required for ${documentSectionLabels[contentType].toLowerCase()}.`,
          });
          return;
        }

        if (!selectedFile && !payload.url) {
          setUploadMessage({
            type: 'danger',
            text: `Upload a file or add a document link for ${documentSectionLabels[contentType].toLowerCase()}.`,
          });
          return;
        }

        const submitData = new FormData();
        submitData.append('course', payload.course);
        submitData.append('title', payload.title);
        submitData.append('topic', payload.topic);
        submitData.append('branch', payload.branch);
        submitData.append('year', payload.year);
        submitData.append('semester', payload.semester);
        submitData.append('section', payload.section);
        submitData.append('url', payload.url);

        if (selectedFile) {
          submitData.append('file', selectedFile);
        }

        const { data } = await api.post('/notes', submitData);
        setNotes((prev) => [data, ...prev]);
        setNoteFormData(initialNoteFormState);
        resetSelectedFile();
        setUploadMessage({ type: 'success', text: `${documentSectionLabels[contentType]} uploaded successfully.` });
      } else if (isPyqMode) {
        const payload = {
          year: pyqFormData.year,
          course: pyqFormData.course,
          branch: pyqFormData.branch,
          semester: pyqFormData.semester,
          title: pyqFormData.title.trim(),
          url: pyqFormData.url.trim(),
        };

        if (!payload.year) {
          setUploadMessage({ type: 'danger', text: 'Please choose a year for the PYQ upload.' });
          return;
        }

        if (!selectedFile && !payload.url) {
          setUploadMessage({ type: 'danger', text: 'Upload a file or add a document link for the PYQ.' });
          return;
        }

        const submitData = new FormData();
        submitData.append('year', payload.year);
        submitData.append('course', payload.course);
        submitData.append('branch', payload.branch);
        submitData.append('semester', payload.semester);
        submitData.append('title', payload.title);
        submitData.append('url', payload.url);

        if (selectedFile) {
          submitData.append('file', selectedFile);
        }

        const response = await api.post('/pyqs', submitData);
        const { data } = response;

        setPyqs((prev) =>
          sortPyqsByYear([data, ...prev])
        );
        setPyqFormData(initialPyqFormState);
        resetSelectedFile();
        setUploadMessage({
          type: 'success',
          text: 'PYQ uploaded successfully.',
        });
      }
    } catch (error) {
      const fallbackText = isDocumentMode
        ? `Unable to upload ${documentSectionLabels[contentType].toLowerCase()}.`
        : 'Unable to upload PYQ.';
      const errorText = !error.response
        ? 'Server not running. Start backend with: npm --prefix backend start'
        : error.response?.data?.message || fallbackText;

      setUploadMessage({ type: 'danger', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!noteId) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
      setUploadMessage({ type: 'success', text: 'Document deleted successfully.' });
    } catch (error) {
      setUploadMessage({ type: 'danger', text: error.response?.data?.message || 'Unable to delete document.' });
    }
  };

  const handleDeletePyq = async (pyqId) => {
    if (!pyqId) return;
    try {
      await api.delete(`/pyqs/${pyqId}`);
      setPyqs((prev) => prev.filter((pyq) => pyq._id !== pyqId));
      setUploadMessage({ type: 'success', text: 'PYQ deleted successfully.' });
    } catch (error) {
      setUploadMessage({ type: 'danger', text: error.response?.data?.message || 'Unable to delete PYQ.' });
    }
  };

  return (
    <main className="section admin-page" id="admin">
      <div className="container">
        <div className="panel admin-hero">
          <div>
            <span className="tag">Admin Workspace</span>
            <h2>StudySathi Admin Panel</h2>
            <p className="lead admin-lead">
              Use one upload form for Notes, Syllabus, Quantum, and Previous Years&apos; Questions, then manage each section below.
            </p>
            {canUpload ? (
              <div className="note-actions" style={{ marginTop: '18px' }}>
                <Link className="btn secondary" to="/admin/users">Registered Users</Link>
              </div>
            ) : null}
          </div>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span>Total Documents</span>
              <strong>{totalDocuments}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total PYQs</span>
              <strong>{pyqs.length}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total Notes</span>
              <strong>{totalNotes}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total Quantum</span>
              <strong>{totalQuantum}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Total Syllabus</span>
              <strong>{totalSyllabus}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Registered Users</span>
              <strong>{users.length}</strong>
            </div>
          </div>
        </div>

        {!user ? (
          <p className="danger admin-alert">
            Login first. Admin uploader will show only for `studysathi@gmail.com` or `admin@studysathi.com`.
          </p>
        ) : null}

        {user && !isAdmin ? (
          <p className="danger admin-alert">
            This email does not have admin access. Admin uploader is available .
          </p>
        ) : null}

        {canUpload ? (
          <>
            <div className="admin-layout">
              <div className="panel admin-form-panel">
                <div className="top-row">
                  <div>
                    <h3>Unified Upload</h3>
                    <p className="muted">Choose the library section you want to upload to from the drop-down menu.</p>
                  </div>
                  <span className="muted">Logged in as {user.name} (Admin)</span>
                </div>

                <form onSubmit={handleUnifiedUpload}>
                  <fieldset className="admin-fieldset">
                    <div className="admin-switcher">
                      <div className="admin-input-card">
                        <label htmlFor="contentType">Library Section</label>
                        <select
                          id="contentType"
                          value={contentType}
                          onChange={(event) => {
                            setContentType(event.target.value);
                            setUploadMessage({ type: '', text: '' });
                            resetSelectedFile();
                          }}
                        >
                          <option value="notes">Notes</option>
                          <option value="syllabus">Syllabus</option>
                          <option value="quantum">Quantum</option>
                          <option value="pyq">Previous Years&apos; Questions</option>
                        </select>
                      </div>
                    </div>

                    {isDocumentMode ? (
                      <div className="grid grid-2 admin-form-grid">
                        <div className="admin-input-card">
                          <label htmlFor="note-course">Course</label>
                          <select id="note-course" name="course" value={noteFormData.course} onChange={handleNoteInputChange}>
                            {courseOptions.map((course) => (
                              <option key={course.key} value={course.key}>{course.title}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="title">Subject</label>
                          <input id="title" name="title" type="text" value={noteFormData.title} onChange={handleNoteInputChange} />
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="topic">Topic</label>
                          <input id="topic" name="topic" type="text" value={noteFormData.topic} onChange={handleNoteInputChange} />
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="note-branch">{getCourseByKey(noteFormData.course)?.usesBranches ? 'Branch' : 'Track'}</label>
                          <select id="note-branch" name="branch" value={noteFormData.branch} onChange={handleNoteInputChange}>
                            {noteBranchOptions.map((branch) => (
                              <option key={branch.value} value={branch.value}>{branch.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="note-year">Year</label>
                          <select id="note-year" name="year" value={noteFormData.year} onChange={handleNoteInputChange}>
                            {noteYearOptions.map((item) => (
                              <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="note-semester">Semester</label>
                          <select id="note-semester" name="semester" value={noteFormData.semester} onChange={handleNoteInputChange}>
                            {(yearSemesterMap[noteFormData.year] || semesterOptions.map((item) => item.value))
                              .map((semesterValue) => semesterOptions.find((item) => item.value === semesterValue))
                              .filter(Boolean)
                              .map((item) => (
                              <option key={item.value} value={item.value}>{item.label}</option>
                              ))}
                          </select>
                        </div>
                        <div className="admin-input-card admin-input-wide">
                          <label htmlFor="file">Upload {getDocumentLabel(contentType)} File</label>
                          <input
                            key={fileInputKey}
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.html,.htm"
                            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                          />
                          <p className="muted admin-field-help">Upload PDF, DOC, DOCX, PPT, PPTX, TXT, or HTML up to 10MB.</p>
                        </div>
                        <div className="admin-input-card admin-input-wide">
                          <label htmlFor="url">Document Link</label>
                          <input id="url" name="url" type="url" value={noteFormData.url} onChange={handleNoteInputChange} />
                          <p className="muted admin-field-help">Optional if you upload a file.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-2 admin-form-grid">
                        <div className="admin-input-card">
                          <label htmlFor="pyq-course">Course</label>
                          <select id="pyq-course" name="course" value={pyqFormData.course} onChange={handlePyqInputChange}>
                            {courseOptions.map((course) => (
                              <option key={course.key} value={course.key}>{course.title}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="pyq-year">Year</label>
                          <select id="pyq-year" name="year" value={pyqFormData.year} onChange={handlePyqInputChange}>
                            {pyqYearOptions.map((year) => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="pyq-title">Title</label>
                          <input
                            id="pyq-title"
                            name="title"
                            type="text"
                            value={pyqFormData.title}
                            placeholder={`Example: DBMS PYQ ${pyqFormData.year}`}
                            onChange={handlePyqInputChange}
                          />
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="pyq-branch">{getCourseByKey(pyqFormData.course)?.usesBranches ? 'Branch' : 'Track'}</label>
                          <select id="pyq-branch" name="branch" value={pyqFormData.branch} onChange={handlePyqInputChange}>
                            {pyqBranchOptions.map((branch) => (
                              <option key={branch.value} value={branch.value}>{branch.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-input-card">
                          <label htmlFor="pyq-semester">Semester</label>
                          <select id="pyq-semester" name="semester" value={pyqFormData.semester} onChange={handlePyqInputChange}>
                            {semesterOptions.map((item) => (
                              <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-input-card admin-input-wide">
                          <label htmlFor="pyq-file">Upload PYQ File</label>
                          <input
                            key={fileInputKey}
                            id="pyq-file"
                            name="file"
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.html,.htm"
                            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                          />
                          <p className="muted admin-field-help">Upload PDF, DOC, DOCX, PPT, PPTX, TXT, or HTML up to 10MB.</p>
                        </div>
                        <div className="admin-input-card admin-input-wide">
                          <label htmlFor="pyq-url">Document Link</label>
                          <input id="pyq-url" name="url" type="url" value={pyqFormData.url} onChange={handlePyqInputChange} />
                          <p className="muted admin-field-help">Optional if you upload a file. Same year and semester me multiple PYQs upload kar sakte ho.</p>
                        </div>
                      </div>
                    )}

                    <div className="note-actions">
                      <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? 'Uploading...'
                          : isDocumentMode
                            ? `Upload ${documentSectionLabels[contentType]}`
                            : 'Upload PYQ'}
                      </button>
                      <button className="btn secondary" type="button" onClick={clearAllForms}>Clear Form</button>
                    </div>
                  </fieldset>
                  {uploadMessage.text && <p className={uploadMessage.type}>{uploadMessage.text}</p>}
                </form>
              </div>

              <div className="admin-side-column">
                <div className="panel admin-help-panel">
                  <h3>{isDocumentMode ? `${documentSectionLabels[contentType]} Preview` : 'PYQ Preview'}</h3>
                  <div className="admin-preview">
                    <span className="tag">
                      {isDocumentMode
                        ? `${getCourseTitle(noteFormData.course)} - ${noteFormData.branch} - ${yearLabels[noteFormData.year] || `Year ${noteFormData.year}`} - ${noteFormData.semester} Sem`
                        : `${getCourseTitle(pyqFormData.course)} - ${pyqFormData.branch} - ${pyqFormData.semester} Sem - PYQ ${pyqFormData.year}`}
                    </span>
                    <h4>
                      {isDocumentMode
                        ? noteFormData.title || 'Subject preview'
                        : pyqFormData.title || `${pyqFormData.branch} Sem ${pyqFormData.semester} PYQ ${pyqFormData.year}`}
                    </h4>
                    {isDocumentMode ? (
                      <>
                        <p className="muted">{noteFormData.topic || 'Topic preview will appear here while you type.'}</p>
                        <p className="muted">Course: {getCourseTitle(noteFormData.course)}</p>
                        <p className="muted">Year: {yearLabels[noteFormData.year] || `Year ${noteFormData.year}`}</p>
                        <p className="muted admin-preview-link">{selectedFile ? `Selected file: ${selectedFile.name}` : 'No file selected yet'}</p>
                        <p className="muted admin-preview-link">{noteFormData.url || 'No link added yet'}</p>
                      </>
                    ) : (
                      <>
                        <p className="muted">Course: {getCourseTitle(pyqFormData.course)}</p>
                        <p className="muted">Branch: {pyqFormData.branch}</p>
                        <p className="muted">Semester: {semesterLabels[pyqFormData.semester] || `Semester ${pyqFormData.semester}`}</p>
                        <p className="muted">Year selected: {pyqFormData.year}</p>
                        <p className="muted admin-preview-link">{selectedFile ? `Selected file: ${selectedFile.name}` : 'No file selected yet'}</p>
                        <p className="muted admin-preview-link">{pyqFormData.url || 'No link added yet'}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="panel admin-notes-panel">
                  <div className="top-row">
                    <div>
                      <h3>Registered Users</h3>
                      <p className="muted">Open a dedicated page to view and search all registered users.</p>
                    </div>
                    <span className="muted">Visible to admin only</span>
                  </div>
                  <div className="admin-preview">
                    <span className="tag">{users.length} Users</span>
                    <h4>View all registered users on a separate page.</h4>
                    <p className="muted">Name, email, role, and joined date sab ek dedicated screen par mil jayega.</p>
                    <div className="note-actions">
                      <Link className="btn secondary" to="/admin/users">Open Users Page</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel admin-notes-panel">
              <div className="top-row">
                <div>
                  <h3>Manage Library Files</h3>
                  <p className="muted">Switch between notes, PYQs, syllabus, and quantum files, then delete outdated items.</p>
                </div>
                <span className="muted">Delete access: Admin only</span>
              </div>
              <div className="admin-manage-switcher">
                {manageSectionOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`chip-btn ${manageSection === option.value ? 'active' : ''}`}
                    type="button"
                    onClick={() => {
                      setManageSection(option.value);
                      setManageSearchTerm('');
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="muted admin-manage-help">{activeManageSection.description}</p>
              <div className="admin-search-row">
                <input
                  type="text"
                  placeholder={activeManageSection.searchPlaceholder}
                  value={manageSearchTerm}
                  onChange={(event) => setManageSearchTerm(event.target.value)}
                />
                <span className="tag">{managedItems.length} results</span>
              </div>
              <div className="note-list">
                {managedItems.length ? (
                  manageSection === 'pyq' ? (
                    managedItems.map((pyq) => (
                      <div key={pyq._id || `${pyq.year}-${pyq.branch}-${pyq.semester || '0'}`} className="card">
                        <div className="note-card-tags">
                          <span className="tag">PYQ {pyq.year}</span>
                          <span className="tag">{getCourseTitle(pyq.course)}</span>
                          <span className="tag">{pyq.branch || 'Branch not set'}</span>
                          <span className="tag">{semesterLabels[pyq.semester] || `Semester ${pyq.semester || '-'}`}</span>
                          <span className="tag tag-accent">{isUploadedDocumentUrl(pyq?.url) ? 'Uploaded File' : 'External Link'}</span>
                        </div>
                        <h3 style={{ marginTop: '10px' }}>{getPyqDisplayTitle(pyq)}</h3>
                        {pyq.originalFileName ? <p className="muted">File: {pyq.originalFileName}</p> : null}
                        <p className="muted">{pyq.url ? "Open or delete this year's question file." : 'No file or link available.'}</p>
                        <div className="note-actions">
                          <a className="btn" href={resolveAssetUrl(pyq.url) || '#'} target="_blank" rel="noreferrer">Open</a>
                          {pyq._id ? (
                            <button className="btn secondary" type="button" onClick={() => handleDeletePyq(pyq._id)}>
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    managedItems.map((note, index) => (
                      <div key={note._id || `${note.title}-${index}`} className="card">
                        <div className="note-card-tags">
                          <span className="tag">{getDocumentLabel(note.section || 'notes')}</span>
                          <span className="tag">{getCourseTitle(note.course)}</span>
                          <span className="tag">{note.branch} - {getNoteYearLabel(note) || `Year ${note.year || '-'}`}</span>
                          <span className="tag">{note.semester} Sem</span>
                        </div>
                        <h3 style={{ marginTop: '10px' }}>{note.title}</h3>
                        <p className="muted">{note.topic}</p>
                        {note.originalFileName ? <p className="muted">File: {note.originalFileName}</p> : null}
                        <div className="note-actions">
                          <a className="btn" href={resolveAssetUrl(note.url) || '#'} target="_blank" rel="noreferrer">Open</a>
                          {note._id ? (
                            <button className="btn secondary" type="button" onClick={() => handleDeleteNote(note._id)}>
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="card">
                    <h3>No matching {activeManageSection.label}</h3>
                    <p className="muted">Upload a new file or change the search text.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="admin-locked-box">
            <p className="muted">Admin uploader is hidden for non-admin users.</p>
            <div className="note-actions">
              {!user ? (
                <button className="btn" type="button" onClick={() => navigate('/login')}>
                  Login as Admin
                </button>
              ) : (
                <BackIconLink to="/" label="Back to home" />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminPage;

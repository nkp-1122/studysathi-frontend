import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { isUploadedDocumentUrl, resolveAssetUrl } from '../services/api';
import {
  getAcademicSelectionFromSearch,
  normalizeBranchValue,
  semesterLabels,
  yearLabels,
  yearSemesterMap,
} from '../utils/academicStructure';
import { getCourseByKey, normalizeCourseKey } from '../utils/courseCatalog';

const semesterOptions = Object.entries(semesterLabels).map(([value, label]) => ({ value, label }));

const isWorkingLink = (url) => typeof url === 'string' && url.trim() !== '' && url !== '#';

const getSubjectName = (note) => {
  const value = typeof note?.title === 'string' ? note.title.trim() : '';
  return value || 'General Subject';
};

const getNoteTitle = (note) => {
  const topic = typeof note?.topic === 'string' ? note.topic.trim() : '';
  const originalFileName = typeof note?.originalFileName === 'string' ? note.originalFileName.trim() : '';

  if (topic) return topic;
  if (originalFileName) return originalFileName.replace(/\.[^/.]+$/, '');
  return `${getSubjectName(note)} Notes`;
};

const getSearchableText = (note) => [
  getNoteTitle(note),
  getSubjectName(note),
  note.topic || '',
  note.originalFileName || '',
  note.branch || '',
  `${note.semester || ''} sem`,
  `semester ${note.semester || ''}`,
]
  .join(' ')
  .toLowerCase();

const getNoteCourseKey = (note) => normalizeCourseKey(note?.course) || 'btech';

function NoteSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const academicSelection = useMemo(() => getAcademicSelectionFromSearch(location.search), [location.search]);
  const selectedCourse = academicSelection.course;
  const selectedCourseLabel = getCourseByKey(selectedCourse)?.title || '';
  const [notes, setNotes] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(() => academicSelection.branch);
  const [selectedYear, setSelectedYear] = useState(() => academicSelection.year);
  const [selectedSemester, setSelectedSemester] = useState(() => academicSelection.semester);
  const [statusMessage, setStatusMessage] = useState('Loading the latest notes...');

  useEffect(() => {
    let isMounted = true;

    const fetchNotes = async () => {
      try {
        const { data } = await api.get('/notes', {
          params: {
            section: 'notes',
            ...(selectedCourse ? { course: selectedCourse } : {}),
          },
        });
        if (!isMounted) {
          return;
        }

        if (Array.isArray(data) && data.length) {
          setNotes(data);
          setStatusMessage('Choose your semester to open the notes.');
          return;
        }

        setNotes([]);
        setStatusMessage('No notes uploaded yet.');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setNotes([]);
        setStatusMessage('Unable to load notes right now.');
        console.error('Failed to load notes:', error.message);
      }
    };

    fetchNotes();

    return () => {
      isMounted = false;
    };
  }, [selectedCourse]);

  useEffect(() => {
    const nextSelection = getAcademicSelectionFromSearch(location.search);
    setSelectedBranch(nextSelection.branch);
    setSelectedYear(nextSelection.year);
    setSelectedSemester(nextSelection.semester);
  }, [location.search]);

  const notesForBranch = useMemo(
    () =>
      notes.filter((note) => (
        (!selectedCourse || getNoteCourseKey(note) === selectedCourse) &&
        (!selectedBranch || normalizeBranchValue(note.branch) === selectedBranch)
      )),
    [notes, selectedBranch, selectedCourse]
  );

  const semesterCards = useMemo(() => {
    const allowedSemesters = selectedYear
      ? yearSemesterMap[selectedYear] || []
      : semesterOptions.map((semester) => semester.value);

    return semesterOptions
      .filter((semester) => allowedSemesters.includes(semester.value))
      .map((semester) => {
        const count = notesForBranch.filter((note) => String(note.semester || '') === semester.value).length;
        return { ...semester, count, disabled: count === 0 };
      });
  }, [notesForBranch, selectedYear]);

  const selectedYearLabel = useMemo(() => {
    const yearId = selectedYear || Object.entries(yearSemesterMap).find(([, semesters]) => semesters.includes(selectedSemester))?.[0] || '';
    return yearLabels[yearId] || '';
  }, [selectedSemester, selectedYear]);

  const selectedSemesterLabel = useMemo(
    () => semesterOptions.find((semester) => semester.value === selectedSemester)?.label || 'Semester',
    [selectedSemester]
  );

  const selectedNotes = useMemo(
    () =>
      notes.filter((note) => {
        const semester = String(note.semester || '');
        return (
          (!selectedCourse || getNoteCourseKey(note) === selectedCourse) &&
          (!selectedBranch || normalizeBranchValue(note.branch) === selectedBranch) &&
          (!selectedYear || yearSemesterMap[selectedYear]?.includes(semester)) &&
          (!selectedSemester || semester === selectedSemester)
        );
      }),
    [notes, selectedBranch, selectedCourse, selectedYear, selectedSemester]
  );

  const filteredNotes = selectedNotes;

  const tableNotes = useMemo(
    () =>
      [...filteredNotes].sort((left, right) => {
        const subjectCompare = getSubjectName(left).localeCompare(getSubjectName(right));
        if (subjectCompare !== 0) {
          return subjectCompare;
        }

        return getNoteTitle(left).localeCompare(getNoteTitle(right));
      }),
    [filteredNotes]
  );

  const currentStep = useMemo(() => {
    if (!selectedSemester) return 'semester';
    return 'notes';
  }, [selectedSemester]);

  const goBack = () => {
    if (currentStep === 'semester') {
      navigate(selectedCourse ? `/course/${selectedCourse}` : '/');
      return;
    }

    setSelectedSemester('');
  };

  const resetLibrary = () => {
    setSelectedYear('');
    setSelectedSemester('');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/', type: 'link' },
    { label: 'Notes', onClick: resetLibrary, type: 'button', active: currentStep === 'semester' },
    ...(selectedCourseLabel
      ? [{
          label: selectedCourseLabel,
          href: `/course/${selectedCourse}`,
          type: 'link',
        }]
      : []),
    ...(selectedYearLabel
      ? [{
          label: selectedYearLabel,
          onClick: selectedYear
            ? () => {
                setSelectedYear('');
                setSelectedSemester('');
              }
            : undefined,
          type: 'button',
          active: currentStep === 'notes',
        }]
      : []),
    ...(selectedSemester
      ? [{
          label: selectedSemesterLabel,
          onClick: () => {
            setSelectedSemester('');
          },
          type: 'button',
          active: currentStep === 'notes',
        }]
      : []),
  ];

  return (
    <section className="section library-workspace" id="notes-library">
      <div className="container">
        <div className="library-shell">
          <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            {breadcrumbItems.map((item, index) => (
              <div key={`${item.label}-${index}`} className="breadcrumb-item">
                {item.type === 'link' ? (
                  <Link to={item.href} className="breadcrumb-link">{item.label}</Link>
                ) : (
                  <button
                    type="button"
                    className={`breadcrumb-link ${item.active ? 'active' : ''}`}
                    onClick={item.onClick}
                    disabled={!item.onClick}
                  >
                    {item.label}
                  </button>
                )}
                {index < breadcrumbItems.length - 1 ? <span className="breadcrumb-separator">/</span> : null}
              </div>
            ))}
          </nav>

          <div className="library-topbar">
            <button type="button" className="back-button" onClick={goBack}>
              Back
            </button>
            <span className="library-step-badge">
              {currentStep === 'semester' && 'Step 1 of 2'}
              {currentStep === 'notes' && 'Step 2 of 2'}
            </span>
          </div>

          {currentStep !== 'notes' ? (
            <div key={currentStep} className="library-stage-card">
              <div className="selection-grid">
                {currentStep === 'semester' &&
                  semesterCards.map((semester) => (
                    <button
                      key={semester.value}
                      type="button"
                      className="selection-card"
                      onClick={() => setSelectedSemester(semester.value)}
                      disabled={semester.disabled}
                    >
                      <span className="selection-label">Semester</span>
                      <h3>{semester.label}</h3>
                      <p>{[selectedCourseLabel, selectedBranch, selectedYearLabel].filter(Boolean).join(' / ')}</p>
                      <span className="selection-action">
                        {semester.count} note{semester.count === 1 ? '' : 's'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <div className="card notes-results-card">
              <div className="notes-results-top">
                <div>
                  <h3 className="notes-results-title">Subject-wise Notes</h3>
                  <p className="muted">Search inside the selected semester and open or download the PDFs you need.</p>
                </div>
                <p className="notes-results-context">
                  {[selectedCourseLabel, selectedBranch, selectedYearLabel, selectedSemesterLabel].filter(Boolean).join(' / ')}
                </p>
              </div>

              {tableNotes.length ? (
                <div className="notes-table-wrap">
                  <div className="notes-table">
                    <div className="notes-table-head">
                      <div className="notes-table-cell notes-table-subject">Subject Name</div>
                      <div className="notes-table-cell notes-table-downloads">Downloads</div>
                    </div>

                    {tableNotes.map((note, index) => {
                      const noteUrl = resolveAssetUrl(note.url);
                      const hasLink = isWorkingLink(noteUrl);
                      const noteBranchLabel = normalizeBranchValue(note.branch) || note.branch || 'Branch';

                      return (
                        <div key={note._id || `${getSubjectName(note)}-${index}`} className="notes-table-row">
                          <div className="notes-table-cell notes-table-subject">
                            <h4>{getSubjectName(note)}</h4>
                            <p>{getNoteTitle(note)}</p>
                            <span>
                              {noteBranchLabel} - {note.semester} Semester
                              {note.originalFileName ? ` | ${note.originalFileName}` : ''}
                              {isUploadedDocumentUrl(note?.url) ? ' | PDF Ready' : ''}
                            </span>
                          </div>
                          <div className="notes-table-cell notes-table-downloads">
                            {hasLink ? (
                              <a className="notes-download-link" href={noteUrl} target="_blank" rel="noreferrer">
                                Open Link
                              </a>
                            ) : (
                              <span className="notes-download-link disabled">Open Link</span>
                            )}
                            {hasLink ? (
                              <a
                                className="notes-download-link secondary"
                                href={noteUrl}
                                download={note.originalFileName || `${getNoteTitle(note)}.pdf`}
                              >
                                Download
                              </a>
                            ) : (
                              <span className="notes-download-link secondary disabled">Download</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="card notes-empty-card">
                  <h3>No notes found for this selection.</h3>
                  <p className="muted">Try a different search term or go back and choose another semester.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default NoteSearchPage;

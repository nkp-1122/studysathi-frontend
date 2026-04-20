import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { resolveAssetUrl } from '../services/api';
import BackIconLink from '../components/BackIconLink';
import {
  getAcademicSelectionFromSearch,
  getResourceSemestersRoute,
  semesterLabels,
  yearLabels,
} from '../utils/academicStructure';
import { getCourseByKey, normalizeCourseKey } from '../utils/courseCatalog';

const fallbackPyqs = Array.from({ length: 11 }, (_, index) => {
  const year = String(2025 - index);

  return {
    year,
    title: `${year} Previous Year Questions`,
  };
});

const isUsableUrl = (value) => typeof value === 'string' && value.trim() !== '' && value.trim() !== '#';
const getPyqDisplayTitle = (pyq, fallbackYear) =>
  pyq?.title?.trim()
  || pyq?.originalFileName?.replace(/\.[^/.]+$/, '')
  || `${pyq?.branch || 'General'} Sem ${pyq?.semester || '1'} PYQ ${fallbackYear}`;
const getPyqCourseKey = (pyq) => normalizeCourseKey(pyq?.course) || 'btech';
const resolvePyqMatches = ({ items, year, branch, semester }) => {
  const yearMatches = items.filter((item) => String(item?.year || '') === year);

  if (!yearMatches.length) {
    return [];
  }

  const branchMatches = branch
    ? yearMatches.filter((item) => String(item?.branch || '').toUpperCase() === branch)
    : yearMatches;

  if (!branchMatches.length) {
    if (!semester) {
      return yearMatches;
    }

    return yearMatches.filter((item) => !String(item?.semester || '').trim());
  }

  if (!semester) {
    return branchMatches;
  }

  const exactMatches = branchMatches.filter((item) => String(item?.semester || '') === semester);
  if (exactMatches.length) {
    return exactMatches;
  }

  return branchMatches.filter((item) => !String(item?.semester || '').trim());
};

function PreviousQuestionsPage() {
  const location = useLocation();
  const academicSelection = useMemo(() => getAcademicSelectionFromSearch(location.search), [location.search]);
  const selectedCourseLabel = getCourseByKey(academicSelection.course)?.title || '';
  const [selectedPyqYear, setSelectedPyqYear] = useState('2025');
  const [uploadedPyqs, setUploadedPyqs] = useState([]);

  const selectedAcademicYearLabel = yearLabels[academicSelection.year] || '';
  const selectedAcademicSemesterLabel = semesterLabels[academicSelection.semester] || '';
  const academicContext = [selectedCourseLabel, academicSelection.branch, selectedAcademicYearLabel, selectedAcademicSemesterLabel]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    let isMounted = true;

    const fetchPyqs = async () => {
      try {
        const { data } = await api.get('/pyqs', {
          params: academicSelection.course ? { course: academicSelection.course } : {},
        });
        if (isMounted) {
          setUploadedPyqs(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setUploadedPyqs([]);
        }
      }
    };

    fetchPyqs();

    return () => {
      isMounted = false;
    };
  }, [academicSelection.course]);

  const selectedUploads = useMemo(() => {
    const filteredItems = resolvePyqMatches({
      items: uploadedPyqs.filter((item) => !academicSelection.course || getPyqCourseKey(item) === academicSelection.course),
      year: selectedPyqYear,
      branch: academicSelection.branch,
      semester: academicSelection.semester,
    });

    return [...filteredItems].sort((first, second) => {
      const updatedTimeDiff = new Date(second.updatedAt || second.createdAt || 0) - new Date(first.updatedAt || first.createdAt || 0);
      if (updatedTimeDiff !== 0) return updatedTimeDiff;

      return getPyqDisplayTitle(first, selectedPyqYear).localeCompare(getPyqDisplayTitle(second, selectedPyqYear));
    });
  }, [academicSelection.branch, academicSelection.semester, selectedPyqYear, uploadedPyqs]);
  const selectedTitle = `${selectedPyqYear} Previous Year Questions`;
  const selectedDescription = selectedUploads.length
    ? academicSelection.branch && academicSelection.semester
      ? `${selectedUploads.length} PYQ${selectedUploads.length > 1 ? 's are' : ' is'} available for the selected branch and semester.`
      : `${selectedUploads.length} PYQ${selectedUploads.length > 1 ? 's are' : ' is'} available for this year.`
    : academicSelection.branch && academicSelection.semester
      ? 'No uploaded PYQs are available for the selected branch and semester yet.'
      : 'No uploaded PYQs are available for this year yet.';

  const backHref = academicSelection.year
    ? getResourceSemestersRoute(academicSelection.year, 'pyq', {
        course: academicSelection.course,
        branch: academicSelection.branch,
      })
    : academicSelection.course ? `/course/${academicSelection.course}` : '/';
  const isBackHome = !academicSelection.year && !academicSelection.course;
  const backLabel = academicSelection.year ? 'Back to Semesters' : academicSelection.course ? 'Back to Course' : '';

  return (
    <section className="section" id="pyq-page">
      <div className="container">
        <h2>Previous Year Questions</h2>
        <p className="lead">
          {academicContext ? `${academicContext} selected. ` : ''}
          Choose any PYQ year from 2015 to 2025.
        </p>

        <div className="panel" style={{ marginBottom: '22px' }}>
          <h3>Select PYQ Year</h3>
          <p className="muted">Year select karne ke baad isi page par PDF actions show honge.</p>
          <div className="quick-links">
            {fallbackPyqs.map((pyq) => (
              <button
                key={pyq.year}
                type="button"
                className={`chip-btn ${selectedPyqYear === pyq.year ? 'active' : ''}`}
                onClick={() => setSelectedPyqYear(pyq.year)}
              >
                {pyq.year}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="note-card-tags">
            <span className="tag tag-accent">PYQ</span>
            <span className="tag">{selectedPyqYear}</span>
          </div>
          <h3>{selectedTitle}</h3>
          <p className="muted">{selectedDescription}</p>

          <div className="notes-table-wrap" style={{ marginTop: '20px' }}>
            <div className="notes-table">
              <div className="notes-table-head">
                <div className="notes-table-cell notes-table-subject">Question Paper</div>
                <div className="notes-table-cell notes-table-downloads">Downloads</div>
              </div>

              {selectedUploads.length ? (
                selectedUploads.map((pyq) => {
                  const pyqUrl = resolveAssetUrl(pyq?.url);
                  const pyqTitle = getPyqDisplayTitle(pyq, selectedPyqYear);
                  const pyqDownloadName = pyq?.originalFileName || `${pyqTitle}.pdf`;

                  return (
                    <div
                      key={pyq._id || `${pyq.year}-${pyq.branch}-${pyq.semester}-${pyqTitle}`}
                      className="notes-table-row"
                    >
                      <div className="notes-table-cell notes-table-subject">
                        <h4>{pyqTitle}</h4>
                      </div>

                      <div className="notes-table-cell notes-table-downloads">
                        {pyqUrl ? (
                          <a className="notes-download-link" href={pyqUrl} target="_blank" rel="noreferrer">
                            Open Link
                          </a>
                        ) : (
                          <span className="notes-download-link disabled">Open Link</span>
                        )}

                        {pyqUrl ? (
                          <a className="notes-download-link secondary" href={pyqUrl} download={pyqDownloadName}>
                            Download
                          </a>
                        ) : (
                          <span className="notes-download-link secondary disabled">Download</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="notes-table-row">
                  <div className="notes-table-cell notes-table-subject">
                    <h4>{selectedTitle}</h4>
                  </div>

                  <div className="notes-table-cell notes-table-downloads">
                    <span className="notes-download-link disabled">Open Link</span>
                    <span className="notes-download-link secondary disabled">Download</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="note-actions" style={{ justifyContent: 'center', marginTop: '24px' }}>
          {isBackHome ? (
            <BackIconLink to={backHref} label="Back to home" />
          ) : (
            <Link className="btn secondary" to={backHref}>
              {backLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default PreviousQuestionsPage;

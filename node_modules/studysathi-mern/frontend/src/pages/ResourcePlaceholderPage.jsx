import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { resolveAssetUrl } from '../services/api';
import BackIconLink from '../components/BackIconLink';
import {
  getAcademicSelectionFromSearch,
  getResourceDestination,
  getResourceSemestersRoute,
  normalizeBranchValue,
  semesterLabels,
  yearLabels,
  yearSemesterMap,
} from '../utils/academicStructure';
import { getCourseByKey, normalizeCourseKey } from '../utils/courseCatalog';

const isWorkingLink = (url) => typeof url === 'string' && url.trim() !== '' && url !== '#';
const getItemCourseKey = (item) => normalizeCourseKey(item?.course) || 'btech';

function ResourcePlaceholderPage({ resourceKey, title, description }) {
  const location = useLocation();
  const {
    branch: selectedBranch,
    course: selectedCourse,
    year: selectedYear,
    semester: selectedSemester,
  } = getAcademicSelectionFromSearch(location.search);
  const [items, setItems] = useState([]);
  const selectedCourseLabel = getCourseByKey(selectedCourse)?.title || '';
  const selectedYearLabel = yearLabels[selectedYear] || '';
  const selectedSemesterLabel = semesterLabels[selectedSemester] || '';
  const selectedContext = [selectedCourseLabel, selectedBranch, selectedYearLabel, selectedSemesterLabel].filter(Boolean).join(' ');
  const notesHref = getResourceDestination('notes', {
    course: selectedCourse,
    branch: selectedBranch,
    year: selectedYear,
    semester: selectedSemester,
  });
  const backHref = selectedYear && resourceKey
    ? getResourceSemestersRoute(selectedYear, resourceKey, { course: selectedCourse, branch: selectedBranch })
    : selectedCourse ? `/course/${selectedCourse}` : '/';
  const isBackHome = !selectedYear && !selectedCourse;
  const backLabel = selectedYear && resourceKey ? 'Back to Semesters' : selectedCourse ? 'Back to Course' : '';
  const allowedSemesters = yearSemesterMap[selectedYear] || [];

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      try {
        const { data } = await api.get('/notes', {
          params: {
            section: resourceKey,
            ...(selectedCourse ? { course: selectedCourse } : {}),
          },
        });

        if (isMounted) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setItems([]);
        }
        console.error(`Failed to load ${resourceKey}:`, error.message);
      }
    };

    if (resourceKey) {
      fetchItems();
    }

    return () => {
      isMounted = false;
    };
  }, [resourceKey, selectedCourse]);

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const branch = normalizeBranchValue(item?.branch);
        const semester = String(item?.semester || '');

        return (
          (!selectedCourse || getItemCourseKey(item) === selectedCourse) &&
          (!selectedBranch || branch === selectedBranch) &&
          (!selectedSemester || semester === selectedSemester) &&
          (!selectedYear || allowedSemesters.includes(semester))
        );
      }),
    [allowedSemesters, items, selectedBranch, selectedCourse, selectedSemester, selectedYear]
  );

  return (
    <section className="notes-home">
      <div className="container">
        <div className="notes-home-shell">
          <span className="notes-kicker">{selectedContext ? `${selectedContext} ${title}` : title}</span>
          <h1>{selectedContext ? `${selectedContext} ${title}` : `${title} Section`}</h1>
          <p className="notes-home-copy">
            {selectedContext ? `${selectedContext} selected from the previous page. ` : ''}
            {description}
          </p>

          {visibleItems.length ? (
            <div className="notes-table-wrap" style={{ marginTop: '24px' }}>
              <div className="notes-table">
                <div className="notes-table-head">
                  <div className="notes-table-cell notes-table-subject">Subject Name</div>
                  <div className="notes-table-cell notes-table-downloads">Downloads</div>
                </div>

                {visibleItems.map((item, index) => {
                  const itemUrl = resolveAssetUrl(item.url);
                  const hasLink = isWorkingLink(itemUrl);
                  const itemBranchLabel = normalizeBranchValue(item.branch) || item.branch || 'Branch';

                  return (
                    <div key={item._id || `${item.title}-${index}`} className="notes-table-row">
                      <div className="notes-table-cell notes-table-subject">
                        <h4>{item.title || `${title} File`}</h4>
                        <p>{item.topic || `${title} document`}</p>
                        <span>
                          {itemBranchLabel} - {item.semester} Semester
                          {item.originalFileName ? ` | ${item.originalFileName}` : ''}
                        </span>
                      </div>
                      <div className="notes-table-cell notes-table-downloads">
                        {hasLink ? (
                          <a className="notes-download-link" href={itemUrl} target="_blank" rel="noreferrer">
                            Open Link
                          </a>
                        ) : (
                          <span className="notes-download-link disabled">Open Link</span>
                        )}
                        {hasLink ? (
                          <a
                            className="notes-download-link secondary"
                            href={itemUrl}
                            download={item.originalFileName || `${item.title || title}.pdf`}
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
            <div className="grid grid-2">
              <div className="card">
                <h3>Available Soon</h3>
                <p className="muted">
                  This section is now live on the home page and ready for content. You can add uploads or study material here next.
                </p>
              </div>
              <div className="card">
                <h3>Best For</h3>
                <p className="muted">
                  Use this space for branch-wise PDFs, unit resources, quick revision files, or semester study material.
                </p>
              </div>
            </div>
          )}

          <div className="note-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
            {isBackHome ? (
              <BackIconLink to={backHref} label="Back to home" />
            ) : (
              <Link to={backHref} className="btn">{backLabel}</Link>
            )}
            <Link to={notesHref} className="btn secondary">Open Notes</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResourcePlaceholderPage;

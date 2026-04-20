import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import BackIconLink from '../components/BackIconLink';
import {
  getAcademicSelectionFromSearch,
  getResourceBranchesRoute,
  getResourceDestination,
  resourceCatalog,
  getResourceSemestersRoute,
  semesterLabels,
  shouldOpenBranchSelection,
  yearLabels,
  yearSemesterMap,
} from '../utils/academicStructure';
import { getCourseByKey } from '../utils/courseCatalog';

function SemesterIcon() {
  return (
    <svg viewBox="0 0 64 64" className="resource-icon" aria-hidden="true">
      <rect x="14" y="12" width="36" height="40" rx="6" />
      <line x1="23" y1="24" x2="41" y2="24" />
      <line x1="23" y1="32" x2="41" y2="32" />
      <line x1="23" y1="40" x2="35" y2="40" />
      <circle cx="50" cy="18" r="8" fill="currentColor" stroke="none" />
      <path d="M47 18h6" />
      <path d="M50 15v6" />
    </svg>
  );
}

function SemesterResourcePage() {
  const location = useLocation();
  const { yearId, resourceKey } = useParams();
  const { branch, course: selectedCourse } = getAcademicSelectionFromSearch(location.search);
  const yearLabel = yearLabels[yearId];
  const resource = resourceCatalog[resourceKey];
  const course = getCourseByKey(selectedCourse);
  const semesters = yearSemesterMap[yearId] || [];
  const showBranchNavigation = shouldOpenBranchSelection(selectedCourse, yearId);
  const backHref = showBranchNavigation
    ? getResourceBranchesRoute(yearId, resourceKey, { course: selectedCourse })
    : `/year/${yearId}?course=${selectedCourse}`;

  if (!course || !yearLabel || !resource || !semesters.length || !course.years.includes(yearId)) {
    return <Navigate to={course ? `/course/${course.key}` : '/'} replace />;
  }

  return (
    <section className="section resource-section">
      <div className="container">
        <div className="year-resource-toolbar">
          <div className="semester-page-tags">
            <span className="tag tag-accent">{course.title}</span>
            <span className="tag tag-accent">{yearLabel}</span>
            <span className="tag">{resource.title}</span>
            {branch ? <span className="tag">{branch}</span> : null}
          </div>
          <BackIconLink to={backHref} label={showBranchNavigation ? 'Back to branches' : 'Back to resources'} />
        </div>

        <div className="resource-page-copy">
          <h2>{course.title} {resource.title} Semester Page</h2>
          <p className="lead">
            Choose the semester for
            {' '}
            {branch ? `${branch} ${yearLabel}` : yearLabel}
            {' '}
            in {course.title}. After that, the selected {resource.title.toLowerCase()} page will open.
          </p>
        </div>

        <div className="resource-grid semester-grid">
          {semesters.map((semesterId) => (
            <Link
              key={semesterId}
              to={getResourceDestination(resourceKey, {
                course: selectedCourse,
                branch,
                year: yearId,
                semester: semesterId,
              })}
              className="resource-card"
            >
              <div className="resource-icon-wrap">
                <SemesterIcon />
              </div>
              <h3>{semesterLabels[semesterId]}</h3>
              <p className="resource-subtitle">
                {branch ? `${branch} - ${resource.title}` : `${course.title} - ${yearLabel} - ${resource.title}`}
              </p>
              <div className="resource-status">
                <span className="resource-status-line"></span>
                <span className="resource-status-text">open semester</span>
                <span className="resource-status-line"></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SemesterResourcePage;

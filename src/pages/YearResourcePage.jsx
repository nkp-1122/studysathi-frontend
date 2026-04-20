import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import BackIconLink from '../components/BackIconLink';
import {
  getAcademicSelectionFromSearch,
  getResourceBranchesRoute,
  getResourceSemestersRoute,
  resourceCards,
  shouldOpenBranchSelection,
  yearLabels,
} from '../utils/academicStructure';
import { getCourseByKey } from '../utils/courseCatalog';

function ResourceIcon({ type }) {
  if (type === 'syllabus') {
    return (
      <svg viewBox="0 0 64 64" className="resource-icon" aria-hidden="true">
        <rect x="16" y="10" width="32" height="42" rx="4" />
        <line x1="24" y1="21" x2="40" y2="21" />
        <line x1="24" y1="31" x2="40" y2="31" />
        <line x1="24" y1="41" x2="36" y2="41" />
        <circle cx="21" cy="21" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="21" cy="31" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="21" cy="41" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (type === 'notes') {
    return (
      <svg viewBox="0 0 64 64" className="resource-icon" aria-hidden="true">
        <path d="M22 10h15l11 11v31a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" />
        <path d="M37 10v11h11" />
        <path d="M24 44l4-10 10 10-10 4h-4Z" />
        <line x1="29" y1="29" x2="40" y2="29" />
      </svg>
    );
  }

  if (type === 'quantum') {
    return (
      <svg viewBox="0 0 64 64" className="resource-icon" aria-hidden="true">
        <rect x="18" y="10" width="28" height="44" rx="3" />
        <line x1="24" y1="23" x2="40" y2="23" />
        <line x1="24" y1="31" x2="40" y2="31" />
        <line x1="24" y1="39" x2="40" y2="39" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="resource-icon" aria-hidden="true">
      <path d="M22 10h15l11 11v31a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Z" />
      <path d="M37 10v11h11" />
      <line x1="26" y1="31" x2="40" y2="31" />
      <line x1="26" y1="39" x2="40" y2="39" />
    </svg>
  );
}

function YearResourcePage() {
  const location = useLocation();
  const { yearId } = useParams();
  const { course: selectedCourse } = getAcademicSelectionFromSearch(location.search);
  const yearLabel = yearLabels[yearId] || 'Selected Year';
  const course = getCourseByKey(selectedCourse);
  const opensBranchSelection = shouldOpenBranchSelection(selectedCourse, yearId);
  const getNextRoute = (resourceKey) => (
    opensBranchSelection
      ? getResourceBranchesRoute(yearId, resourceKey, { course: selectedCourse })
      : getResourceSemestersRoute(yearId, resourceKey, { course: selectedCourse })
  );

  if (!course || !course.years.includes(yearId)) {
    return <Navigate to={course ? `/course/${course.key}` : '/'} replace />;
  }

  return (
    <section className="section resource-section">
      <div className="container">
        <div className="year-resource-toolbar">
          <div className="semester-page-tags">
            <span className="tag tag-accent">{course.title}</span>
            <span className="tag">{yearLabel}</span>
          </div>
          <BackIconLink to={`/course/${course.key}`} label="Back to course" />
        </div>

        <div className="resource-page-copy">
          <h2>{course.title} {yearLabel} Resources</h2>
          <p className="lead">
            Choose one option below. Each card opens
            {' '}
            {opensBranchSelection ? 'a branch page' : 'a semester page'}
            {' '}
            for this selected year in {course.title}.
          </p>
        </div>

        <div className="resource-grid">
          {resourceCards.map((card) => (
            <Link key={card.key} to={getNextRoute(card.key)} className="resource-card">
              <div className="resource-icon-wrap">
                <ResourceIcon type={card.key} />
              </div>
              <h3>{card.title}</h3>
              <p className="resource-subtitle">{card.description}</p>
              <div className="resource-status">
                <span className="resource-status-line"></span>
                <span className="resource-status-text">available</span>
                <span className="resource-status-line"></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default YearResourcePage;

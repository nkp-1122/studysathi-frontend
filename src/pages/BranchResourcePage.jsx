import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import BackIconLink from '../components/BackIconLink';
import {
  branchOptions,
  getAcademicSelectionFromSearch,
  getResourceSemestersRoute,
  resourceCatalog,
  shouldOpenBranchSelection,
  yearLabels,
} from '../utils/academicStructure';
import { getCourseByKey } from '../utils/courseCatalog';

function BranchResourcePage() {
  const location = useLocation();
  const { yearId, resourceKey } = useParams();
  const { course: selectedCourse } = getAcademicSelectionFromSearch(location.search);
  const yearLabel = yearLabels[yearId];
  const resource = resourceCatalog[resourceKey];
  const course = getCourseByKey(selectedCourse);
  const needsBranchSelection = shouldOpenBranchSelection(selectedCourse, yearId);

  if (!course || !yearLabel || !resource || !course.years.includes(yearId)) {
    return <Navigate to={course ? `/course/${course.key}` : '/'} replace />;
  }

  if (!needsBranchSelection) {
    return (
      <Navigate
        to={yearId && resourceKey ? getResourceSemestersRoute(yearId, resourceKey, { course: selectedCourse }) : '/'}
        replace
      />
    );
  }

  return (
    <section className="section resource-section">
      <div className="container">
        <div className="year-resource-toolbar">
          <div className="semester-page-tags">
            <span className="tag tag-accent">{course.title}</span>
            <span className="tag tag-accent">{yearLabel}</span>
            <span className="tag">{resource.title}</span>
          </div>
          <BackIconLink to={`/year/${yearId}?course=${course.key}`} label="Back to resources" />
        </div>

        <div className="resource-page-copy">
          <h2>Select Your Branch</h2>
          <p className="lead">
            Choose your branch for {course.title} {yearLabel} {resource.title.toLowerCase()}. After that, the semester page will open.
          </p>
        </div>

        <div className="card branch-list-shell">
          <div className="branch-list">
            {branchOptions.map((branch) => (
              <Link
                key={branch.value}
                to={getResourceSemestersRoute(yearId, resourceKey, { course: selectedCourse, branch: branch.value })}
                className="branch-row-card"
              >
                <div className="branch-row-copy">
                  <span className="selection-label">Branch</span>
                  <h3>{branch.label}</h3>
                  <p>{course.title} - {yearLabel} - {resource.title}</p>
                </div>
                <span className="selection-action">Open Semesters</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BranchResourcePage;

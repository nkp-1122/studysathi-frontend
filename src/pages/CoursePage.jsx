import { Link, Navigate, useParams } from 'react-router-dom';
import BackIconLink from '../components/BackIconLink';
import {
  courseOptions,
  getCourseDurationLabel,
  getCourseYearAccessCards,
} from '../utils/courseCatalog';

function CourseIcon() {
  return (
    <svg viewBox="0 0 64 64" className="resource-icon" aria-hidden="true">
      <circle cx="32" cy="16" r="8" fill="currentColor" stroke="none" />
      <path d="M20 28l12 4 12-4v24l-12-4-12 4Z" />
      <line x1="32" y1="32" x2="32" y2="48" />
    </svg>
  );
}

function CoursePage() {
  const { courseKey } = useParams();
  const course = courseOptions.find((item) => item.key === courseKey);
  const yearCards = getCourseYearAccessCards(courseKey);

  if (!course) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="section resource-section">
      <div className="container">
        <div className="course-page-shell">
          <div className="year-resource-toolbar">
            <span className="tag tag-accent">{course.title}</span>
            <BackIconLink to="/" label="Back to home" />
          </div>

          <div className="course-page-summary">
            <div>
              <span className="course-page-kicker">Course Workspace</span>
              <h2>{course.title} Resources</h2>
              <p className="lead">
                {course.usesBranches
                  ? 'Choose one year below to open notes, PYQs, syllabus, and quantum resources. Selected years will also show branch and semester access.'
                  : `Choose one year below to open semester-wise notes, PYQs, syllabus, and quantum resources for ${course.title}.`}
              </p>
            </div>
            <div className="course-page-meta">
              <span className="tag">{getCourseDurationLabel(course.key)}</span>
            </div>
          </div>

          <div className="year-card-grid course-year-grid">
            {yearCards.map((card) => (
              <Link key={card.key} to={card.href} className="year-card course-year-card">
                <span className="course-card-badge">Year Access</span>
                <div className="resource-icon-wrap">
                  <CourseIcon />
                </div>
                <h3>{card.title}</h3>
                <p className="year-card-subtitle">{card.description}</p>
                <div className="resource-status">
                  <span className="resource-status-line"></span>
                  <span className="resource-status-text">available</span>
                  <span className="resource-status-line"></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CoursePage;

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SupportEmailActions from '../components/SupportEmailActions';
import { courseOptions, getCourseDurationLabel } from '../utils/courseCatalog';
import {
  supportEmail,
  supportEmailComposeHref,
  supportInstagramHref,
  supportWhatsappHref,
} from '../utils/supportLinks';

const studyFeatureCards = [
  {
    label: 'Notes',
    title: 'Notes Library',
    description: 'Semester-ready notes in a cleaner flow.',
    href: '/notes/explore',
    action: 'Open Notes',
  },
  {
    label: 'PYQ',
    title: 'PYQ Practice',
    description: 'Practice exam patterns before finals.',
    href: '/pyq',
    action: 'View PYQ',
  },
  {
    label: 'Syllabus',
    title: 'Syllabus Track',
    description: 'Stay clear on units, topics, and focus.',
    href: '/syllabus',
    action: 'Check Syllabus',
  },
  {
    label: 'Help',
    title: 'Student Help',
    description: 'Get help with routes, resources, and exam confusion.',
    href: '/help',
    action: 'Open Help',
  },
];

const studySteps = [
  {
    step: '01',
    title: 'Choose your course',
    description: 'Open the right course hub first so your year, semester, and resources stay relevant.',
  },
  {
    step: '02',
    title: 'Pick year and semester',
    description: 'Move through a simple academic flow instead of searching random links and folders.',
  },
  {
    step: '03',
    title: 'Open notes and revise',
    description: 'Download notes, practice PYQs, and use quantum or syllabus support from one place.',
  },
];

function getCourseTrackItems(course) {
  return course.resourceTrack.split(' / ');
}

function YearAccessIcon() {
  return (
    <svg viewBox="0 0 64 64" className="resource-icon" aria-hidden="true">
      <circle cx="32" cy="16" r="8" fill="currentColor" stroke="none" />
      <path d="M20 28l12 4 12-4v24l-12-4-12 4Z" />
      <line x1="32" y1="32" x2="32" y2="48" />
    </svg>
  );
}

function HomePage({ user, onLogout }) {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedDark = localStorage.getItem('studysathi_dark') === 'true';
    setIsDark(savedDark);
    document.body.classList.toggle('dark', savedDark);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);

    if (pathname === '/contact') {
      window.requestAnimationFrame(() => {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1080) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const toggleDarkMode = () => {
    const nextValue = !isDark;
    setIsDark(nextValue);
    localStorage.setItem('studysathi_dark', String(nextValue));
    document.body.classList.toggle('dark', nextValue);
  };

  const logout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  return (
    <>
      <header>
        <div className="container">
          <nav>
            <Link to="/" className="brand" onClick={closeMenu}>StudySathi Pro</Link>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={isMenuOpen ? 'true' : 'false'}
              aria-controls="site-navigation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="menu-toggle-icon"></span>
            </button>

            <div id="site-navigation" className={`nav-shell ${isMenuOpen ? 'open' : ''}`}>
              <ul className="nav-links">
                <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                <li><Link to="/notes/explore" onClick={closeMenu}>Notes</Link></li>
                <li><Link to="/pyq" onClick={closeMenu}>PYQ</Link></li>
                <li><Link to="/syllabus" onClick={closeMenu}>Syllabus</Link></li>
                <li><Link to="/quantum" onClick={closeMenu}>Quantum</Link></li>
                <li><Link to="/help" onClick={closeMenu}>Help</Link></li>
                <li><Link to="/admin" onClick={closeMenu}>Admin</Link></li>
                <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
              </ul>

              <div className="nav-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    toggleDarkMode();
                    closeMenu();
                  }}
                >
                  {isDark ? 'Light' : 'Dark'}
                </button>
                {user ? (
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn secondary" onClick={closeMenu}>Login</Link>
                    <Link to="/signup" className="btn secondary" onClick={closeMenu}>Signup</Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero home-hero" id="home">
          <div className="container hero-grid">
            <div className="home-hero-copy">
              <span className="tag">Student Platform</span>
              <span className="home-kicker">Notes, PYQs, syllabus, quantum, and student support in one place.</span>
              <h1>Study smarter every semester with one clean academic workspace.</h1>
              <p>
                StudySathi helps students find the right notes, previous year questions, syllabus support,
                and revision material without jumping between scattered links and random folders.
              </p>
              <div className="note-actions hero-actions">
                <Link to="/notes/explore" className="btn">Browse Notes</Link>
                <Link to="/help" className="btn secondary">Get Help</Link>
              </div>
              <div className="hero-quick-strip">
                <span className="quick-pill">Semester-based flow</span>
                <span className="quick-pill">Mobile-friendly UI</span>
                <span className="quick-pill">Student support ready</span>
              </div>
            </div>

            <div className="hero-card home-summary-card home-hero-panel">
              <span className="home-panel-kicker">Study Sprint Blueprint</span>
              <h3>Start your preparation in three clear steps.</h3>
              <div className="hero-plan-list">
                {studySteps.map((item) => (
                  <div key={item.step} className="hero-plan-item">
                    <span className="hero-plan-step">{item.step}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hero-stats home-summary-grid">
                <div className="stat"><strong>24/7</strong>Access</div>
                <div className="stat"><strong>Fast</strong>Search</div>
                <div className="stat"><strong>Guided</strong>Flow</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section resource-section course-showcase-section" id="resources">
          <div className="container container-wide">
            <div className="course-showcase-shell">
              <div className="course-showcase-head">
                <div className="course-showcase-copy">
                  <span className="tag">Courses</span>
                  <h2>Choose Your Course</h2>
                  <p className="lead">
                    Pick one course hub and continue with the same clean study flow.
                  </p>
                </div>

                <div className="course-showcase-stats" aria-label="StudySathi course highlights">
                  <div className="course-showcase-stat">
                    <strong>6</strong>
                    <span>Course hubs</span>
                  </div>
                  <div className="course-showcase-stat">
                    <strong>Same</strong>
                    <span>Clean flow</span>
                  </div>
                  <div className="course-showcase-stat">
                    <strong>Fast</strong>
                    <span>Mobile access</span>
                  </div>
                </div>
              </div>

              <div className="course-selector-grid">
                {courseOptions.map((course) => (
                  <Link
                    key={course.key}
                    to={`/course/${course.key}`}
                    className="course-card"
                  >
                    <div className="course-card-top">
                      <span className="course-card-badge">Course Hub</span>
                      <span className="course-card-meta">
                        {getCourseDurationLabel(course.key)}
                      </span>
                    </div>
                    <div className="course-card-main">
                      <div className="course-card-visual">
                        <div className="resource-icon-wrap course-card-icon">
                          <YearAccessIcon />
                        </div>
                      </div>
                      <div className="course-card-copy">
                        <h3>{course.title}</h3>
                        <p className="course-card-summary">{course.description}</p>
                      </div>
                    </div>
                    <div className="course-card-tags">
                      {getCourseTrackItems(course).map((item) => (
                        <span key={item} className="course-card-chip">{item}</span>
                      ))}
                    </div>
                    <div className="course-card-footer">
                      <span className="course-card-action">Explore</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section home-study-section" id="study-tools">
          <div className="container container-wide">
            <span className="tag">Study Tools</span>
            <div className="resource-section-copy">
              <h2>Built Around Real Study Needs</h2>
              <p className="lead">
                Daily study tasks, quick practice, and support all stay simple on every screen.
              </p>
            </div>

            <div className="home-feature-grid">
              {studyFeatureCards.map((card) => (
                <Link key={card.title} to={card.href} className="home-feature-card">
                  <span className="home-feature-label">{card.label}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <span className="selection-action">{card.action}</span>
                </Link>
              ))}
            </div>

            <div className="support-banner">
              <div>
                <span className="home-feature-label">Need Help Fast?</span>
                <h3>Missing file, wrong semester, or account issue?</h3>
                <p className="muted">
                  Use the help center or contact support directly. Mention your course, year, semester, and what you were trying to open.
                </p>
              </div>
              <div className="note-actions support-banner-actions">
                <Link to="/help" className="btn">Open Help Center</Link>
                <Link to="/contact" className="btn secondary">Contact Support</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container container-wide">
            <span className="tag">Let&apos;s Connect</span>
            <div className="contact-shell">
              <div className="contact-intro-card">
                <span className="contact-kicker">Need notes, PYQ, syllabus, or quantum help?</span>
                <h2>Talk to StudySathi Directly</h2>
                <p className="contact-copy">
                  Reach out for student support, resource links, password issues, or general help. The fastest replies usually come on WhatsApp.
                </p>
                <div className="contact-highlights">
                  <div className="contact-highlight">
                    <strong>Fast Replies</strong>
                    <span>Quick help for urgent student questions.</span>
                  </div>
                  <div className="contact-highlight">
                    <strong>Easy Guidance</strong>
                    <span>Clear support for notes, PYQs, syllabus, and quantum.</span>
                  </div>
                  <div className="contact-highlight">
                    <strong>Multiple Channels</strong>
                    <span>WhatsApp, email, and Instagram in one place.</span>
                  </div>
                </div>
              </div>

              <div className="contact-panel">
                <div className="contact-method-card">
                  <span className="contact-method-label">WhatsApp</span>
                  <a
                    className="contact-method-value"
                    href={supportWhatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +91 9628305502
                  </a>
                  <p className="contact-method-meta">Best option for the quickest response.</p>
                </div>

                <div className="contact-method-card">
                  <span className="contact-method-label">Email</span>
                  <a
                    className="contact-method-value"
                    href={supportEmailComposeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {supportEmail}
                  </a>
                  <p className="contact-method-meta">
                    Browser me direct compose page open hoga for quick support.
                  </p>
                  <SupportEmailActions compact />
                </div>

                <div className="contact-method-card">
                  <span className="contact-method-label">Instagram</span>
                  <a
                    className="contact-method-value"
                    href={supportInstagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @studysathi
                  </a>
                  <p className="contact-method-meta">Follow updates, content drops, and announcements.</p>
                </div>

                <div className="contact-cta-card">
                  <p className="contact-cta-title">Start with a quick message</p>
                  <p className="muted">Tell us what you need and we will guide you to the right section.</p>
                  <div className="note-actions">
                    <a
                      href={supportWhatsappHref}
                      className="btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chat on WhatsApp
                    </a>
                    <SupportEmailActions />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default HomePage;

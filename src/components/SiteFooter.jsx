import { Link } from 'react-router-dom';
import { courseOptions } from '../utils/courseCatalog';
import { supportEmail, supportEmailComposeHref, supportWhatsappHref } from '../utils/supportLinks';

const platformLinks = [
  { label: 'Notes', href: '/notes/explore' },
  { label: 'PYQ', href: '/pyq' },
  { label: 'Syllabus', href: '/syllabus' },
  { label: 'Quantum', href: '/quantum' },
];

const supportLinks = [
  { label: 'Help Center', href: '/help' },
  { label: 'Contact Support', href: '/contact' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-shell">
          <div className="footer-cta">
            <div>
              <span className="footer-kicker">Student Help Desk</span>
              <h2>Need help finding the right notes or semester material?</h2>
              <p>
                Open the help center, message on WhatsApp, or explore your course library.
                StudySathi is designed to feel fast, clear, and reliable during exam time.
              </p>
            </div>
            <div className="note-actions footer-cta-actions">
              <Link to="/help" className="btn">Open Help Center</Link>
              <Link to="/contact" className="btn secondary">Talk to Support</Link>
            </div>
          </div>

          <div className="footer-grid">
            <div className="footer-column footer-brand-column">
              <Link to="/" className="footer-brand">StudySathi Pro</Link>
              <p className="footer-copy">
                A clean study platform for notes, PYQs, syllabus, quantum material,
                and student support across multiple courses.
              </p>
              <div className="footer-contact-list">
                <a href={supportEmailComposeHref} target="_blank" rel="noopener noreferrer">{supportEmail}</a>
                <a href={supportWhatsappHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp Support
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h3>Platform</h3>
              <div className="footer-links">
                {platformLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="footer-link">{link.label}</Link>
                ))}
              </div>
            </div>

            <div className="footer-column">
              <h3>Courses</h3>
              <div className="footer-links">
                {courseOptions.map((course) => (
                  <Link key={course.key} to={`/course/${course.key}`} className="footer-link">{course.title}</Link>
                ))}
              </div>
            </div>

            <div className="footer-column">
              <h3>Support & Legal</h3>
              <div className="footer-links">
                {supportLinks.map((link) => (
                  <Link key={link.href} to={link.href} className="footer-link">{link.label}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>Copyright 2026 StudySathi Pro. Built for students, exam prep, and semester support.</p>
            <p>Use the platform responsibly and review the terms and privacy pages for account and support details.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;

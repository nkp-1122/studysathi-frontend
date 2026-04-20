import { Link } from 'react-router-dom';
import BackIconLink from '../components/BackIconLink';
import SupportEmailActions from '../components/SupportEmailActions';
import { supportWhatsappHref } from '../utils/supportLinks';

const pageContent = {
  help: {
    tag: 'Help Center',
    title: 'Get study help without wasting time.',
    description:
      'Use this page when you need support with notes, PYQs, course navigation, missing files, login issues, or semester confusion.',
    sections: [
      {
        title: 'How to use StudySathi',
        points: [
          'Choose your course from the home page and open the correct year.',
          'Pick the resource type like Notes, PYQ, Syllabus, or Quantum.',
          'Select branch or semester where applicable, then open the material you need.',
        ],
      },
      {
        title: 'When to contact support',
        points: [
          'If the PDF link is missing, broken, or opening the wrong material.',
          'If you cannot find your semester, branch, or course section.',
          'If you have account issues like login, signup, or reset problems.',
        ],
      },
      {
        title: 'Fastest support options',
        points: [
          'WhatsApp is best for quick replies and urgent exam-time guidance.',
          'Email is better for formal requests, long messages, and file references.',
          'Instagram is useful for updates and general content announcements.',
        ],
      },
    ],
    sideTitle: 'Direct student support',
    sideCopy:
      'If you are stuck while browsing resources, reach out directly and mention your course, year, semester, and what you were trying to open.',
  },
  terms: {
    tag: 'Terms',
    title: 'Terms and conditions for using StudySathi.',
    description:
      'These terms explain how students should use the platform, how educational content is shared, and what is expected while using accounts and downloads.',
    sections: [
      {
        title: 'Platform use',
        points: [
          'StudySathi is intended for academic support, study access, and semester-related guidance.',
          'Users should not misuse the platform for spam, abuse, or harmful activity.',
          'Access to some uploads, admin tools, or support features may be limited by role.',
        ],
      },
      {
        title: 'Educational content',
        points: [
          'Notes, PYQs, syllabus, and quantum files are shared for learning and exam preparation.',
          'Users should verify course relevance before relying on any file for official academic submission.',
          'StudySathi may update, replace, remove, or reorganize content when needed.',
        ],
      },
      {
        title: 'Accounts and responsibility',
        points: [
          'Keep your login details safe and use correct information while creating an account.',
          'Do not attempt unauthorized access to admin-only or restricted sections.',
          'If you notice a problem or wrong content, contact support so it can be corrected quickly.',
        ],
      },
    ],
    sideTitle: 'Important note',
    sideCopy:
      'These terms are a platform-level guide for using StudySathi responsibly. For serious legal concerns, use the support email for clarification.',
  },
  privacy: {
    tag: 'Privacy',
    title: 'Privacy policy for accounts, support, and uploaded resources.',
    description:
      'This page explains what data may be collected, how it is used inside the platform, and how student-facing support information is handled.',
    sections: [
      {
        title: 'Information collected',
        points: [
          'Basic account details such as name, email, and login information may be stored for access control.',
          'Uploaded resource metadata like title, topic, course, branch, year, and semester may be saved to organize content.',
          'Support messages or inquiries may be used to respond and improve the platform experience.',
        ],
      },
      {
        title: 'How information is used',
        points: [
          'To show the right notes, PYQs, and academic material based on your navigation choices.',
          'To manage logins, admin uploads, and support communication.',
          'To improve usability, structure, and reliability of the student platform.',
        ],
      },
      {
        title: 'Data care and contact',
        points: [
          'StudySathi aims to keep stored information limited to what is needed for platform operation.',
          'If you want clarification about account-related information, contact the support email directly.',
          'Privacy practices may be updated as the platform grows and new features are added.',
        ],
      },
    ],
    sideTitle: 'Need clarification?',
    sideCopy:
      'If you have questions about account data, uploaded files, or support communication, use the help center or contact support directly.',
  },
};

function InfoPage({ variant = 'help' }) {
  const page = pageContent[variant] || pageContent.help;

  return (
    <section className="section info-page">
      <div className="container">
        <div className="year-resource-toolbar info-topbar">
          <span className="tag tag-accent">{page.tag}</span>
          <div className="semester-toolbar-actions">
            <BackIconLink to="/" label="Back to home" />
            <Link to="/contact" className="chip-btn">Contact Support</Link>
          </div>
        </div>

        <div className="info-hero-card">
          <span className="course-page-kicker">{page.tag}</span>
          <h1>{page.title}</h1>
          <p>{page.description}</p>
          <div className="note-actions">
            <Link to="/notes/explore" className="btn">Explore Notes</Link>
            <Link to="/help" className="btn secondary">Open Help Center</Link>
          </div>
        </div>

        <div className="info-page-grid">
          <div className="info-sections">
            {page.sections.map((section) => (
              <article key={section.title} className="info-section-card">
                <h3>{section.title}</h3>
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <aside className="info-side-card">
            <h3>{page.sideTitle}</h3>
            <p>{page.sideCopy}</p>
            <div className="info-side-links">
              <SupportEmailActions />
              <a
                href={supportWhatsappHref}
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Support
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default InfoPage;

import { Link } from 'react-router-dom';

function BackIconLink({ to, label = 'Go back' }) {
  return (
    <Link to={to} className="icon-nav-btn" aria-label={label} title={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-nav-arrow">
        <path d="M15 5L8 12L15 19" />
      </svg>
    </Link>
  );
}

export default BackIconLink;

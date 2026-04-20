import { supportEmailComposeHref } from '../utils/supportLinks';

function SupportEmailActions({ compact = false }) {
  return (
    <div className={`support-email-actions${compact ? ' compact' : ''}`}>
      <a
        href={supportEmailComposeHref}
        className={compact ? 'chip-btn' : 'btn secondary'}
        target="_blank"
        rel="noopener noreferrer"
      >
        Send Email
      </a>
    </div>
  );
}

export default SupportEmailActions;

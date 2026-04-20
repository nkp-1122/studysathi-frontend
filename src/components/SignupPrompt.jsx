import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const DISMISS_KEY = 'studysathi_signup_prompt_dismissed';
const hiddenPaths = new Set(['/login', '/signup', '/forgot-password']);

function readDismissedState() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  } catch (_error) {
    return false;
  }
}

function persistDismissedState() {
  try {
    sessionStorage.setItem(DISMISS_KEY, 'true');
  } catch (_error) {
    // Ignore session storage failures and keep UI functional.
  }
}

function SignupPrompt({ user }) {
  const { pathname } = useLocation();
  const [isDismissed, setIsDismissed] = useState(() => readDismissedState());
  const [isVisible, setIsVisible] = useState(false);

  const isHiddenRoute = hiddenPaths.has(pathname) || pathname.startsWith('/admin');
  const shouldPrompt = !user && !isDismissed && !isHiddenRoute;

  useEffect(() => {
    if (!shouldPrompt) {
      setIsVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => window.clearTimeout(timer);
  }, [shouldPrompt]);

  const dismissPrompt = () => {
    setIsVisible(false);
    setIsDismissed(true);
    persistDismissedState();
  };

  if (!shouldPrompt || !isVisible) {
    return null;
  }

  return (
    <aside className="signup-prompt" aria-label="Signup prompt">
      <button
        type="button"
        className="signup-prompt-close"
        onClick={dismissPrompt}
        aria-label="Close signup prompt"
      >
        x
      </button>
      <span className="signup-prompt-kicker">Join StudySathi</span>
      <h3>Free account bana lo</h3>
      <p>Signup karke apna study flow save karo aur platform ko better tarike se use karo.</p>
      <div className="signup-prompt-actions">
        <Link to="/signup" className="btn" onClick={dismissPrompt}>Signup</Link>
        <Link to="/login" className="btn secondary" onClick={dismissPrompt}>Login</Link>
      </div>
    </aside>
  );
}

export default SignupPrompt;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage({ onSuccess }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || ''),
    };

    if (!payload.email || !payload.password.trim()) {
      setMessage({ type: 'danger', text: 'Email and password are required.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/login', payload);
      setMessage({ type: 'success', text: 'Login successful. Redirecting...' });
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
      window.setTimeout(() => navigate(data?.user?.isAdmin ? '/admin' : '/'), 800);
    } catch (error) {
      const errorText = !error.response
        ? 'Server not running. Start backend with: npm --prefix backend start'
        : error.response?.data?.message || 'Login failed';

      setMessage({ type: 'danger', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-top-row">
            <Link to="/" className="back-link auth-back-link">Back to Home</Link>
            <span className="tag">StudySathi Login</span>
          </div>
          <h1>Welcome Back</h1>
          <p className="muted">Login to access admin upload and your student dashboard.</p>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required />
          </div>

          <p className="auth-switch"><Link to="/forgot-password">Forgot Password?</Link></p>

          <button className="btn auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          {message.text && <p className={message.type}>{message.text}</p>}

          <p className="auth-switch">Don't have an account? <Link to="/signup">Create one</Link></p>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;
